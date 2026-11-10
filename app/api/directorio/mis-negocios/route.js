import { NextResponse, after } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { d1Select, d1SelectOne, d1Execute } from "@/lib/db-d1";
import { isAdminServer } from "@/lib/auth/server-roles";
import { MAX_NEGOCIOS_POR_CUENTA } from "@/lib/directorio/constantes";
import {
  ErrorDirectorio,
  insertarNegocio,
  parsearFotos,
  validarNegocio,
} from "@/lib/directorio/negocios";
import { notifyNewDirectorio } from "@/lib/notificationService";

export const dynamic = "force-dynamic";

/*
 * Panel del dueño (/directorio/mis-negocios). Siempre actúa sobre las fichas de
 * la cuenta con sesión: el owner_id que mande el cliente se ignora.
 * Las fichas nuevas quedan 'pendiente' hasta que el admin las apruebe
 * (las del admin se publican directo).
 */

async function usuario() {
  const user = await currentUser().catch(() => null);
  if (!user) return null;
  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "",
    esAdmin: isAdminServer(user),
  };
}

const noAutenticado = () => NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });

function responderError(error, contexto) {
  if (error instanceof ErrorDirectorio) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(`Error en ${contexto}:`, error);
  return NextResponse.json({ error: "Ocurrió un error. Intenta de nuevo." }, { status: 500 });
}

// GET → { negocios: [...] } (todas las fichas de la cuenta, con su estado)
export async function GET() {
  try {
    const u = await usuario();
    if (!u) return noAutenticado();
    const filas = await d1Select(
      `SELECT * FROM directorio_negocios WHERE owner_id = ? ORDER BY created_at DESC`,
      [u.id]
    );
    return NextResponse.json({
      negocios: filas.map((f) => ({ ...f, fotos: parsearFotos(f.fotos) })),
    });
  } catch (error) {
    return responderError(error, "GET /api/directorio/mis-negocios");
  }
}

// POST → crea una ficha
export async function POST(request) {
  try {
    const u = await usuario();
    if (!u) return noAutenticado();

    const datos = validarNegocio(await request.json());

    if (!u.esAdmin) {
      const { n } = (await d1SelectOne(
        "SELECT COUNT(*) AS n FROM directorio_negocios WHERE owner_id = ?",
        [u.id]
      )) || { n: 0 };
      if (n >= MAX_NEGOCIOS_POR_CUENTA) {
        throw new ErrorDirectorio(`Puedes publicar hasta ${MAX_NEGOCIOS_POR_CUENTA} negocios por cuenta.`);
      }
    }

    const estado = u.esAdmin ? "aprobado" : "pendiente";
    const { id, slug } = await insertarNegocio(datos, {
      ownerId: u.id,
      ownerEmail: u.email,
      estado,
    });

    if (estado === "pendiente") {
      after(() => notifyNewDirectorio({ ...datos, slug, correo: u.email }));
    }
    return NextResponse.json({ id, slug, estado }, { status: 201 });
  } catch (error) {
    return responderError(error, "POST /api/directorio/mis-negocios");
  }
}

// PUT → edita una ficha propia. Si cambia nombre, descripción o imágenes
// vuelve a revisión; un cambio de teléfono, horario, etc. no.
export async function PUT(request) {
  try {
    const u = await usuario();
    if (!u) return noAutenticado();

    const body = await request.json();
    const actual = await d1SelectOne(
      "SELECT * FROM directorio_negocios WHERE id = ? AND owner_id = ?",
      [String(body.id || ""), u.id]
    );
    if (!actual) throw new ErrorDirectorio("No encontramos ese negocio en tu cuenta.", 404);

    const datos = validarNegocio(body);
    const requiereRevision =
      !u.esAdmin &&
      actual.estado === "aprobado" &&
      (datos.nombre !== actual.nombre ||
        datos.descripcion !== (actual.descripcion || "") ||
        datos.logo_url !== (actual.logo_url || "") ||
        JSON.stringify(datos.fotos) !== JSON.stringify(parsearFotos(actual.fotos)));

    // Si lo habían rechazado, al corregirlo vuelve a revisión.
    const estado = requiereRevision || actual.estado === "rechazado" ? "pendiente" : actual.estado;

    await d1Execute(
      `UPDATE directorio_negocios SET
         nombre=?, categoria=?, municipio=?, descripcion=?, telefono=?, whatsapp=?, direccion=?,
         horario=?, facebook=?, instagram=?, logo_url=?, fotos=?,
         estado=?, motivo_rechazo=?, updated_at=?
       WHERE id = ? AND owner_id = ?`,
      [
        datos.nombre, datos.categoria, datos.municipio, datos.descripcion, datos.telefono,
        datos.whatsapp, datos.direccion, datos.horario, datos.facebook,
        datos.instagram, datos.logo_url, JSON.stringify(datos.fotos),
        estado, estado === "pendiente" ? null : actual.motivo_rechazo, new Date().toISOString(),
        actual.id, u.id,
      ]
    );

    if (estado === "pendiente" && actual.estado !== "pendiente") {
      after(() => notifyNewDirectorio({ ...datos, slug: actual.slug, correo: u.email, edicion: true }));
    }
    return NextResponse.json({ ok: true, estado });
  } catch (error) {
    return responderError(error, "PUT /api/directorio/mis-negocios");
  }
}

// DELETE ?id= → elimina una ficha propia
export async function DELETE(request) {
  try {
    const u = await usuario();
    if (!u) return noAutenticado();
    const id = new URL(request.url).searchParams.get("id");
    await d1Execute("DELETE FROM directorio_negocios WHERE id = ? AND owner_id = ?", [id, u.id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return responderError(error, "DELETE /api/directorio/mis-negocios");
  }
}
