import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { d1Execute, d1SelectOne } from "@/lib/db-d1";
import { ErrorDirectorio } from "@/lib/directorio/negocios";
import { crearOferta, validarOferta } from "@/lib/directorio/ofertas";

export const dynamic = "force-dynamic";

const noAutenticado = () => NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });

function responderError(error, contexto) {
  if (error instanceof ErrorDirectorio) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(`Error en ${contexto}:`, error);
  return NextResponse.json({ error: "Ocurrió un error. Intenta de nuevo." }, { status: 500 });
}

// POST { negocio_id, titulo, descripcion?, imagen_url?, vence: "YYYY-MM-DD" }
// Las ofertas se publican al instante (si el negocio está publicado); el admin puede quitarlas.
export async function POST(request) {
  try {
    const user = await currentUser().catch(() => null);
    if (!user) return noAutenticado();

    const body = await request.json();
    const negocio = await d1SelectOne(
      "SELECT id, plan_hasta FROM directorio_negocios WHERE id = ? AND owner_id = ?",
      [String(body.negocio_id || ""), user.id]
    );
    if (!negocio) throw new ErrorDirectorio("No encontramos ese negocio en tu cuenta.", 404);

    const id = await crearOferta(negocio, validarOferta(body));
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return responderError(error, "POST /api/directorio/ofertas");
  }
}

// DELETE ?id= → quita una oferta propia
export async function DELETE(request) {
  try {
    const user = await currentUser().catch(() => null);
    if (!user) return noAutenticado();
    const id = new URL(request.url).searchParams.get("id");
    await d1Execute(
      `DELETE FROM directorio_ofertas WHERE id = ?
         AND negocio_id IN (SELECT id FROM directorio_negocios WHERE owner_id = ?)`,
      [id, user.id]
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return responderError(error, "DELETE /api/directorio/ofertas");
  }
}
