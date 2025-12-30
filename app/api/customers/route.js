import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * API Route para obtener todos los clientes
 * GET /api/customers
 *
 * Query params opcionales:
 * - search: buscar por nombre o email
 * - sortBy: 'total_spent' | 'total_orders' | 'last_order_date'
 * - order: 'asc' | 'desc'
 */
export async function GET(request) {
  try {
    const { userId } = await auth();

    // Verificar autenticación (permitir en desarrollo desde localhost)
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

    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'last_order_date';
    const order = searchParams.get('order') || 'desc';

    // Construir query
    let query = supabase
      .from('customers')
      .select('*');

    // Aplicar búsqueda si existe
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Aplicar ordenamiento
    query = query.order(sortBy, { ascending: order === 'asc' });

    const { data: customers, error } = await query;

    if (error) {
      console.error("Error obteniendo clientes:", error);
      return NextResponse.json(
        { error: "Error obteniendo clientes", details: error.message },
        { status: 500 }
      );
    }

    // Calcular estadísticas
    const stats = {
      total: customers.length,
      totalRevenue: customers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0),
      averageOrderValue: customers.length > 0
        ? customers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0) /
          customers.reduce((sum, c) => sum + (c.total_orders || 0), 0)
        : 0,
      totalOrders: customers.reduce((sum, c) => sum + (c.total_orders || 0), 0),
    };

    return NextResponse.json({
      success: true,
      customers,
      stats,
    });

  } catch (error) {
    console.error("Error en /api/customers:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Actualizar notas de un cliente
 * PATCH /api/customers
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

    const { customerId, notes, status } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Se requiere customerId" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando cliente:", error);
      return NextResponse.json(
        { error: "Error actualizando cliente", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: data,
    });

  } catch (error) {
    console.error("Error en PATCH /api/customers:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
