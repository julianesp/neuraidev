import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * POST /api/products/[id]/track-view
 * Incrementa el contador de vistas de un producto guardándolo en metadata.views_count
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Obtener el producto para leer metadata actual
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id, metadata")
      .eq("id", id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Incrementar views_count dentro del JSONB metadata
    const currentMetadata = product.metadata || {};
    const newViewsCount = (currentMetadata.views_count || 0) + 1;
    const newMetadata = { ...currentMetadata, views_count: newViewsCount };

    const { error: updateError } = await supabase
      .from("products")
      .update({ metadata: newMetadata })
      .eq("id", id);

    if (updateError) {
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
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
