import { NextResponse } from "next/server";
import { obtenerOfertaDeProducto } from "@/lib/supabase/ofertas";

/**
 * GET /api/ofertas/producto/[id]
 * Obtiene la oferta activa de un producto específico
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

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
