import { NextResponse } from "next/server";
import crypto from "crypto";
import { d1Select, d1SelectOne, d1Execute } from "@/lib/db-d1";
import { authenticateRequest } from "@/lib/auth/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/** Nombre visible del autor a partir del user de Clerk. */
function nombreAutor(user) {
  return (
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "Usuario"
  );
}

/**
 * GET /api/comentarios?productoId=...
 * Público: lista los comentarios de un producto (más recientes primero) y el
 * promedio de estrellas. No requiere sesión.
 * Devuelve { comentarios: [...], promedio: number, total: number }.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productoId = (searchParams.get("productoId") || "").trim();
    if (!productoId) {
      return NextResponse.json(
        { error: "Falta productoId" },
        { status: 400, headers: corsHeaders },
      );
    }

    const filas = await d1Select(
      `SELECT id, clerk_user_id, autor_nombre, autor_foto, rating, texto, created_at
         FROM comentarios
        WHERE producto_id = ?
        ORDER BY created_at DESC
        LIMIT 100`,
      [productoId],
    );

    const comentarios = (filas || []).map((c) => ({
      id: c.id,
      clerkUserId: c.clerk_user_id,
      autorNombre: c.autor_nombre,
      autorFoto: c.autor_foto || null,
      rating: Number(c.rating) || 0,
      texto: c.texto || "",
      fecha: c.created_at,
    }));

    const total = comentarios.length;
    const promedio =
      total > 0
        ? Math.round(
            (comentarios.reduce((s, c) => s + c.rating, 0) / total) * 10,
          ) / 10
        : 0;

    return NextResponse.json(
      { comentarios, promedio, total },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("[comentarios GET] error:", error);
    return NextResponse.json(
      { error: "Error consultando comentarios", comentarios: [], promedio: 0, total: 0 },
      { status: 500, headers: corsHeaders },
    );
  }
}

/**
 * POST /api/comentarios  body: { productoId, rating (1-5), texto }
 * Requiere sesión. Un usuario tiene UN comentario por producto: si ya existe,
 * se actualiza (upsert por UNIQUE(producto_id, clerk_user_id)).
 */
export async function POST(request) {
  try {
    const { userId, user } = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para comentar" },
        { status: 401, headers: corsHeaders },
      );
    }

    const body = await request.json().catch(() => ({}));
    const productoId = typeof body.productoId === "string" ? body.productoId.trim() : "";
    const rating = Math.round(Number(body.rating));
    const texto = typeof body.texto === "string" ? body.texto.trim().slice(0, 1000) : "";

    if (!productoId) {
      return NextResponse.json(
        { error: "Falta productoId" },
        { status: 400, headers: corsHeaders },
      );
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La calificación debe ser de 1 a 5 estrellas" },
        { status: 400, headers: corsHeaders },
      );
    }

    const nombre = nombreAutor(user);
    const foto = user?.imageUrl || null;
    const ahora = new Date().toISOString();

    // Upsert: si el usuario ya comentó este producto, actualiza rating/texto y
    // datos del autor; si no, inserta. Requiere UNIQUE(producto_id, clerk_user_id).
    await d1Execute(
      `INSERT INTO comentarios
         (id, producto_id, clerk_user_id, autor_nombre, autor_foto, rating, texto, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (producto_id, clerk_user_id) DO UPDATE SET
         autor_nombre = excluded.autor_nombre,
         autor_foto   = excluded.autor_foto,
         rating       = excluded.rating,
         texto        = excluded.texto,
         created_at   = excluded.created_at`,
      [crypto.randomUUID(), productoId, userId, nombre, foto, rating, texto, ahora],
    );

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("[comentarios POST] error:", error);
    return NextResponse.json(
      { error: "Error guardando el comentario" },
      { status: 500, headers: corsHeaders },
    );
  }
}

/**
 * DELETE /api/comentarios?id=...
 * Requiere sesión. Borra el comentario si el solicitante es su AUTOR o admin.
 */
export async function DELETE(request) {
  try {
    const { userId, isAdmin } = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401, headers: corsHeaders },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = (searchParams.get("id") || "").trim();
    if (!id) {
      return NextResponse.json(
        { error: "Falta id" },
        { status: 400, headers: corsHeaders },
      );
    }

    const fila = await d1SelectOne(
      "SELECT clerk_user_id FROM comentarios WHERE id = ?",
      [id],
    );
    if (!fila) {
      return NextResponse.json(
        { error: "Comentario no encontrado" },
        { status: 404, headers: corsHeaders },
      );
    }
    // Solo el autor o un admin pueden borrar.
    if (fila.clerk_user_id !== userId && !isAdmin) {
      return NextResponse.json(
        { error: "No puedes eliminar este comentario" },
        { status: 403, headers: corsHeaders },
      );
    }

    await d1Execute("DELETE FROM comentarios WHERE id = ?", [id]);

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("[comentarios DELETE] error:", error);
    return NextResponse.json(
      { error: "Error eliminando el comentario" },
      { status: 500, headers: corsHeaders },
    );
  }
}
