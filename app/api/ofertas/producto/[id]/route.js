import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/db";

async function obtenerOfertaDeProducto(productoId) {
  const db = getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data } = await db.from('ofertas').select('*').eq('activa', true).single();
  // Simple lookup — return first active offer that covers this product
  if (!data) return null;
  const ids = Array.isArray(data.productos_ids) ? data.productos_ids : JSON.parse(data.productos_ids || '[]');
  return ids.includes(productoId) ? data : null;
}

/**
 * GET /api/ofertas/producto/[id]
 * Obtiene la oferta activa de un producto específico
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const oferta = await obtenerOfertaDeProducto(id);

    return NextResponse.json({ oferta }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/ofertas/producto/[id]:", error);
    return NextResponse.json(
      { error: "Error obteniendo oferta del producto" },
      { status: 500 }
    );
  }
}
