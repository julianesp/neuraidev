import { NextResponse } from "next/server";
import { obtenerProductosConOferta } from "@/lib/ofertas-server";

export const dynamic = "force-dynamic";

// GET /api/productos/ofertas
// Resumen para el banner de la home: cuántos lanzamientos y ofertas hay vigentes.
export async function GET() {
  try {
    const productos = await obtenerProductosConOferta();
    const lanzamientos = productos.filter((p) => p.ofertaTipo === "lanzamiento");
    const ofertas = productos.filter((p) => p.ofertaTipo === "oferta");
    const mayorDescuento = productos.reduce(
      (max, p) => Math.max(max, Math.round((1 - p.precio / p.precioAnterior) * 100)),
      0,
    );
    return NextResponse.json({
      total: productos.length,
      lanzamientos: lanzamientos.length,
      ofertas: ofertas.length,
      mayorDescuento,
      destacados: productos.slice(0, 3).map((p) => p.nombre),
    });
  } catch (error) {
    console.error("[productos/ofertas]", error);
    return NextResponse.json({ total: 0 }, { status: 500 });
  }
}
