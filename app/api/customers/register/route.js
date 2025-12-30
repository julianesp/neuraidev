import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * API Route para registrar cliente voluntariamente
 * POST /api/customers/register
 *
 * Body: { email, name, phone (opcional) }
 */
export async function POST(request) {
  try {
    const { email, name, phone } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Se requiere email y nombre" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El formato del email no es válido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Llamar a la función de Supabase para registrar cliente
    const { data, error } = await supabase
      .rpc('register_customer', {
        p_email: email,
        p_name: name,
        p_phone: phone || null
      });

    if (error) {
      console.error("Error registrando cliente:", error);
      return NextResponse.json(
        { error: "Error al registrar cliente", details: error.message },
        { status: 500 }
      );
    }

    const result = data[0];

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      customerId: result.customer_id,
      message: result.message
    }, { status: 201 });

  } catch (error) {
    console.error("Error en /api/customers/register:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Verificar si un email ya está registrado
 * GET /api/customers/register?email=example@email.com
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: "Se requiere email" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('customers')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error("Error verificando cliente:", error);
      return NextResponse.json(
        { error: "Error al verificar cliente", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      registered: !!data,
      customer: data || null
    });

  } catch (error) {
    console.error("Error en GET /api/customers/register:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
