import { NextResponse } from "next/server";
import { query } from "../../../../lib/db.js";
import crypto from 'crypto';

export async function POST(request) {
  try {
    // Los datos que envía ePayco en la confirmación
    const formData = await request.formData();
    
    const x_cust_id_cliente = formData.get('x_cust_id_cliente');
    const x_ref_payco = formData.get('x_ref_payco');
    const x_id_invoice = formData.get('x_id_invoice');
    const x_amount = formData.get('x_amount');
    const x_amount_country = formData.get('x_amount_country');
    const x_amount_ok = formData.get('x_amount_ok');
    const x_tax = formData.get('x_tax');
    const x_amount_base = formData.get('x_amount_base');
    const x_quotas = formData.get('x_quotas');
    const x_currency_code = formData.get('x_currency_code');
    const x_transaction_id = formData.get('x_transaction_id');
    const x_response = formData.get('x_response');
    const x_response_reason_text = formData.get('x_response_reason_text');
    const x_approval_code = formData.get('x_approval_code');
    const x_transaction_date = formData.get('x_transaction_date');
    const x_signature = formData.get('x_signature');

    // Log para debugging
    console.warn('Confirmación de pago recibida:', {
      x_id_invoice,
      x_ref_payco,
      x_response,
      x_amount,
      x_transaction_id
    });

    // Validar la firma (importante para seguridad)
    const expectedSignature = generateSignature({
      x_cust_id_cliente,
      x_ref_payco,
      x_amount,
      x_currency_code
    });

    if (x_signature !== expectedSignature) {
      console.error('Firma inválida en confirmación de pago');
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
    }

    // Buscar el pago por invoice ID
    const paymentResult = await query(
      'SELECT * FROM business_payments WHERE stripe_payment_intent_id = $1',
      [x_id_invoice]
    );

    if (paymentResult.rows.length === 0) {
      console.error('Pago no encontrado:', x_id_invoice);
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    const payment = paymentResult.rows[0];

    // Determinar el estado del pago
    let paymentStatus = 'failed';
    if (x_response === 'Aceptada' || x_response === '1') {
      paymentStatus = 'completed';
    } else if (x_response === 'Rechazada' || x_response === '2') {
      paymentStatus = 'failed';
    } else if (x_response === 'Pendiente' || x_response === '3') {
      paymentStatus = 'pending';
    }

    // Actualizar el pago
    await query(
      `UPDATE business_payments 
       SET status = $1, stripe_charge_id = $2, paid_at = $3 
       WHERE id = $4`,
      [
        paymentStatus,
        x_transaction_id,
        paymentStatus === 'completed' ? new Date() : null,
        payment.id
      ]
    );

    // Si el pago fue exitoso, activar la suscripción
    if (paymentStatus === 'completed') {
      // Buscar la suscripción pendiente
      const subscriptionResult = await query(
        'SELECT * FROM business_subscriptions WHERE business_id = $1 AND status = $2',
        [payment.business_id, 'pending']
      );

      if (subscriptionResult.rows.length > 0) {
        const subscription = subscriptionResult.rows[0];
        
        // Activar la suscripción
        await query(
          'UPDATE business_subscriptions SET status = $1 WHERE id = $2',
          ['active', subscription.id]
        );

        // Actualizar el estado del negocio (se mantendrá en trial hasta que termine)
        console.warn(`Suscripción activada para negocio ${payment.business_id}`);
      }

      console.warn(`Pago completado exitosamente: ${x_id_invoice}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Confirmación procesada" 
    });

  } catch (error) {
    console.error("Error procesando confirmación de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function generateSignature({ x_cust_id_cliente, x_ref_payco, x_amount, x_currency_code }) {
  // Generar la firma según la documentación de ePayco
  // Necesitarás tu clave privada de ePayco aquí
  const privateKey = process.env.EPAYCO_PRIVATE_KEY || "tu_clave_privada_epayco";
  
  const data = `${x_cust_id_cliente}^${privateKey}^${x_ref_payco}^${x_amount}^${x_currency_code}`;
  
  return crypto.createHash('sha256').update(data).digest('hex');
}