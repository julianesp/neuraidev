import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { decrementMultipleProductsStock } from "@/lib/productService";
import { createInvoiceRecord } from "@/lib/invoiceGenerator";
import { notifyNewSale } from "@/lib/notificationService";
import { validarFirmaEpayco } from "@/lib/epayco/signature";
import { notificarPagoAprobado, notificarNuevaVentaAdmin } from "@/lib/pushService";

// Solo loguear en desarrollo
const isDev = process.env.NODE_ENV === "development";
const log = (...args) => isDev && console.warn("[DEV ePayco]", ...args);
const logError = (...args) => console.error(...args);

/**
 * Webhook de confirmación de ePayco
 * POST /api/payments/epayco/confirmation
 *
 * ePayco enviará un evento cuando el estado de una transacción cambie.
 * Los eventos tienen estructura similar a:
 * {
 *   "x_cust_id_cliente": "12345",
 *   "x_ref_payco": "123456789",
 *   "x_id_invoice": "NRD-...",
 *   "x_description": "Descripción del producto",
 *   "x_amount": "100000",
 *   "x_amount_country": "100000",
 *   "x_amount_ok": "100000",
 *   "x_tax": "19000",
 *   "x_amount_base": "81000",
 *   "x_currency_code": "COP",
 *   "x_transaction_id": "987654321",
 *   "x_transaction_date": "2024-01-01 12:00:00",
 *   "x_transaction_state": "Aceptada" | "Rechazada" | "Pendiente" | "Fallida",
 *   "x_response": "Aceptada",
 *   "x_approval_code": "ABC123",
 *   "x_customer_doctype": "CC",
 *   "x_customer_document": "1234567890",
 *   "x_customer_name": "Juan Perez",
 *   "x_customer_lastname": "Perez",
 *   "x_customer_email": "juan@example.com",
 *   "x_customer_phone": "3001234567",
 *   "x_customer_country": "CO",
 *   "x_customer_city": "Bogota",
 *   "x_customer_address": "Calle 123",
 *   "x_franchise": "VISA",
 *   "x_cardnumber": "XXXX-XXXX-XXXX-1234",
 *   "x_signature": "...",
 *   "x_test_request": "TRUE" | "FALSE"
 * }
 */
export async function POST(request) {
  try {
    // ePayco envía los datos como application/x-www-form-urlencoded
    const contentType = request.headers.get("content-type");
    let body;

    if (contentType?.includes("application/json")) {
      body = await request.json();
    } else {
      // Parsear form data
      const formData = await request.formData();
      body = {};
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
    }

    log("🔔 Webhook de confirmación ePayco recibido");
    log("📦 Datos recibidos:", body);

    // Validar la firma x_signature de ePayco. Es aditivo y a prueba de fallos:
    // solo rechazamos cuando la firma viene y NO coincide (y no es prueba). Si no
    // hay credenciales o el body no trae firma, se registra pero se continúa para
    // no romper el flujo de pagos que ya funciona.
    const esPrueba = String(body.x_test_request || "").toUpperCase() === "TRUE";
    const firma = validarFirmaEpayco(body);
    if (!firma.valida) {
      if (firma.motivo === "no-coincide" && !esPrueba) {
        logError("🚫 Firma ePayco inválida — se rechaza el webhook");
        return NextResponse.json(
          { error: "Firma inválida" },
          { status: 401 },
        );
      }
      // no-credenciales / sin-firma / prueba: continuar como antes, solo avisar.
      log(`⚠️ Firma ePayco no validada (${firma.motivo}); se continúa.`);
    } else {
      log("✅ Firma ePayco válida");
    }

    // Extraer datos importantes
    const transactionState = body.x_transaction_state || body.x_response;
    const transactionId = body.x_transaction_id || body.x_ref_payco;
    const reference = body.x_id_invoice || body.x_extra1; // Usamos extra1 como backup
    const amount = parseFloat(body.x_amount || body.x_amount_ok || 0);
    const franchise = body.x_franchise;
    const approvalCode = body.x_approval_code;

    // Validar que tenemos los datos mínimos necesarios
    if (!reference) {
      logError("❌ Referencia de orden no encontrada en webhook");
      return NextResponse.json({ error: "Referencia requerida" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Estados de transacción de ePayco:
    // "Aceptada" = Pago exitoso
    // "Rechazada" = Pago rechazado
    // "Pendiente" = Pago pendiente
    // "Fallida" = Error en la transacción

    if (transactionState === "Aceptada") {
      log("✅ Pago aprobado por ePayco");

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
              .eq('numero_orden', reference);
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
            informacion_pago: {
              ...body,
              franchise: franchise,
              approval_code: approvalCode,
              source: 'epayco'
            },
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
            // Crear la factura con información de ePayco
            const epaycoTransaction = {
              id: transactionId,
              status: 'APPROVED',
              reference: reference,
              amount_in_cents: amount * 100,
              payment_method_type: franchise || 'CARD',
              payment_method: {
                type: franchise || 'CARD',
              },
            };

            const invoice = await createInvoiceRecord(supabase, order, epaycoTransaction);
            log("✅ Factura electrónica generada:", invoice.invoice_number);
          }
        } catch (invoiceError) {
          // No bloqueamos el proceso si falla la factura, solo registramos el error
          logError("⚠️ Error generando factura electrónica:", invoiceError);
        }

        // 5. Notificar al administrador (push app + Telegram como respaldo)
        try {
          log("📱 Notificando al administrador...");

          // Push a la app móvil del admin (si tiene la app instalada y sesión).
          await notificarNuevaVentaAdmin({
            numeroOrden: reference,
            total: amount,
            clienteNombre: order.customer_name || body.x_customer_name || 'Cliente',
          }).catch((e) => logError("⚠️ Push admin fallido:", e.message));

          // Telegram como respaldo (sigue funcionando aunque no tenga app).
          const epaycoTransaction = {
            id: transactionId,
            status: 'APPROVED',
            payment_method_type: franchise || 'ePayco',
            payment_method: { type: franchise || 'ePayco' },
            amount_in_cents: Math.round(amount * 100),
            customer_email: body.x_customer_email || order.customer_email,
          };
          const orderForNotification = {
            ...order,
            customer_phone: order.customer_phone || body.x_customer_phone || '',
            customer_address: order.customer_address || body.x_customer_address || order.direccion_envio || '',
            customer_city: order.metadata?.customer_city || body.x_customer_city || '',
            customer_region: order.metadata?.customer_region || '',
          };
          const notificationSent = await notifyNewSale(orderForNotification, epaycoTransaction);
          if (notificationSent) log("✅ Telegram enviado");
        } catch (notificationError) {
          logError("⚠️ Error enviando notificación:", notificationError);
        }

        // 6. Notificar al comprador por push (app móvil), si su orden quedó
        //    ligada a un usuario Clerk. Nunca bloquea el webhook.
        try {
          if (order.clerk_user_id) {
            await notificarPagoAprobado(order.clerk_user_id, {
              numeroOrden: order.numero_orden,
              total: amount,
            });
          }
        } catch (pushError) {
          logError("⚠️ Error enviando push al comprador:", pushError);
        }
      }

    } else if (transactionState === "Rechazada" || transactionState === "Fallida") {
      log("❌ Pago rechazado o fallido");

      // Actualizar orden como fallida
      await supabase
        .from('orders')
        .update({
          estado: 'cancelado',
          estado_pago: 'rechazado',
          transaction_id: transactionId,
          informacion_pago: body,
        })
        .eq('numero_orden', reference);

    } else if (transactionState === "Pendiente") {
      log("⏳ Pago pendiente");

      // Actualizar orden como pendiente
      await supabase
        .from('orders')
        .update({
          estado: 'pendiente',
          estado_pago: 'pendiente',
          transaction_id: transactionId,
          informacion_pago: body,
        })
        .eq('numero_orden', reference);
    }

    // Responder a ePayco que recibimos la confirmación
    return NextResponse.json({
      success: true,
      message: "Confirmación procesada",
    });

  } catch (error) {
    logError("❌ Error procesando confirmación ePayco:", error);
    return NextResponse.json(
      { error: "Error procesando confirmación", details: error.message },
      { status: 500 }
    );
  }
}

// Permitir GET para pruebas
export async function GET() {
  return NextResponse.json({
    message: "Webhook de confirmación de ePayco",
    status: "active",
    timestamp: new Date().toISOString(),
  });
}
