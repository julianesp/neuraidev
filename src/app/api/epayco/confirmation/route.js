import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { validateEpaycoResponse, mapEpaycoStateToInternal, EPAYCO_STATES } from '../../../../lib/epayco';

// Webhook de confirmación de ePayco
export async function POST(request) {
  try {
    const responseData = await request.json();

    console.warn('[EPAYCO CONFIRMATION] Datos recibidos:', responseData);

    const {
      x_cust_id_cliente,
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      x_signature,
      x_response,
      x_approval_code,
      x_transaction_date,
      x_cod_response
    } = responseData;

    // Validar firma
    const isValidSignature = validateEpaycoResponse(responseData);

    if (!isValidSignature) {
      console.error('[EPAYCO CONFIRMATION] Firma inválida');
      return NextResponse.json({
        success: false,
        error: 'Firma inválida'
      }, { status: 400 });
    }

    // Buscar el pedido
    const pedido = await prisma.pedido.findUnique({
      where: { numero: x_ref_payco }
    });

    if (!pedido) {
      console.error(`[EPAYCO CONFIRMATION] Pedido no encontrado: ${x_ref_payco}`);
      return NextResponse.json({
        success: false,
        error: 'Pedido no encontrado'
      }, { status: 404 });
    }

    // Mapear estado de ePayco a estado interno
    const nuevoEstado = mapEpaycoStateToInternal(x_cod_response);
    const estadoEpayco = EPAYCO_STATES[x_cod_response] || 'DESCONOCIDO';

    // Actualizar pedido
    const pedidoActualizado = await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        estado: nuevoEstado,
        transactionId: x_transaction_id,
        approvalCode: x_approval_code,
        transactionDate: x_transaction_date ? new Date(x_transaction_date) : new Date(),
        paymentResponse: JSON.stringify(responseData)
      }
    });

    console.warn(`[EPAYCO CONFIRMATION] Pedido ${x_ref_payco} actualizado:`, {
      estado: nuevoEstado,
      estadoEpayco,
      transactionId: x_transaction_id,
      amount: x_amount
    });

    // Si el pago fue exitoso, enviar notificación por email (opcional)
    if (nuevoEstado === 'PAGADO') {
      console.warn(`[EPAYCO CONFIRMATION] Pago exitoso para pedido ${x_ref_payco}`);
      // Aquí podrías agregar lógica para enviar emails de confirmación
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmación procesada',
      estado: nuevoEstado
    });

  } catch (error) {
    console.error('[EPAYCO CONFIRMATION] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error procesando confirmación'
    }, { status: 500 });
  }
}

// Permitir también GET para testing
export async function GET(request) {
  return NextResponse.json({
    message: 'Endpoint de confirmación ePayco activo',
    timestamp: new Date().toISOString()
  });
}