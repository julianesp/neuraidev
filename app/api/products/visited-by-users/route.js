import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/products/visited-by-users
 * Devuelve productos que han sido visitados por al menos 2 visitantes únicos
 * - Máximo 10 productos
 * - Si no hay productos con 2+ visitantes, devuelve array vacío
 */
export async function GET(request) {
  try {
    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (clientError) {
      console.error('[visited-by-users] Error al crear cliente Supabase:', clientError);
      return NextResponse.json(
        { success: false, products: [], error: 'Error de configuración de base de datos' },
        { status: 500 }
      );
    }

    const MIN_UNIQUE_VISITORS = 2;
    const MAX_PRODUCTS = 10;

    // Obtener todos los productos disponibles con su metadata
    const { data: products, error } = await supabase
      .from("products")
      .select(
        "id, nombre, precio, precio_oferta, imagenes, imagen_principal, stock, disponible, metadata, categoria, descripcion",
      )
      .eq("disponible", true)
      .gt("stock", 0);

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { success: false, products: [], error: error.message },
        { status: 500 },
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    // En ocasiones products puede venir "undefined" o no ser un array
    const productosArray = Array.isArray(products) ? products : [];

    // Filtrar productos con al menos 2 visitantes únicos
    const withEnoughVisitors = productosArray
      .map((p) => {
        // metadata puede ser null, un objeto o incluso una cadena JSON
        let count = 0;
        try {
          if (p && p.metadata != null) {
            const meta =
              typeof p.metadata === "string"
                ? JSON.parse(p.metadata)
                : p.metadata;
            count = meta?.unique_visitors_count || 0;
          }
        } catch (parseErr) {
          console.warn(
            "visited-by-users: metadata parse failed for product",
            p?.id,
            parseErr,
          );
          count = 0;
        }
        return { product: p, uniqueCount: count };
      })
      .filter(({ uniqueCount }) => uniqueCount >= MIN_UNIQUE_VISITORS)
      .sort((a, b) => b.uniqueCount - a.uniqueCount)
      .slice(0, MAX_PRODUCTS)
      .map(({ product }) => product);

    return NextResponse.json({
      success: true,
      products: withEnoughVisitors,
      count: withEnoughVisitors.length,
    });
  } catch (error) {
    console.error('[visited-by-users] Error inesperado:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { success: false, products: [], error: "Error interno del servidor", details: error.message },
      { status: 500 },
    );
  }
}
