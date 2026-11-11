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
import { resumenPorNegocios } from "@/lib/directorio/stats";
import { productosPorNegocios } from "@/lib/directorio/productos";
import { ofertasPorNegocios } from "@/lib/directorio/ofertas";
import { notifyNewDirectorio } from "@/lib/notificationService";
import { FOTOS_GRATIS, FOTOS_PLAN, limiteFotos, limiteOfertas, limiteProductos, planActivo } from "@/lib/directorio/planes";

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
    const pagados = await d1Select(
      "SELECT negocio_id, COUNT(*) AS n FROM directorio_pagos WHERE owner_id = ? AND estado = 'aprobado' GROUP BY negocio_id",
      [u.id]
    );
    const conPago = new Set(pagados.map((p) => p.negocio_id));
    // Estadísticas: si la tabla aún no existe, el panel simplemente no las muestra.
    const stats = await resumenPorNegocios(filas.map((f) => f.id)).catch(() => ({}));
    const ofertas = await ofertasPorNegocios(filas.map((f) => f.id)).catch(() => ({}));
    const productos = await productosPorNegocios(filas.map((f) => f.id)).catch(() => ({}));
    return NextResponse.json({
      negocios: filas.map((f) => ({
        ...f,
        fotos: parsearFotos(f.fotos),
        plan_activo: planActivo(f.plan_hasta),
        en_prueba: planActivo(f.plan_hasta) && !conPago.has(f.id),
        limite_fotos: limiteFotos(f.plan_hasta),
        stats: stats[f.id] || null,
        ofertas: ofertas[f.id] || [],
        limite_ofertas: limiteOfertas(f.plan_hasta),
        productos: productos[f.id] || [],
        limite_productos: limiteProductos(f.plan_hasta),
      })),
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

    // Toda ficha nueva arranca con 30 días de prueba: hasta 15 fotos.
    const datos = validarNegocio(await request.json(), FOTOS_PLAN);

    if (!u.esAdmin) {
      const { n } = (await d1SelectOne(
        "SELECT COUNT(*) AS n FROM directorio_negocios WHERE owner_id = ?",
        [u.id]
      )) || { n: 0 };
      if (n >= MAX_NEGOCIOS_POR_CUENTA) {
        throw new ErrorDirectorio(`Puedes publicar hasta ${MAX_NEGOCIOS_POR_CUENTA} negocios por cuenta.`);
      }
    }

    // Publicación automática: no hay que esperar aprobación. El admin recibe un aviso y puede
    // suspender la ficha después si hace falta.
    const estado = "aprobado";
    const { id, slug } = await insertarNegocio(datos, {
      ownerId: u.id,
      ownerEmail: u.email,
      estado,
    });

    if (!u.esAdmin) {
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

    // Sin plan vigente no se pueden agregar fotos por encima de las 6 gratis
    // (se respetan las que ya tenía guardadas, que quedan ocultas al público).
    const existentes = parsearFotos(actual.fotos).length;
    const maxFotos = planActivo(actual.plan_hasta) ? FOTOS_PLAN : Math.max(FOTOS_GRATIS, existentes);
    const datos = validarNegocio(body, maxFotos);
    // Los cambios se publican al instante. Solo una ficha que el admin había rechazado
    // vuelve a revisión cuando el dueño la corrige.
    const estado = actual.estado === "rechazado" ? "pendiente" : actual.estado;

    await d1Execute(
      `UPDATE directorio_negocios SET
         nombre=?, categoria=?, municipio=?, descripcion=?, telefono=?, whatsapp=?, direccion=?,
         horario=?, facebook=?, instagram=?, logo_url=?, fotos=?, lat=?, lng=?,
         estado=?, motivo_rechazo=?, updated_at=?
       WHERE id = ? AND owner_id = ?`,
      [
        datos.nombre, datos.categoria, datos.municipio, datos.descripcion, datos.telefono,
        datos.whatsapp, datos.direccion, datos.horario, datos.facebook,
        datos.instagram, datos.logo_url, JSON.stringify(datos.fotos), datos.lat, datos.lng,
        estado, estado === "pendiente" ? null : actual.motivo_rechazo, new Date().toISOString(),
        actual.id, u.id,
      ]
    );

    if (estado === "pendiente" && actual.estado !== "pendiente") {
      after(() => notifyNewDirectorio({ ...datos, slug: actual.slug, correo: u.email, edicion: true, revision: true }));
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
    // Limpia lo que colgaba del negocio (si ya no existe el negocio, no queda nada que mostrar).
    await d1Execute("DELETE FROM directorio_productos WHERE negocio_id NOT IN (SELECT id FROM directorio_negocios)").catch(() => {});
    await d1Execute("DELETE FROM directorio_ofertas WHERE negocio_id NOT IN (SELECT id FROM directorio_negocios)").catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (error) {
    return responderError(error, "DELETE /api/directorio/mis-negocios");
  }
}
