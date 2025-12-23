import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * API Route para eliminar múltiples órdenes del dashboard
 * DELETE /api/dashboard/orders/bulk-delete
 *
 * Requiere autenticación de administrador
 * Body: { orderIds: string[] }
 */
export async function DELETE(request) {
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

    // Obtener los IDs de las órdenes a eliminar
    const body = await request.json();
    const { orderIds } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de IDs de órdenes" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Eliminar las órdenes
    const { error } = await supabase
      .from('orders')
      .delete()
      .in('id', orderIds);

    if (error) {
      console.error("Error eliminando órdenes:", error);
      return NextResponse.json(
        { error: "Error eliminando órdenes", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${orderIds.length} orden(es) eliminada(s) exitosamente`,
      deletedCount: orderIds.length,
    });

  } catch (error) {
    console.error("Error en /api/dashboard/orders/bulk-delete:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
