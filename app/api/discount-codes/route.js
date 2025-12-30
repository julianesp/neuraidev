import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * API Route para gestionar códigos de descuento
 * GET /api/discount-codes - Obtener todos los códigos
 * POST /api/discount-codes - Crear nuevo código
 */

export async function GET(request) {
  try {
    const { userId } = await auth();

    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost = request.headers.get('host')?.includes('localhost') ||
                        request.headers.get('host')?.includes('127.0.0.1');

    if (!userId && !(isDev && isLocalhost)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    let query = supabase
      .from('discount_codes')
      .select('*, customers(id, name, email)')
      .order('created_at', { ascending: false });

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: discountCodes, error } = await query;

    if (error) {
      console.error("Error obteniendo códigos de descuento:", error);
      return NextResponse.json(
        { error: "Error obteniendo códigos", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      discountCodes,
    });

  } catch (error) {
    console.error("Error en /api/discount-codes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();

    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost = request.headers.get('host')?.includes('localhost') ||
                        request.headers.get('host')?.includes('127.0.0.1');

    if (!userId && !(isDev && isLocalhost)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      code,
      type,
      value,
      minPurchase = 0,
      maxUses = null,
      customerEmail = null,
      validFrom = null,
      validUntil = null,
      description = ''
    } = body;

    // Validaciones
    if (!code || !type || !value) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: code, type, value" },
        { status: 400 }
      );
    }

    if (!['percentage', 'fixed'].includes(type)) {
      return NextResponse.json(
        { error: "El tipo debe ser 'percentage' o 'fixed'" },
        { status: 400 }
      );
    }

    if (value <= 0) {
      return NextResponse.json(
        { error: "El valor debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Si se proporciona email, buscar o no asignar customer_id
    let customerId = null;
    if (customerEmail) {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (customer) {
        customerId = customer.id;
      }
    }

    // Crear código de descuento
    const { data, error } = await supabase
      .from('discount_codes')
      .insert({
        code: code.toUpperCase(),
        type,
        value,
        min_purchase: minPurchase,
        max_uses: maxUses,
        customer_id: customerId,
        customer_email: customerEmail,
        valid_from: validFrom,
        valid_until: validUntil,
        description,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error("Error creando código de descuento:", error);

      if (error.code === '23505') { // unique violation
        return NextResponse.json(
          { error: "Este código ya existe" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Error creando código", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      discountCode: data,
    }, { status: 201 });

  } catch (error) {
    console.error("Error en POST /api/discount-codes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Actualizar o eliminar código de descuento
 */
export async function PATCH(request) {
  try {
    const { userId } = await auth();

    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost = request.headers.get('host')?.includes('localhost') ||
                        request.headers.get('host')?.includes('127.0.0.1');

    if (!userId && !(isDev && isLocalhost)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { discountCodeId, status } = await request.json();

    if (!discountCodeId || !status) {
      return NextResponse.json(
        { error: "Se requiere discountCodeId y status" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('discount_codes')
      .update({ status })
      .eq('id', discountCodeId)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando código:", error);
      return NextResponse.json(
        { error: "Error actualizando código", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      discountCode: data,
    });

  } catch (error) {
    console.error("Error en PATCH /api/discount-codes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await auth();

    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost = request.headers.get('host')?.includes('localhost') ||
                        request.headers.get('host')?.includes('127.0.0.1');

    if (!userId && !(isDev && isLocalhost)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const discountCodeId = searchParams.get('id');

    if (!discountCodeId) {
      return NextResponse.json(
        { error: "Se requiere id del código" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', discountCodeId);

    if (error) {
      console.error("Error eliminando código:", error);
      return NextResponse.json(
        { error: "Error eliminando código", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Código eliminado exitosamente"
    });

  } catch (error) {
    console.error("Error en DELETE /api/discount-codes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
