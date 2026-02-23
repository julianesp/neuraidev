import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseClient } from "@/lib/db";
import { decrementMultipleProductsStock } from "@/lib/productService";
import { createInvoiceRecord } from "@/lib/invoiceGenerator";
import { notifyNewSale } from "@/lib/notificationService";
// DESHABILITADO TEMPORALMENTE - n8n integration
// import { notifyOrderPaid, notifyOrderCancelled } from "@/lib/n8nService";

// Solo loguear en desarrollo
const isDev = process.env.NODE_ENV === "development";
const log = (...args) => isDev && console.warn("[DEV]", ...args);
const logError = (...args) => console.error(...args);

/**
 * Webhook de confirmación de Wompi
 * POST /api/payments/confirmation
 *
 * Wompi enviará un evento cuando el estado de una transacción cambie.
 * Los eventos tienen la siguiente estructura:
 * {
 *   "event": "transaction.updated",
 *   "data": {
 *     "transaction": {
 *       "id": "25224-1593112289-49201",
 *       "status": "APPROVED",
 *       "reference": "MZQ3X2DE2SMX",
 *       "amount_in_cents": 4500000,
 *       "customer_email": "usuario@example.com",
 *       // ... más campos
 *     }
 *   },
 *   "sent_at": "2020-06-25T21:45:35.000Z",
 *   "timestamp": 1593118007,
 *   "signature": {
 *     "properties": ["transaction.id", "transaction.status", "transaction.amount_in_cents"],
 *     "checksum": "37c8407747e595..."
 *   }
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    log("🔔 Webhook de confirmación recibido");

    // Validar que sea un evento de Wompi verificando la firma
    const signature = body.signature;
    const eventData = body.data;
    const eventType = body.event;

    // Validar estructura del evento
    if (!eventData || !eventData.transaction) {
      logError("❌ Estructura de evento inválida");
      return NextResponse.json({ error: "Estructura inválida" }, { status: 400 });
    }

    const transaction = eventData.transaction;

    // Verificar firma de integridad
    if (signature && signature.checksum) {
      const integritySecret = process.env.WOMPI_EVENTS_SECRET || process.env.WOMPI_INTEGRITY_SECRET;

      if (integritySecret) {
        // Construir string para validar firma según las propiedades especificadas
        let signatureString = "";

        if (signature.properties && Array.isArray(signature.properties)) {
          signature.properties.forEach((prop) => {
            // Navegar por las propiedades anidadas (ej: "transaction.id")
            const value = prop.split('.').reduce((obj, key) => obj?.[key], body);
            signatureString += value || "";
          });
        }

        signatureString += integritySecret;

        const calculatedChecksum = crypto
          .createHash("sha256")
          .update(signatureString)
          .digest("hex");

        if (signature.checksum !== calculatedChecksum) {
          logError("❌ Firma inválida en webhook");
          // En desarrollo, solo advertir; en producción, rechazar
          if (!isDev) {
            return NextResponse.json({ error: "Firma inválida" }, { status: 403 });
          }
        } else {
          log("✅ Firma válida");
        }
      }
    }

    // Estados de transacción de Wompi:
    // "APPROVED" = Pago exitoso
    // "DECLINED" = Pago rechazado
    // "PENDING" = Pago pendiente (ej: PSE pendiente de confirmación bancaria)
    // "VOIDED" = Pago anulado
    // "ERROR" = Error en la transacción

    const transactionStatus = transaction.status;
    const transactionId = transaction.id;
    const reference = transaction.reference;

    const supabase = getSupabaseClient();

    if (transactionStatus === "APPROVED") {
      log("✅ Pago aprobado");

      // 1. Buscar la orden por referencia
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('numero_orden', reference)
        .single();

      if (orderError || !order) {
        logError("⚠️ Orden no encontrada para referencia:", reference);
        // Continuar de todas formas para no bloquear el webhook
      } else {
        log("📦 Orden encontrada:", order.numero_orden);

        // IMPORTANTE: Verificar si ya fue procesada para evitar duplicados
        if (order.estado === 'completado' || order.estado === 'pagado' || order.estado_pago === 'completado') {
          log("⚠️ Esta orden ya fue procesada anteriormente. Evitando duplicado.");
          return NextResponse.json({
            success: true,
            message: "Orden ya procesada anteriormente",
          });
        }

        // 2. Reducir el stock de cada producto
        const orderItems = order.metadata?.productos || order.productos || order.items;
        if (orderItems && Array.isArray(orderItems)) {
          log(`📦 Procesando ${orderItems.length} productos para descuento de stock`);

          // Usar el servicio centralizado para descontar stock
          const stockResult = await decrementMultipleProductsStock(orderItems);

          if (stockResult.success) {
            log("✅ Stock descontado exitosamente para todos los productos");

            // Registrar detalles de cada producto
            stockResult.results.forEach((result) => {
              if (result.success) {
                log(`  ✅ Producto ${result.productId}: ${result.previousStock} → ${result.newStock}`);
              } else {
                logError(`  ❌ Producto ${result.productId}: ${result.error}`);
              }
            });
          } else {
            logError("⚠️ Hubo errores al descontar el stock de algunos productos");

            // Loguear errores específicos
            stockResult.results.forEach((result) => {
              if (!result.success) {
                logError(`  ❌ Error en producto ${result.productId}:`, result.error);
              }
            });

            // Registrar en la orden que hubo problemas con el stock
            await supabase
              .from('orders')
              .update({
                notes: `ATENCIÓN: Algunos productos no pudieron actualizar su stock. Revisar manualmente.`,
                stock_update_errors: stockResult.results.filter(r => !r.success),
                updated_at: new Date().toISOString(),
              })
              .eq('invoice', reference);
          }
        } else {
          logError("⚠️ La orden no tiene items o no está en formato array");
        }

        // 3. Actualizar estado de la orden
        const { error: updateOrderError } = await supabase
          .from('orders')
          .update({
            estado: 'completado',
            estado_pago: 'completado',
            transaction_id: transactionId,
            informacion_pago: transaction,
            fecha_pago: new Date().toISOString(),
          })
          .eq('numero_orden', reference);

        if (updateOrderError) {
          logError("❌ Error actualizando orden", updateOrderError);
        } else {
          log("✅ Orden marcada como pagada");
        }

        // 4. Generar factura electrónica automáticamente
        try {
          log("📄 Generando factura electrónica...");

          // Verificar si ya existe una factura para esta orden
          const { data: existingInvoice } = await supabase
            .from('invoices')
            .select('invoice_number')
            .eq('order_reference', reference)
            .single();

          if (existingInvoice) {
            log("⚠️ La factura ya existe:", existingInvoice.invoice_number);
          } else {
            // Crear la factura
            const invoice = await createInvoiceRecord(supabase, order, transaction);
            log("✅ Factura electrónica generada:", invoice.invoice_number);
          }
        } catch (invoiceError) {
          // No bloqueamos el proceso si falla la factura, solo registramos el error
          logError("⚠️ Error generando factura electrónica:", invoiceError);
        }

        // 5. Enviar notificación al administrador vía Telegram
        try {
          log("📱 Enviando notificación de venta al administrador...");
          const notificationSent = await notifyNewSale(order, transaction);
          if (notificationSent) {
            log("✅ Notificación enviada exitosamente");
          }
        } catch (notificationError) {
          // No bloqueamos el proceso si falla la notificación
          logError("⚠️ Error enviando notificación:", notificationError);
        }

        // DESHABILITADO TEMPORALMENTE - n8n integration
        // 6. Enviar evento a n8n para automatizaciones
        // try {
        //   log("🤖 Enviando evento de pago aprobado a n8n...");
        //   await notifyOrderPaid(order, transaction);
        //   log("✅ Evento enviado a n8n exitosamente");
        // } catch (n8nError) {
        //   // No bloqueamos el proceso si falla n8n
        //   logError("⚠️ Error enviando evento a n8n:", n8nError);
        // }
      }

    } else if (transactionStatus === "DECLINED") {
      log("❌ Pago rechazado");

      // Buscar orden
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('numero_orden', reference)
        .single();

      // Actualizar orden como fallida
      await supabase
        .from('orders')
        .update({
          estado: 'cancelado',
          estado_pago: 'rechazado',
          transaction_id: transactionId,
          informacion_pago: transaction,
        })
        .eq('numero_orden', reference);

      // DESHABILITADO TEMPORALMENTE - n8n integration
      // Notificar a n8n del pago rechazado
      // if (order) {
      //   try {
      //     await notifyOrderCancelled(order, 'payment_declined');
      //   } catch (n8nError) {
      //     logError("⚠️ Error enviando evento a n8n:", n8nError);
      //   }
      // }

    } else if (transactionStatus === "PENDING") {
      log("⏳ Pago pendiente");

      // Actualizar orden como pendiente
      await supabase
        .from('orders')
        .update({
          estado: 'pendiente',
          estado_pago: 'pendiente',
          transaction_id: transactionId,
          informacion_pago: transaction,
        })
        .eq('numero_orden', reference);

    } else if (transactionStatus === "VOIDED") {
      log("🚫 Pago anulado");

      // Actualizar orden como anulada
      await supabase
        .from('orders')
        .update({
          estado: 'cancelado',
          estado_pago: 'anulado',
          transaction_id: transactionId,
          informacion_pago: transaction,
        })
        .eq('numero_orden', reference);

    } else if (transactionStatus === "ERROR") {
      log("💥 Error en pago");

      // Actualizar orden como fallida
      await supabase
        .from('orders')
        .update({
          estado: 'cancelado',
          estado_pago: 'error',
          transaction_id: transactionId,
          informacion_pago: transaction,
        })
        .eq('numero_orden', reference);
    }

    // Responder a Wompi que recibimos la confirmación
    return NextResponse.json({
      success: true,
      message: "Confirmación procesada",
    });

  } catch (error) {
    logError("❌ Error procesando confirmación:", error);
    return NextResponse.json(
      { error: "Error procesando confirmación", details: error.message },
      { status: 500 }
    );
  }
}

// Permitir GET para pruebas
export async function GET() {
  return NextResponse.json({
    message: "Webhook de confirmación de Wompi",
    status: "active",
    timestamp: new Date().toISOString(),
  });
}
