import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * API Route para obtener todas las órdenes del dashboard
 * GET /api/dashboard/orders
 *
 * Requiere autenticación de administrador
 */
export async function GET(request) {
  try {
    // Verificar autenticación
    const { userId } = await auth();

    // TODO: Verificar que el usuario sea administrador
    // Por ahora, permitimos acceso si está autenticado O si viene desde localhost en desarrollo
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

    // Obtener todas las órdenes, ordenadas por fecha de creación (más recientes primero)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error obteniendo órdenes:", error);
      return NextResponse.json(
        { error: "Error obteniendo órdenes", details: error.message },
        { status: 500 }
      );
    }

    // Calcular estadísticas
    const stats = {
      total: orders.length,
      pendientes: orders.filter(o => o.estado === 'pendiente').length,
      enProceso: orders.filter(o => o.estado === 'en_proceso' || o.estado === 'proceso').length,
      completados: orders.filter(o => o.estado === 'completado').length,
      cancelados: orders.filter(o => o.estado === 'cancelado').length,
    };

    return NextResponse.json({
      success: true,
      orders,
      stats,
    });

  } catch (error) {
    console.error("Error en /api/dashboard/orders:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
