import { NextResponse } from "next/server";
import { obtenerCampanasVigentes } from "@/lib/ofertas-server";

/**
 * GET /api/ofertas/producto/[id]
 * Devuelve la campaña vigente con mayor descuento que incluye al producto.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const campanas = await obtenerCampanasVigentes();
    const oferta =
      campanas
        .filter((c) => c.productos_ids.includes(String(id)))
        .sort((a, b) => b.porcentaje_descuento - a.porcentaje_descuento)[0] || null;

    return NextResponse.json({ oferta }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/ofertas/producto/[id]:", error);
    return NextResponse.json(
      { error: "Error obteniendo oferta del producto" },
      { status: 500 }
    );
  }
}
