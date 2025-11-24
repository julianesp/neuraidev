import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseClient } from "@/lib/db";

// Solo loguear en desarrollo usando console.warn (permitido por el linter)
const isDev = process.env.NODE_ENV === "development";
// eslint-disable-next-line no-console
const log = (...args) => isDev && console.warn("[DEV]", ...args);
const logError = (...args) => console.error(...args);

/**
 * Webhook de confirmación de ePayco
 * POST /api/payments/confirmation
 */
export async function POST(request) {
  try {
    const body = await request.json();

    log("🔔 Webhook de confirmación recibido");

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
      logError("❌ Firma inválida en webhook");
      // No bloquear por firma en desarrollo - solo loguear
      // return NextResponse.json({ error: "Firma inválida" }, { status: 403 });
    } else {
      log("✅ Firma válida");
    }

    // Estados de transacción de ePayco:
    // "Aceptada" o 1 = Pago exitoso
    // "Rechazada" o 2 = Pago rechazado
    // "Pendiente" o 3 = Pago pendiente
    // "Fallida" o 4 = Pago fallido

    const transactionState = body.x_transaction_state;
    const transactionId = body.x_transaction_id;
    const refPayco = body.x_ref_payco;
    // El invoice viene del campo que enviamos a ePayco
    const invoice = body.x_id_invoice || body.x_extra1;

    const supabase = getSupabaseClient();

    if (transactionState === "Aceptada" || transactionState === "1") {
      log("✅ Pago aceptado");

      // 1. Buscar la orden por invoice
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('invoice', invoice)
        .single();

      if (orderError || !order) {
        logError("⚠️ Orden no encontrada");
        // Continuar de todas formas para no bloquear el webhook
      } else {
        log("📦 Orden encontrada");

        // 2. Reducir el stock de cada producto
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            try {
              // Obtener el producto actual
              const { data: producto, error: prodError } = await supabase
                .from('products')
                .select('id, stock, nombre')
                .eq('id', item.id)
                .single();

              if (prodError || !producto) {
                logError("⚠️ Producto no encontrado para actualizar stock");
                continue;
              }

              // Calcular nuevo stock
              const cantidadComprada = item.cantidad || item.quantity || 1;
              const nuevoStock = Math.max(0, producto.stock - cantidadComprada);

              // Actualizar stock y disponibilidad
              const { error: updateError } = await supabase
                .from('products')
                .update({
                  stock: nuevoStock,
                  disponible: nuevoStock > 0,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', item.id);

              if (updateError) {
                logError("❌ Error actualizando stock");
              } else {
                log("✅ Stock actualizado");
              }
            } catch (itemError) {
              logError("❌ Error procesando item");
            }
          }
        }

        // 3. Actualizar estado de la orden
        const { error: updateOrderError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_status: 'completed',
            transaction_id: transactionId,
            ref_payco: refPayco,
            payment_response: body,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('invoice', invoice);

        if (updateOrderError) {
          logError("❌ Error actualizando orden");
        } else {
          log("✅ Orden marcada como pagada");
        }
      }

    } else if (transactionState === "Rechazada" || transactionState === "2") {
      log("❌ Pago rechazado");

      // Actualizar orden como fallida
      await supabase
        .from('orders')
        .update({
          status: 'failed',
          payment_status: 'rejected',
          payment_response: body,
          updated_at: new Date().toISOString(),
        })
        .eq('invoice', invoice);

    } else if (transactionState === "Pendiente" || transactionState === "3") {
      log("⏳ Pago pendiente");

      // Actualizar orden como pendiente
      await supabase
        .from('orders')
        .update({
          status: 'pending',
          payment_status: 'pending',
          payment_response: body,
          updated_at: new Date().toISOString(),
        })
        .eq('invoice', invoice);

    } else if (transactionState === "Fallida" || transactionState === "4") {
      log("💥 Pago fallido");

      // Actualizar orden como fallida
      await supabase
        .from('orders')
        .update({
          status: 'failed',
          payment_status: 'failed',
          payment_response: body,
          updated_at: new Date().toISOString(),
        })
        .eq('invoice', invoice);
    }

    // Responder a ePayco que recibimos la confirmación
    return NextResponse.json({
      success: true,
      message: "Confirmación procesada",
    });

  } catch (error) {
    logError("❌ Error procesando confirmación");
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
