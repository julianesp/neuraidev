import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { createEpaycoParams, EPAYCO_CONFIG } from '../../../../lib/epayco';

export async function POST(request) {
  try {
    const { pedidoNumero } = await request.json();

    if (!pedidoNumero) {
      return NextResponse.json({
        success: false,
        error: 'Número de pedido requerido'
      }, { status: 400 });
    }

    // Validar configuración de ePayco
    if (!EPAYCO_CONFIG.P_CUST_ID_CLIENTE || !EPAYCO_CONFIG.P_KEY || !EPAYCO_CONFIG.PRIVATE_KEY) {
      console.error('Configuración de ePayco incompleta');
      return NextResponse.json({
        success: false,
        error: 'Configuración de pagos incompleta'
      }, { status: 500 });
    }

    // Buscar el pedido
    const pedido = await prisma.pedido.findUnique({
      where: { numero: pedidoNumero },
      include: {
        items: {
          include: {
            producto: true
          }
        },
        direccionEnvio: true
      }
    });

    if (!pedido) {
      return NextResponse.json({
        success: false,
        error: 'Pedido no encontrado'
      }, { status: 404 });
    }

    if (pedido.estado !== 'PENDIENTE') {
      return NextResponse.json({
        success: false,
        error: 'El pedido ya ha sido procesado'
      }, { status: 400 });
    }

    // Crear descripción del pedido
    const descripcion = `Pedido ${pedidoNumero} - ${pedido.items.length} producto(s) - Neurai.dev`;

    // Obtener información del comprador
    const nombre = pedido.direccionEnvio?.nombre || 'Cliente Neurai.dev';
    const telefono = pedido.direccionEnvio?.telefono || '';
    const email = pedido.emailInvitado || 'cliente@neurai.dev';

    // Crear parámetros para ePayco
    const epaycoParams = createEpaycoParams({
      pedidoNumero: pedido.numero,
      total: pedido.total,
      email,
      nombre,
      telefono,
      descripcion
    });

    // Actualizar estado del pedido
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        estado: 'PENDIENTE_PAGO',
        metodoPago: 'EPAYCO'
      }
    });

    console.warn(`[EPAYCO] Creando pago para pedido ${pedidoNumero}, total: $${pedido.total}`);

    return NextResponse.json({
      success: true,
      paymentData: epaycoParams,
      pedido: {
        numero: pedido.numero,
        total: pedido.total,
        estado: 'PENDIENTE_PAGO'
      }
    });

  } catch (error) {
    console.error('Error creando pago ePayco:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}