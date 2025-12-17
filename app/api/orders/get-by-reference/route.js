import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * API Route para obtener una orden por su referencia
 * GET /api/orders/get-by-reference?reference=NRD-xxxxx
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Se requiere el parámetro 'reference'" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Buscar la orden por referencia (numero_orden)
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("numero_orden", reference)
      .single();

    if (error) {
      console.error("Error consultando orden:", error);
      return NextResponse.json(
        { error: "Orden no encontrada", details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Error en get-by-reference:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
