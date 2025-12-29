import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * POST /api/products/[id]/track-view
 * Incrementa el contador de vistas de un producto
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Primero, obtener el producto actual para saber su views_count
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("views_count, id")
      .eq("id", id)
      .single();

    if (fetchError || !product) {
      console.error("Error fetching product:", fetchError);
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Incrementar el contador de vistas
    const newViewsCount = (product.views_count || 0) + 1;

    const { error: updateError } = await supabase
      .from("products")
      .update({
        views_count: newViewsCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating views count:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar contador de vistas" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      views_count: newViewsCount,
    });
  } catch (error) {
    console.error("Error in track-view endpoint:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
