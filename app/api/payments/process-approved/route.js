import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { decrementMultipleProductsStock } from "@/lib/productService";
import { createInvoiceRecord } from "@/lib/invoiceGenerator";
import { notifyNewSale } from "@/lib/notificationService";

// Solo loguear en desarrollo
const isDev = process.env.NODE_ENV === "development";
const log = (...args) => isDev && console.warn("[DEV]", ...args);
const logError = (...args) => console.error(...args);

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * API Route para procesar un pago aprobado inmediatamente
 * POST /api/payments/process-approved
 *
 * Este endpoint es llamado desde el frontend cuando un pago es aprobado
 * para descontar el stock inmediatamente sin esperar al webhook de Wompi
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { transactionId, reference } = body;

    if (!transactionId || !reference) {
      return NextResponse.json(
        { error: "Faltan datos: transactionId y reference son requeridos" },
        { status: 400 }
      );
    }

    log("🔔 Procesando pago aprobado inmediatamente");
    log("  Transaction ID:", transactionId);
    log("  Reference:", reference);

    const supabase = getSupabaseClient();

    // 1. Buscar la orden por referencia
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("numero_orden", reference)
      .single();

    if (orderError || !order) {
      logError("⚠️ Orden no encontrada para referencia:", reference);
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    log("📦 Orden encontrada:", order.numero_orden);

    // IMPORTANTE: Verificar si ya fue procesada para evitar duplicados
    if (
      order.estado === "completado" ||
      order.estado === "pagado" ||
      order.estado_pago === "completado"
    ) {
      log("⚠️ Esta orden ya fue procesada anteriormente. Evitando duplicado.");
      return NextResponse.json({
        success: true,
        message: "Orden ya procesada anteriormente",
      });
    }

    // 2. Obtener datos completos de la transacción desde Wompi
    log("🔍 Consultando transacción desde Wompi API...");
    const wompiResponse = await fetch(
      `https://production.wompi.co/v1/transactions/${transactionId}`
    );

    if (!wompiResponse.ok) {
      logError("❌ Error al consultar transacción de Wompi");
      return NextResponse.json(
        { error: "Error al consultar transacción" },
        { status: 500 }
      );
    }

    const wompiData = await wompiResponse.json();
    const transaction = wompiData.data;

    log("✅ Transacción obtenida de Wompi. Estado:", transaction.status);

    // Verificar que realmente esté aprobada
    if (transaction.status !== "APPROVED") {
      log("⚠️ La transacción no está aprobada. Estado:", transaction.status);
      return NextResponse.json(
        { error: "La transacción no está aprobada" },
        { status: 400 }
      );
    }

    // 3. Reducir el stock de cada producto
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
            log(
              `  ✅ Producto ${result.productId}: ${result.previousStock} → ${result.newStock}`
            );
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
          .from("orders")
          .update({
            notes: `ATENCIÓN: Algunos productos no pudieron actualizar su stock. Revisar manualmente.`,
            stock_update_errors: stockResult.results.filter((r) => !r.success),
          })
          .eq("numero_orden", reference);
      }
    } else {
      logError("⚠️ La orden no tiene items o no está en formato array");
    }

    // 4. Actualizar estado de la orden
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        estado: "completado",
        estado_pago: "completado",
        transaction_id: transactionId,
        informacion_pago: transaction,
        fecha_pago: new Date().toISOString(),
      })
      .eq("numero_orden", reference);

    if (updateOrderError) {
      logError("❌ Error actualizando orden", updateOrderError);
    } else {
      log("✅ Orden marcada como pagada");
    }

    // 5. Generar factura electrónica automáticamente
    try {
      log("📄 Generando factura electrónica...");

      // Verificar si ya existe una factura para esta orden
      const { data: existingInvoice } = await supabase
        .from("invoices")
        .select("invoice_number")
        .eq("order_reference", reference)
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

    // 6. Enviar notificación al administrador vía Telegram
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

    // Responder exitosamente
    return NextResponse.json({
      success: true,
      message: "Pago procesado exitosamente",
      order: {
        numero_orden: order.numero_orden,
        estado: "completado",
        estado_pago: "completado",
      },
    });
  } catch (error) {
    logError("❌ Error procesando pago aprobado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

// GET para verificar el estado del endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/payments/process-approved",
    methods: ["POST"],
    description: "Procesa pagos aprobados inmediatamente",
  });
}
