import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/products/most-visited
 * Obtiene los productos más visitados ordenados por views_count
 */
export async function GET(request) {
  try {
    const supabase = getSupabaseClient();

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    // Intentar consultar productos ordenados por views_count
    let { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("views_count", { ascending: false, nullsFirst: false })
      .limit(limit);

    // Si hay error (probablemente porque la columna no existe), usar fallback
    if (error) {
      console.warn("views_count column might not exist, using fallback:", error.message);

      // Fallback: Obtener productos destacados
      const { data: featuredProducts, error: featuredError } = await supabase
        .from("products")
        .select("*")
        .eq("destacado", true)
        .limit(limit);

      if (featuredError) {
        console.error("Error fetching featured products:", featuredError);

        // Último fallback: obtener cualquier producto
        const { data: anyProducts } = await supabase
          .from("products")
          .select("*")
          .limit(limit);

        return NextResponse.json({
          success: true,
          products: anyProducts || [],
          fallback: "random",
        });
      }

      return NextResponse.json({
        success: true,
        products: featuredProducts || [],
        fallback: "featured",
      });
    }

    // Si no hay productos con views_count, obtener productos destacados como fallback
    if (!products || products.length === 0) {
      const { data: featuredProducts } = await supabase
        .from("products")
        .select("*")
        .eq("destacado", true)
        .limit(limit);

      return NextResponse.json({
        success: true,
        products: featuredProducts || [],
        fallback: "featured",
      });
    }

    return NextResponse.json({
      success: true,
      products: products,
      fallback: null,
    });
  } catch (error) {
    console.error("Error in most-visited endpoint:", error);

    // Intentar devolver al menos algunos productos
    try {
      const supabase = getSupabaseClient();
      const { data: anyProducts } = await supabase
        .from("products")
        .select("*")
        .limit(6);

      return NextResponse.json({
        success: true,
        products: anyProducts || [],
        fallback: "error-recovery",
      });
    } catch (recoveryError) {
      return NextResponse.json(
        { error: "Error interno del servidor", products: [] },
        { status: 500 }
      );
    }
  }
}
