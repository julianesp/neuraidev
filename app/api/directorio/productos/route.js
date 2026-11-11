import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { d1Execute, d1SelectOne } from "@/lib/db-d1";
import { ErrorDirectorio } from "@/lib/directorio/negocios";
import { actualizarProducto, crearProducto, validarProducto } from "@/lib/directorio/productos";

export const dynamic = "force-dynamic";

const noAutenticado = () => NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });

function responderError(error, contexto) {
  if (error instanceof ErrorDirectorio) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(`Error en ${contexto}:`, error);
  return NextResponse.json({ error: "Ocurrió un error. Intenta de nuevo." }, { status: 500 });
}

// POST { negocio_id, nombre, precio?, descripcion?, imagen_url? }
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
    const id = await crearProducto(negocio, validarProducto(body));
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return responderError(error, "POST /api/directorio/productos");
  }
}

// PUT { id, nombre, precio?, descripcion?, imagen_url? } → edita un producto propio
export async function PUT(request) {
  try {
    const user = await currentUser().catch(() => null);
    if (!user) return noAutenticado();
    const body = await request.json();
    await actualizarProducto(String(body.id || ""), user.id, validarProducto(body));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return responderError(error, "PUT /api/directorio/productos");
  }
}

// PATCH { id, disponible: boolean } → marcar un producto como agotado / disponible
export async function PATCH(request) {
  try {
    const user = await currentUser().catch(() => null);
    if (!user) return noAutenticado();
    const { id, disponible } = await request.json();
    await d1Execute(
      `UPDATE directorio_productos SET disponible = ? WHERE id = ?
         AND negocio_id IN (SELECT id FROM directorio_negocios WHERE owner_id = ?)`,
      [disponible ? 1 : 0, String(id || ""), user.id]
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return responderError(error, "PATCH /api/directorio/productos");
  }
}

// DELETE ?id= → quita un producto propio
export async function DELETE(request) {
  try {
    const user = await currentUser().catch(() => null);
    if (!user) return noAutenticado();
    const id = new URL(request.url).searchParams.get("id");
    await d1Execute(
      `DELETE FROM directorio_productos WHERE id = ?
         AND negocio_id IN (SELECT id FROM directorio_negocios WHERE owner_id = ?)`,
      [id, user.id]
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return responderError(error, "DELETE /api/directorio/productos");
  }
}
