import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { decrementMultipleProductsStock } from "@/lib/productService";
import { createInvoiceRecord } from "@/lib/invoiceGenerator";
import { notifyNewSale } from "@/lib/notificationService";

const isDev = process.env.NODE_ENV === "development";
const log = (...args) => isDev && console.log("[CHECK-PENDING]", ...args);
const logError = (...args) => console.error("[CHECK-PENDING]", ...args);

/**
 * API para verificar y actualizar el estado de pagos pendientes
 * GET /api/dashboard/check-pending-payments
 *
 * Este endpoint consulta todos los pedidos en estado "pendiente" en Supabase,
 * luego consulta su estado real en Wompi y actualiza según corresponda.
 */
export async function GET(request) {
  try {
    log("🔍 Iniciando verificación de pagos pendientes...");

    const supabase = getSupabaseClient();

    // 1. Obtener todos los pedidos pendientes
    const { data: pendingOrders, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("estado", "pendiente")
      .order("created_at", { ascending: false });

    if (fetchError) {
      logError("❌ Error obteniendo pedidos pendientes:", fetchError);
      return NextResponse.json(
        { error: "Error obteniendo pedidos" },
        { status: 500 }
      );
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      log("✅ No hay pedidos pendientes para verificar");
      return NextResponse.json({
        success: true,
        message: "No hay pedidos pendientes",
        checked: 0,
        updated: 0,
      });
    }

    log(`📦 Encontrados ${pendingOrders.length} pedidos pendientes`);

    const results = {
      checked: 0,
      updated: 0,
      approved: 0,
      declined: 0,
      errors: [],
    };

    // 2. Verificar cada pedido en Wompi
    for (const order of pendingOrders) {
      try {
        results.checked++;

        // Obtener el transaction_id del pedido
        const transactionId = order.transaction_id || order.informacion_pago?.id;

        if (!transactionId) {
          log(`⚠️ Pedido ${order.numero_orden} no tiene transaction_id`);
          results.errors.push({
            order: order.numero_orden,
            error: "Sin transaction_id",
          });
          continue;
        }

        log(`  Verificando transacción ${transactionId}...`);

        // 3. Consultar estado en Wompi
        const wompiResponse = await fetch(
          `https://production.wompi.co/v1/transactions/${transactionId}`
        );

        if (!wompiResponse.ok) {
          logError(`❌ Error consultando Wompi para ${transactionId}`);
          results.errors.push({
            order: order.numero_orden,
            error: "Error consultando Wompi",
          });
          continue;
        }

        const wompiData = await wompiResponse.json();
        const transaction = wompiData.data;
        const currentStatus = transaction.status;

        log(`  Estado actual en Wompi: ${currentStatus}`);

        // 4. Actualizar según el estado
        if (currentStatus === "APPROVED") {
          log(`  ✅ Pago APROBADO - Procesando...`);

          // Verificar si ya fue procesado
          if (
            order.estado === "completado" ||
            order.estado_pago === "completado"
          ) {
            log(`  ⚠️ Ya está marcado como completado, saltando...`);
            continue;
          }

          // Descontar stock
          const orderItems =
            order.metadata?.productos || order.productos || order.items;
          if (orderItems && Array.isArray(orderItems)) {
            const stockResult = await decrementMultipleProductsStock(orderItems);

            if (!stockResult.success) {
              logError(`  ⚠️ Errores al descontar stock`);
              await supabase
                .from("orders")
                .update({
                  notes: `ATENCIÓN: Algunos productos no pudieron actualizar su stock. Revisar manualmente.`,
                  stock_update_errors: stockResult.results.filter(
                    (r) => !r.success
                  ),
                })
                .eq("numero_orden", order.numero_orden);
            } else {
              log(`  ✅ Stock descontado exitosamente`);
            }
          }

          // Actualizar estado de la orden
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              estado: "completado",
              estado_pago: "completado",
              informacion_pago: transaction,
              fecha_pago: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("numero_orden", order.numero_orden);

          if (updateError) {
            logError(`  ❌ Error actualizando orden:`, updateError);
            results.errors.push({
              order: order.numero_orden,
              error: "Error actualizando estado",
            });
          } else {
            log(`  ✅ Orden actualizada a COMPLETADO`);
            results.updated++;
            results.approved++;

            // Generar factura si no existe
            try {
              const { data: existingInvoice } = await supabase
                .from("invoices")
                .select("invoice_number")
                .eq("order_reference", order.numero_orden)
                .single();

              if (!existingInvoice) {
                await createInvoiceRecord(supabase, order, transaction);
                log(`  ✅ Factura generada`);
              }
            } catch (invoiceError) {
              logError(`  ⚠️ Error generando factura:`, invoiceError);
            }

            // Enviar notificación
            try {
              await notifyNewSale(order, transaction);
              log(`  ✅ Notificación enviada`);
            } catch (notifError) {
              logError(`  ⚠️ Error enviando notificación:`, notifError);
            }
          }
        } else if (currentStatus === "DECLINED") {
          log(`  ❌ Pago RECHAZADO`);

          await supabase
            .from("orders")
            .update({
              estado: "cancelado",
              estado_pago: "rechazado",
              informacion_pago: transaction,
              updated_at: new Date().toISOString(),
            })
            .eq("numero_orden", order.numero_orden);

          results.updated++;
          results.declined++;
        } else if (currentStatus === "VOIDED") {
          log(`  🚫 Pago ANULADO`);

          await supabase
            .from("orders")
            .update({
              estado: "cancelado",
              estado_pago: "anulado",
              informacion_pago: transaction,
              updated_at: new Date().toISOString(),
            })
            .eq("numero_orden", order.numero_orden);

          results.updated++;
        } else if (currentStatus === "ERROR") {
          log(`  💥 Pago con ERROR`);

          await supabase
            .from("orders")
            .update({
              estado: "cancelado",
              estado_pago: "error",
              informacion_pago: transaction,
              updated_at: new Date().toISOString(),
            })
            .eq("numero_orden", order.numero_orden);

          results.updated++;
        } else {
          log(`  ⏳ Sigue PENDIENTE (${currentStatus})`);
        }
      } catch (orderError) {
        logError(
          `❌ Error procesando pedido ${order.numero_orden}:`,
          orderError
        );
        results.errors.push({
          order: order.numero_orden,
          error: orderError.message,
        });
      }
    }

    log("✅ Verificación completada");
    log(`  Total verificados: ${results.checked}`);
    log(`  Total actualizados: ${results.updated}`);
    log(`  Aprobados: ${results.approved}`);
    log(`  Rechazados: ${results.declined}`);

    return NextResponse.json({
      success: true,
      message: "Verificación completada",
      ...results,
    });
  } catch (error) {
    logError("❌ Error en verificación de pagos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
