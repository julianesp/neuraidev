import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * API Route para validar un código de descuento
 * POST /api/discount-codes/validate
 *
 * Body: { code, customerEmail, orderTotal }
 */
export async function POST(request) {
  try {
    const { code, customerEmail, orderTotal } = await request.json();

    if (!code || !orderTotal) {
      return NextResponse.json(
        { error: "Se requiere code y orderTotal" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Usar la función de Supabase para validar
    const { data, error } = await supabase
      .rpc('validate_discount_code', {
        p_code: code.toUpperCase(),
        p_customer_email: customerEmail || null,
        p_order_total: orderTotal
      });

    if (error) {
      console.error("Error validando código:", error);
      return NextResponse.json(
        { error: "Error validando código", details: error.message },
        { status: 500 }
      );
    }

    const result = data[0];

    if (!result.valid) {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      discount: {
        id: result.discount_id,
        type: result.discount_type,
        value: result.discount_value,
        amount: result.discount_amount,
      },
      message: result.message
    });

  } catch (error) {
    console.error("Error en /api/discount-codes/validate:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
