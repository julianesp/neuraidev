import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/products/most-visited
 * Devuelve los productos con más visitas reales (metadata.views_count > 0).
 * - Mínimo 3 productos para devolver resultados.
 * - Máximo 10 productos.
 * - Sin fallbacks: si no hay suficientes visitas, devuelve lista vacía.
 */
export async function GET(request) {
  try {
    const supabase = getSupabaseClient();

    const MAX_PRODUCTS = 10;
    const MIN_PRODUCTS = 3;

    // Obtener todos los productos disponibles con su metadata
    const { data: products, error } = await supabase
      .from("products")
      .select("id, nombre, precio, precio_oferta, imagenes, imagen_principal, stock, disponible, metadata, categoria")
      .eq("disponible", true)
      .gt("stock", 0);

    if (error) {
      return NextResponse.json(
        { success: false, products: [], error: error.message },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    // Filtrar solo los que tienen visitas reales (views_count > 0 en metadata)
    const withViews = products
      .filter((p) => p.metadata?.views_count > 0)
      .sort((a, b) => (b.metadata?.views_count || 0) - (a.metadata?.views_count || 0))
      .slice(0, MAX_PRODUCTS);

    // Si hay menos del mínimo requerido, no mostrar la sección
    if (withViews.length < MIN_PRODUCTS) {
      return NextResponse.json({ success: true, products: [] });
    }

    return NextResponse.json({
      success: true,
      products: withViews,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, products: [], error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
