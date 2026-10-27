import { NextResponse } from "next/server";
import { obtenerServiciosActivos, conPreciosVigentes } from "@/lib/ofertas-server";
import { serviciosParaCategoria } from "@/lib/precios";
import { htmlToPlainText } from "@/utils/htmlToText";

export const dynamic = "force-dynamic";

// GET /api/productos/servicios?categoria=computadoras
// Servicios técnicos que se ofrecen en combo con productos de esa categoría
// (se configuran en el dashboard: producto de categoría "servicios").
export async function GET(request) {
  try {
    const categoria = new URL(request.url).searchParams.get("categoria") || "";
    const servicios = serviciosParaCategoria(await obtenerServiciosActivos(), categoria);
    const conPrecio = await conPreciosVigentes(servicios);
    return NextResponse.json({
      servicios: conPrecio.map((s) => ({
        id: s.id,
        nombre: s.nombre,
        descripcion: htmlToPlainText(s.descripcion || "", 180),
        precio: s.precio,
        precioAnterior: s.precioAnterior,
        imagen_principal: s.imagen_principal,
        stock: s.stock,
        categoria: "servicios",
      })),
    });
  } catch (error) {
    console.error("[productos/servicios]", error);
    return NextResponse.json({ servicios: [] }, { status: 500 });
  }
}
