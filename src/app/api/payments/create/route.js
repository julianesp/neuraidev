import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API para crear una orden de pago con ePayco
 * POST /api/payments/create
 *
 * Usa el método de link de pago directo de ePayco
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { cart, customer } = body;

    // Validar datos requeridos
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      );
    }

    if (!customer || !customer.email || !customer.name || !customer.phone) {
      return NextResponse.json(
        { error: 'Información del cliente incompleta' },
        { status: 400 }
      );
    }

    // Calcular total del carrito
    const total = cart.reduce((sum, item) => {
      const precio = item.precio || item.price || 0;
      const cantidad = item.cantidad || item.quantity || 1;
      return sum + (precio * cantidad);
    }, 0);

    // Validar que el monto sea mayor a 0
    if (total <= 0) {
      return NextResponse.json(
        { error: 'El monto total debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Generar número de factura único
    const invoice = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Crear descripción del pedido
    const description = cart.map(item =>
      `${item.cantidad}x ${item.nombre}`
    ).join(', ');

    // Guardar orden en Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        invoice,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_document: customer.document || null,
        items: cart,
        total,
        status: 'pending',
        payment_method: 'epayco',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Error al crear la orden' },
        { status: 500 }
      );
    }

    // Obtener la URL base
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Construir URL de pago de ePayco con todos los parámetros
    // Este es el método oficial de ePayco Standard Checkout
    const params = new URLSearchParams();

    // Credenciales
    params.append('public-key', process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY);

    // Información del producto/servicio
    params.append('name', 'Compra en Neurai Dev');
    params.append('description', description.length > 200 ? description.substring(0, 197) + '...' : description);
    params.append('invoice', invoice);
    params.append('currency', 'cop');
    params.append('amount', total.toString());
    params.append('tax-base', '0');
    params.append('tax', '0');
    params.append('country', 'co');
    params.append('lang', 'es');

    // URLs de respuesta
    params.append('external', 'false');
    params.append('response-url', `${baseUrl}/respuesta-pago`);
    params.append('confirmation-url', `${baseUrl}/api/payments/confirmation`);
    params.append('method-confirmation', 'GET');

    // Información del cliente
    params.append('name-billing', customer.name);
    params.append('address-billing', customer.address || 'Calle 1 # 1-1');
    params.append('type-doc-billing', customer.docType || 'CC');
    params.append('mobilephone-billing', customer.phone);
    params.append('number-doc-billing', customer.document || '1234567890');
    params.append('email-billing', customer.email);

    // Extras
    params.append('extra1', order.id);
    params.append('extra2', customer.email);
    params.append('extra3', invoice);

    // Modo test
    params.append('test', process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === 'true' ? 'true' : 'false');

    // Aceptación de términos
    params.append('acepted', 'true');
    params.append('acepted-terms-and-conditions', 'true');

    // Construir URL del widget de ePayco (el que SÍ acepta GET)
    const widgetParams = new URLSearchParams();
    widgetParams.append('public_key', process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY);
    widgetParams.append('amount', total.toString());
    widgetParams.append('name', 'Compra en Neurai Dev');
    widgetParams.append('description', description.length > 200 ? description.substring(0, 197) + '...' : description);
    widgetParams.append('invoice', invoice);
    widgetParams.append('currency', 'COP');
    widgetParams.append('country', 'CO');
    widgetParams.append('test', process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === 'true' ? 'true' : 'false');
    widgetParams.append('response_url', `${baseUrl}/respuesta-pago`);
    widgetParams.append('confirmation_url', `${baseUrl}/api/payments/confirmation`);
    widgetParams.append('name_billing', customer.name);
    widgetParams.append('address_billing', customer.address || 'Calle 1 # 1-1');
    widgetParams.append('type_doc_billing', customer.docType || 'CC');
    widgetParams.append('mobilephone_billing', customer.phone);
    widgetParams.append('number_doc_billing', customer.document || '1234567890');
    widgetParams.append('email_billing', customer.email);
    widgetParams.append('extra1', order.id);
    widgetParams.append('extra2', customer.email);
    widgetParams.append('extra3', invoice);

    // URL del widget de ePayco (este SÍ acepta GET)
    const paymentUrl = `https://secure.epayco.co/payco.php?${widgetParams.toString()}`;

    // Actualizar la orden con la referencia
    await supabase
      .from('orders')
      .update({
        ref_payco: invoice,
        payment_response: {
          method: 'widget_url',
          url: paymentUrl,
          created_at: new Date().toISOString()
        }
      })
      .eq('id', order.id);

    // Retornar URL directa
    return NextResponse.json({
      success: true,
      orderId: order.id,
      invoice,
      paymentUrl: paymentUrl,
      transactionId: invoice,
    });

  } catch (error) {
    console.error('❌ Error in payment creation:', error);
    return NextResponse.json(
      { error: 'Error al procesar el pago', details: error.message },
      { status: 500 }
    );
  }
}
