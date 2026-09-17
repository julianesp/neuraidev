import { NextResponse, after } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { decrementMultipleProductsStock } from "@/lib/productService";
import { createInvoiceRecord } from "@/lib/invoiceGenerator";
import { notifyNewSale } from "@/lib/notificationService";
import { notificarPagoAprobado, notificarNuevaVentaAdmin } from "@/lib/pushService";
import { crearMensajeSistemaPedido } from "@/lib/chatSoporte";

// Solo loguear en desarrollo
const isDev = process.env.NODE_ENV === "development";
const log = (...args) => isDev && console.warn("[DEV ePayco reconcile]", ...args);
const logError = (...args) => console.error(...args);

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

/**
 * Reconciliación de pagos ePayco por referencia.
 *
 * Existe porque ePayco no siempre llama al webhook de confirmación tras un
 * pago aprobado (sobre todo con ciertos métodos), dejando la orden "pendiente"
 * en la BD aunque en el panel de ePayco figure como Aceptada. Este endpoint lo
 * llama la página /respuesta-pago cuando ve una orden pendiente: consulta el
 * estado real a ePayco y, si está aprobado, completa la orden con el mismo
 * proceso del webhook (stock, factura, notificaciones, chat).
 *
 * GET /api/payments/epayco/reconcile?reference=NRD-...
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    // ref_payco es el ID interno de la transacción en ePayco. Es el ÚNICO
    // identificador que acepta el endpoint de validación de ePayco
    // (/validation/v1/reference/{ref_payco}); NO acepta nuestro numero_orden.
    // Llega desde la URL de retorno (x_ref_payco). Si no viene, intentamos
    // recuperarlo del transaction_id que se haya guardado antes en la orden.
    const refPaycoParam = searchParams.get("ref_payco");

    if (!reference) {
      return NextResponse.json({ error: "Se requiere 'reference'" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 1. Traer la orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("numero_orden", reference)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    // Si ya está completada, nada que reconciliar.
    if (
      order.estado === "completado" ||
      order.estado === "pagado" ||
      order.estado_pago === "completado"
    ) {
      return NextResponse.json({ status: "APPROVED", alreadyProcessed: true });
    }

    // Resolver el ref_payco: preferimos el de la URL; si no, el transaction_id
    // que un webhook/intento previo haya podido dejar en la orden.
    const refPayco = refPaycoParam || order.transaction_id || null;

    if (!refPayco) {
      // Sin ref_payco no podemos consultar a ePayco. No es un error del flujo:
      // simplemente aún no tenemos con qué validar. Reportamos pendiente.
      log("Sin ref_payco para reconciliar la referencia", reference);
      return NextResponse.json({ status: "PENDING", verified: false, reason: "sin-ref-payco" });
    }

    // 2. Consultar el estado real en ePayco.
    // El endpoint de validación NO usa Authorization: Bearer; espera el
    // ref_payco en la ruta y responde { success, data: { x_response, ... } }.
    let epaycoState = null;
    let transaction = null;
    try {
      const resp = await fetch(
        `https://secure.epayco.co/validation/v1/reference/${encodeURIComponent(refPayco)}`,
        { headers: { "Content-Type": "application/json" } },
      );
      if (resp.ok) {
        const data = await resp.json();
        // Formato de ePayco: { success: true, data: { x_response, x_transaction_state, ... } }
        transaction = data?.data || null;
        if (data?.success && transaction) {
          epaycoState = transaction.x_response || transaction.x_transaction_state || null;
        } else {
          log("ePayco validation sin éxito:", data?.text_response || data?.title_response || "sin detalle");
        }
      } else {
        log("ePayco validation devolvió HTTP", resp.status);
      }
    } catch (e) {
      logError("Error consultando ePayco:", e.message);
    }

    // Sin respuesta de ePayco no cambiamos nada: seguimos reportando pendiente.
    if (!epaycoState) {
      return NextResponse.json({ status: "PENDING", verified: false });
    }

    // Blindaje anti-suplantación: el x_id_invoice que devuelve ePayco debe
    // corresponder a la orden que estamos reconciliando. Si no coincide, no
    // completamos nada (evita que un ref_payco de otra compra cierre esta orden).
    const invoiceEpayco = transaction?.x_id_invoice || transaction?.x_extra1 || null;
    if (invoiceEpayco && String(invoiceEpayco) !== String(reference)) {
      logError(
        `🚫 ref_payco ${refPayco} corresponde a la factura ${invoiceEpayco}, no a ${reference}. Se ignora.`,
      );
      return NextResponse.json({ status: "PENDING", verified: false, reason: "invoice-mismatch" });
    }

    if (epaycoState !== "Aceptada") {
      // Rechazada / Pendiente / Fallida: reportamos sin completar.
      const map = { Rechazada: "DECLINED", Pendiente: "PENDING", Fallida: "ERROR" };
      return NextResponse.json({ status: map[epaycoState] || "PENDING", verified: true });
    }

    // 3. Verificar monto antes de completar (misma protección que el webhook).
    const amount = parseFloat(transaction?.x_amount || transaction?.x_amount_ok || 0);
    const montoOrden = Number(order.total);
    const montoCoincide =
      Number.isFinite(montoOrden) && Number.isFinite(amount) && Math.abs(amount - montoOrden) <= 1;
    const moneda = String(transaction?.x_currency_code || "").toUpperCase();

    if (!montoCoincide || (moneda && moneda !== "COP")) {
      await supabase
        .from("orders")
        .update({
          estado_pago: "en_revision",
          transaction_id: transaction?.x_transaction_id || transaction?.x_ref_payco || null,
          informacion_pago: { ...transaction, source: "epayco_reconcile" },
          notes: `ATENCIÓN: monto reconciliado (${amount} ${moneda || "?"}) no coincide con total (${montoOrden} COP). Revisar antes de despachar.`,
          updated_at: new Date().toISOString(),
        })
        .eq("numero_orden", reference);
      return NextResponse.json({ status: "PENDING", verified: true, mismatch: true });
    }

    // 4. Completar la orden (mismo efecto que el webhook)
    // metadata de D1 llega como string JSON
    let metadata = order.metadata;
    if (typeof metadata === "string") {
      try { metadata = JSON.parse(metadata); } catch { metadata = null; }
    }
    const orderItems = metadata?.productos || order.productos || order.items;
    if (Array.isArray(orderItems)) {
      const stockResult = await decrementMultipleProductsStock(orderItems);
      if (!stockResult.success) {
        await supabase
          .from("orders")
          .update({
            notes: "ATENCIÓN: algunos productos no pudieron actualizar su stock. Revisar manualmente.",
            stock_update_errors: stockResult.results.filter((r) => !r.success),
            updated_at: new Date().toISOString(),
          })
          .eq("numero_orden", reference);
      }
    }

    const transactionId = transaction?.x_transaction_id || transaction?.x_ref_payco || null;
    const franchise = transaction?.x_franchise || "ePayco";

    await supabase
      .from("orders")
      .update({
        estado: "completado",
        estado_pago: "completado",
        transaction_id: transactionId,
        informacion_pago: { ...transaction, franchise, source: "epayco_reconcile" },
        fecha_pago: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("numero_orden", reference);

    log("✅ Orden completada por reconciliación:", reference);

    // La orden ya quedó completada arriba: eso es lo que el frontend necesita
    // para pasar a "¡Pago exitoso!". El resto (factura con PDF+email, Telegram,
    // push, chat) es pesado y no crítico, así que corre con after() para no
    // demorar la respuesta del polling.
    after(async () => {
      // Objeto de transacción para factura/notificación (formato compartido)
      const txForServices = {
        id: transactionId,
        status: "APPROVED",
        reference,
        amount_in_cents: Math.round(amount * 100),
        payment_method_type: franchise,
        payment_method: { type: franchise },
        customer_email: transaction?.x_customer_email || order.customer_email,
      };

      // Factura (si no existe)
      try {
        const { data: existingInvoice } = await supabase
          .from("invoices")
          .select("invoice_number")
          .eq("order_reference", reference)
          .single();
        if (!existingInvoice) {
          await createInvoiceRecord(supabase, order, txForServices);
        }
      } catch (e) {
        logError("Error generando factura en reconcile:", e.message);
      }

      // Notificaciones (Telegram/push admin) y chat — nunca bloquean la respuesta
      try {
        await notificarNuevaVentaAdmin({
          numeroOrden: reference,
          total: amount,
          clienteNombre: order.customer_name || transaction?.x_customer_name || "Cliente",
        }).catch((e) => logError("Push admin fallido:", e.message));

        const orderForNotification = {
          ...order,
          metadata, // ya parseado
          customer_phone: order.customer_phone || transaction?.x_customer_phone || "",
          customer_address: order.customer_address || transaction?.x_customer_address || order.direccion_envio || "",
          customer_city: metadata?.customer_city || transaction?.x_customer_city || "",
          customer_region: metadata?.customer_region || "",
        };
        await notifyNewSale(orderForNotification, txForServices);
      } catch (e) {
        logError("Error notificando en reconcile:", e.message);
      }

      try {
        if (order.clerk_user_id) {
          await notificarPagoAprobado(order.clerk_user_id, { numeroOrden: reference, total: amount });
        }
      } catch (e) {
        logError("Error push comprador en reconcile:", e.message);
      }

      try {
        await crearMensajeSistemaPedido({ ...order, metadata });
      } catch (e) {
        logError("Error creando chat de pedido en reconcile:", e.message);
      }
    });

    return NextResponse.json({ status: "APPROVED", verified: true, reconciled: true });
  } catch (error) {
    logError("Error en reconcile ePayco:", error);
    return NextResponse.json(
      { error: "Error interno", details: error.message },
      { status: 500 },
    );
  }
}
