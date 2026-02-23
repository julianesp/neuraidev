import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { notifyCartAbandoned } from "@/lib/n8nService";

/**
 * API para registrar carritos abandonados y notificar a n8n
 * POST /api/n8n/cart-abandoned
 *
 * Body: {
 *   sessionId: string,
 *   email?: string,
 *   name?: string,
 *   products: array,
 *   total: number
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, email, name, products, total } = body;

    if (!sessionId || !products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: "Se requieren sessionId y products" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Guardar carrito abandonado en la base de datos
    const { data: cart, error: cartError } = await supabase
      .from('abandoned_carts')
      .insert({
        session_id: sessionId,
        email: email || null,
        name: name || null,
        products,
        total,
        abandoned_at: new Date().toISOString(),
        status: 'abandoned',
      })
      .select()
      .single();

    if (cartError) {
      console.error("Error guardando carrito abandonado:", cartError);
      return NextResponse.json(
        { error: "Error guardando carrito", details: cartError.message },
        { status: 500 }
      );
    }

    // Notificar a n8n (esto dispara automatizaciones)
    await notifyCartAbandoned({
      sessionId,
      email,
      name,
      products,
      total,
    });

    return NextResponse.json({
      success: true,
      cartId: cart.id,
      message: "Carrito abandonado registrado y notificado a n8n",
    });

  } catch (error) {
    console.error("Error en /api/n8n/cart-abandoned:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
