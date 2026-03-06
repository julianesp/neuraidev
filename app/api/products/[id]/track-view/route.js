import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * POST /api/products/[id]/track-view
 * Incrementa el contador de vistas y trackea visitantes únicos por sessionID
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sessionId } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID requerido" },
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

    // Obtener metadata actual
    const currentMetadata = product.metadata || {};
    const visitors = currentMetadata.unique_visitors || [];
    const totalViews = (currentMetadata.views_count || 0) + 1;

    // Verificar si este visitante ya visitó este producto
    const isNewVisitor = !visitors.includes(sessionId);

    // Actualizar array de visitantes únicos
    const newVisitors = isNewVisitor
      ? [...visitors, sessionId]
      : visitors;

    // Actualizar metadata
    const newMetadata = {
      ...currentMetadata,
      views_count: totalViews,
      unique_visitors: newVisitors,
      unique_visitors_count: newVisitors.length,
    };

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
      views_count: totalViews,
      unique_visitors_count: newVisitors.length,
      is_new_visitor: isNewVisitor,
    });
  } catch (error) {
    console.error("Error en track-view:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
