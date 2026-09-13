import { NextResponse } from "next/server";
import { d1Select, d1Execute } from "@/lib/db-d1";
import { authenticateRequest } from "@/lib/auth/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/favoritos
 * Lista los productos favoritos del usuario autenticado. Requiere cuenta
 * (cookie de sesión web o token Bearer de Clerk desde la app móvil).
 *
 * Devuelve { favoritos: string[] } — solo los ids de producto, para que la app
 * los cruce con su catálogo ya cargado sin traer datos duplicados.
 */
export async function GET(request) {
  try {
    const { userId } = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401, headers: corsHeaders },
      );
    }

    const filas = await d1Select(
      "SELECT producto_id FROM favoritos WHERE clerk_user_id = ? ORDER BY created_at DESC",
      [userId],
    );

    return NextResponse.json(
      { favoritos: filas.map((f) => f.producto_id) },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("[favoritos GET] error:", error);
    return NextResponse.json(
      { error: "Error consultando favoritos" },
      { status: 500, headers: corsHeaders },
    );
  }
}

/**
 * POST /api/favoritos  body: { productoId: string }
 * Marca un producto como favorito. Idempotente: el UNIQUE(clerk_user_id,
 * producto_id) hace que marcar dos veces no cree duplicados (INSERT OR IGNORE).
 */
export async function POST(request) {
  try {
    const { userId } = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401, headers: corsHeaders },
      );
    }

    const body = await request.json().catch(() => ({}));
    const productoId = typeof body.productoId === "string" ? body.productoId.trim() : "";
    if (!productoId) {
      return NextResponse.json(
        { error: "Falta productoId" },
        { status: 400, headers: corsHeaders },
      );
    }

    await d1Execute(
      "INSERT OR IGNORE INTO favoritos (id, clerk_user_id, producto_id, created_at) VALUES (?, ?, ?, ?)",
      [crypto.randomUUID(), userId, productoId, new Date().toISOString()],
    );

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("[favoritos POST] error:", error);
    return NextResponse.json(
      { error: "Error guardando favorito" },
      { status: 500, headers: corsHeaders },
    );
  }
}

/**
 * DELETE /api/favoritos?productoId=...
 * Quita un producto de favoritos del usuario autenticado.
 */
export async function DELETE(request) {
  try {
    const { userId } = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401, headers: corsHeaders },
      );
    }

    const { searchParams } = new URL(request.url);
    const productoId = (searchParams.get("productoId") || "").trim();
    if (!productoId) {
      return NextResponse.json(
        { error: "Falta productoId" },
        { status: 400, headers: corsHeaders },
      );
    }

    await d1Execute(
      "DELETE FROM favoritos WHERE clerk_user_id = ? AND producto_id = ?",
      [userId, productoId],
    );

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("[favoritos DELETE] error:", error);
    return NextResponse.json(
      { error: "Error eliminando favorito" },
      { status: 500, headers: corsHeaders },
    );
  }
}
