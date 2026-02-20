import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth/roles';

/**
 * POST /api/nequi/confirm-order
 * Confirma un pedido Nequi y descuenta el stock
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
        { error: 'No autorizado. Solo administradores pueden confirmar pedidos.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

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

    // Usar la función RPC para decrementar stock y confirmar
    const { data, error: rpcError } = await supabase.rpc('decrementar_stock_nequi', {
      pedido_id: orderId
    });

    if (rpcError) {
      console.error('[API] Error en RPC decrementar_stock_nequi:', rpcError);

      // Fallback: hacerlo manualmente si la función RPC no existe
      if (rpcError.code === '42883') { // Function not found
        console.log('[API] RPC no disponible, decrementando stock manualmente...');

        // Decrementar stock manualmente
        for (const producto of order.productos) {
          const { error: updateError } = await supabase
            .from('products')
            .update({
              stock: supabase.rpc('greatest', [0, supabase.raw('stock - ?', [producto.cantidad])])
            })
            .eq('id', producto.id);

          if (updateError) {
            console.error(`[API] Error actualizando stock de ${producto.id}:`, updateError);
          }
        }

        // Actualizar estado del pedido manualmente
        const { error: updateOrderError } = await supabase
          .from('nequi_orders')
          .update({
            estado: 'confirmado',
            confirmed_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (updateOrderError) {
          return NextResponse.json(
            { error: 'Error al confirmar pedido', details: updateOrderError.message },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Error al confirmar pedido', details: rpcError.message },
          { status: 500 }
        );
      }
    }

    console.log(`[API] ✅ Pedido Nequi confirmado: ${order.numero_factura}`);

    // Opcional: Enviar email de confirmación al cliente
    // TODO: Implementar envío de email de confirmación

    return NextResponse.json({
      success: true,
      message: 'Pedido confirmado y stock descontado exitosamente',
      order: {
        ...order,
        estado: 'confirmado',
        confirmed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[API] Error in confirm-order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
