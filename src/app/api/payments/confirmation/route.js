import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Webhook de confirmación de pago de ePayco
 * GET /api/payments/confirmation
 *
 * Este endpoint es llamado por ePayco cuando se procesa un pago
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Obtener parámetros enviados por ePayco
    const ref_payco = searchParams.get('ref_payco');
    const x_transaction_id = searchParams.get('x_transaction_id');
    const x_amount = searchParams.get('x_amount');
    const x_currency_code = searchParams.get('x_currency_code');
    const x_signature = searchParams.get('x_signature');
    const x_approval_code = searchParams.get('x_approval_code');
    const x_response = searchParams.get('x_response');
    const x_response_reason_text = searchParams.get('x_response_reason_text');
    const x_cod_transaction_state = searchParams.get('x_cod_transaction_state');
    const x_transaction_state = searchParams.get('x_transaction_state');
    const x_invoice = searchParams.get('x_extra3'); // Número de factura
    const x_order_id = searchParams.get('x_extra1'); // ID de la orden en nuestra DB

    // Payment confirmation received (removed console.log for production)

    // Validar que los parámetros requeridos existan
    if (!ref_payco || !x_transaction_id) {
      console.error('Missing required parameters');
      return NextResponse.json(
        { error: 'Parámetros requeridos faltantes' },
        { status: 400 }
      );
    }

    // Inicializar Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Determinar el estado del pago
    let paymentStatus = 'failed';
    let orderStatus = 'failed';

    // Códigos de estado de ePayco:
    // 1 = Aceptada
    // 2 = Rechazada
    // 3 = Pendiente
    // 4 = Fallida
    switch (x_cod_transaction_state) {
      case '1':
        paymentStatus = 'approved';
        orderStatus = 'paid';
        break;
      case '2':
        paymentStatus = 'rejected';
        orderStatus = 'failed';
        break;
      case '3':
        paymentStatus = 'pending';
        orderStatus = 'pending';
        break;
      case '4':
        paymentStatus = 'failed';
        orderStatus = 'failed';
        break;
      default:
        paymentStatus = 'unknown';
        orderStatus = 'pending';
    }

    // Actualizar la orden en la base de datos
    if (x_order_id) {
      const { data: order, error: updateError } = await supabase
        .from('orders')
        .update({
          status: orderStatus,
          payment_status: paymentStatus,
          transaction_id: x_transaction_id,
          ref_payco: ref_payco,
          payment_response: {
            transaction_id: x_transaction_id,
            approval_code: x_approval_code,
            response: x_response,
            response_reason: x_response_reason_text,
            transaction_state: x_transaction_state,
            amount: x_amount,
            currency: x_currency_code,
            signature: x_signature,
            updated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', x_order_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating order:', updateError);
      } else {
        // Order updated successfully

        // Si el pago fue aprobado, actualizar el stock de los productos
        if (paymentStatus === 'approved' && order.items) {
          for (const item of order.items) {
            const { error: stockError } = await supabase
              .from('products')
              .update({
                stock: supabase.raw(`stock - ${item.cantidad}`)
              })
              .eq('id', item.id)
              .gte('stock', item.cantidad);

            if (stockError) {
              console.error(`Error updating stock for product ${item.id}:`, stockError);
            }
          }
        }
      }
    }

    // Responder a ePayco (deben recibir un 200 OK)
    return NextResponse.json({
      success: true,
      message: 'Confirmación procesada correctamente',
      status: paymentStatus
    });

  } catch (error) {
    console.error('Error processing payment confirmation:', error);
    return NextResponse.json(
      { error: 'Error al procesar la confirmación', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * También soportar POST para confirmaciones
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Payment confirmation received via POST (removed console.log for production)

    const {
      ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      x_signature,
      x_approval_code,
      x_response,
      x_response_reason_text,
      x_cod_transaction_state,
      x_transaction_state,
      x_extra1: x_order_id,
      x_extra3: x_invoice
    } = body;

    // Reutilizar la misma lógica que GET
    const searchParams = new URLSearchParams({
      ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      x_signature,
      x_approval_code,
      x_response,
      x_response_reason_text,
      x_cod_transaction_state,
      x_transaction_state,
      x_extra1: x_order_id,
      x_extra3: x_invoice
    });

    const url = new URL(request.url);
    url.search = searchParams.toString();

    const mockRequest = { url: url.toString() };
    return await GET(mockRequest);

  } catch (error) {
    console.error('Error processing POST confirmation:', error);
    return NextResponse.json(
      { error: 'Error al procesar la confirmación', details: error.message },
      { status: 500 }
    );
  }
}
