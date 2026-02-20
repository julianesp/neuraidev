import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth/roles';

/**
 * POST /api/nequi/cancel-order
 * Cancela un pedido Nequi pendiente
 * Solo accesible para administradores
 */
export async function POST(request) {
  try {
    // Verificar autenticación y permisos de admin
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const userIsAdmin = await isAdmin(user);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden cancelar pedidos.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Se requiere orderId' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Obtener el pedido
    const { data: order, error: fetchError } = await supabase
      .from('nequi_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que esté pendiente
    if (order.estado !== 'pendiente') {
      return NextResponse.json(
        { error: `El pedido ya está ${order.estado}` },
        { status: 400 }
      );
    }

    // Cancelar pedido
    const { error: updateError } = await supabase
      .from('nequi_orders')
      .update({
        estado: 'cancelado'
      })
      .eq('id', orderId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al cancelar pedido', details: updateError.message },
        { status: 500 }
      );
    }

    console.log(`[API] ❌ Pedido Nequi cancelado: ${order.numero_factura}${reason ? ` - Razón: ${reason}` : ''}`);

    // Opcional: Enviar email de cancelación al cliente
    // TODO: Implementar envío de email de cancelación

    return NextResponse.json({
      success: true,
      message: 'Pedido cancelado exitosamente'
    });

  } catch (error) {
    console.error('[API] Error in cancel-order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
