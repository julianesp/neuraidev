import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Webhook de confirmación de ePayco
 * POST /api/payments/confirmation
 *
 * ePayco envía la confirmación del pago a esta URL
 */
export async function POST(request) {
  try {
    const body = await request.json();

    console.log("🔔 Webhook de confirmación recibido:", {
      ref_payco: body.x_ref_payco,
      transaction_id: body.x_transaction_id,
      amount: body.x_amount,
      currency: body.x_currency_code,
      signature: body.x_signature,
      approval_code: body.x_approval_code,
      transaction_state: body.x_transaction_state,
      response: body.x_response,
    });

    // Validar que sea de ePayco verificando la firma
    const signature = body.x_signature;
    const custId = process.env.EPAYCO_CUST_ID;
    const privateKey = process.env.EPAYCO_PRIVATE_KEY;

    // Construir firma para validar
    const signatureString = `${custId}^${privateKey}^${body.x_ref_payco}^${body.x_transaction_id}^${body.x_amount}^${body.x_currency_code}`;

    // Calcular SHA256 para validar firma
    const calculatedSignature = crypto
      .createHash("sha256")
      .update(signatureString)
      .digest("hex");

    if (signature !== calculatedSignature) {
      console.error("❌ Firma inválida. Posible intento de fraude.");
      console.error("Firma recibida:", signature);
      console.error("Firma calculada:", calculatedSignature);
      return NextResponse.json(
        { error: "Firma inválida" },
        { status: 403 }
      );
    }

    console.log("✅ Firma válida");

    // Estados de transacción de ePayco:
    // 1 = Aceptada
    // 2 = Rechazada
    // 3 = Pendiente
    // 4 = Fallida

    const transactionState = body.x_transaction_state;
    const transactionId = body.x_transaction_id;
    const refPayco = body.x_ref_payco;
    const amount = body.x_amount;
    const invoice = body.x_extra1 || body.x_id_invoice;

    if (transactionState === "Aceptada") {
      console.log("✅ Pago aceptado:", {
        transactionId,
        refPayco,
        amount,
        invoice,
      });

      // Aquí puedes:
      // 1. Actualizar el estado del pedido en tu base de datos
      // 2. Enviar email de confirmación al cliente
      // 3. Actualizar inventario
      // 4. Generar factura

      // TODO: Implementar lógica de negocio para pago exitoso
      // Por ejemplo, guardar en Supabase:
      /*
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      await supabase.from('orders').update({
        payment_status: 'paid',
        payment_ref: refPayco,
        transaction_id: transactionId,
        paid_at: new Date().toISOString()
      }).eq('invoice', invoice);
      */

    } else if (transactionState === "Rechazada") {
      console.log("❌ Pago rechazado:", {
        transactionId,
        refPayco,
        reason: body.x_response_reason_text,
      });

      // TODO: Marcar pedido como fallido
    } else if (transactionState === "Pendiente") {
      console.log("⏳ Pago pendiente:", {
        transactionId,
        refPayco,
      });

      // TODO: Marcar pedido como pendiente
    }

    // Responder a ePayco que recibimos la confirmación
    return NextResponse.json({
      success: true,
      message: "Confirmación procesada",
    });

  } catch (error) {
    console.error("❌ Error procesando confirmación:", error);
    return NextResponse.json(
      { error: "Error procesando confirmación" },
      { status: 500 }
    );
  }
}

// Permitir GET para pruebas
export async function GET() {
  return NextResponse.json({
    message: "Webhook de confirmación de ePayco",
    status: "active",
  });
}
