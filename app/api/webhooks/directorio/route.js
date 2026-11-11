import { NextResponse, after } from "next/server";
import { d1Execute, d1SelectOne } from "@/lib/db-d1";
import { validarFirmaEpayco } from "@/lib/epayco/signature";
import { sumarMeses } from "@/lib/directorio/planes";
import { notifyPagoDirectorio } from "@/lib/notificationService";

export const dynamic = "force-dynamic";

/*
 * Confirmación de ePayco para los planes del directorio.
 * - Firma obligatoria y sin excepciones (fail-closed): este endpoint concede días de plan.
 * - El monto se compara con el que guardamos al crear el pago (nunca el del cliente).
 * - Idempotente: ePayco puede reenviar el webhook; el plan se suma una sola vez.
 */
export async function POST(request) {
  try {
    let body = {};
    if (request.headers.get("content-type")?.includes("application/json")) {
      body = await request.json();
    } else {
      const form = await request.formData();
      for (const [k, v] of form.entries()) body[k] = v;
    }

    const firma = validarFirmaEpayco(body);
    if (!firma.valida) {
      console.error("[webhook directorio] Firma inválida:", firma.motivo);
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    const referencia = String(body.x_id_invoice || "");
    const pago = await d1SelectOne("SELECT * FROM directorio_pagos WHERE referencia = ?", [referencia]);
    if (!pago) {
      console.error("[webhook directorio] Referencia desconocida:", referencia);
      return NextResponse.json({ ok: true });
    }
    if (pago.estado === "aprobado") return NextResponse.json({ ok: true }); // ya procesado

    const codigo = String(body.x_cod_response ?? "");
    const aprobada = codigo === "1" || (!codigo && body.x_transaction_state === "Aceptada");
    const pendiente = codigo === "3" || body.x_transaction_state === "Pendiente";
    const refPayco = String(body.x_ref_payco || "");
    const transactionId = String(body.x_transaction_id || "");

    if (!aprobada) {
      if (!pendiente) {
        await d1Execute(
          "UPDATE directorio_pagos SET estado = 'rechazado', ref_payco = ?, transaction_id = ? WHERE id = ? AND estado != 'aprobado'",
          [refPayco, transactionId, pago.id]
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Monto y moneda deben coincidir con lo que se cobró en el servidor.
    const montoOk = Math.abs(Number(body.x_amount) - pago.monto) <= 1;
    const monedaOk = String(body.x_currency_code || "").toUpperCase() === "COP";
    if (!montoOk || !monedaOk) {
      await d1Execute(
        "UPDATE directorio_pagos SET estado = 'en_revision', ref_payco = ?, transaction_id = ?, nota = ? WHERE id = ? AND estado != 'aprobado'",
        [refPayco, transactionId, `Monto recibido ${body.x_amount} ${body.x_currency_code}, esperado ${pago.monto} COP`, pago.id]
      );
      after(() => notifyPagoDirectorio({ ...pago, revision: true, recibido: body.x_amount }));
      return NextResponse.json({ ok: true });
    }

    // Solo el primer webhook "gana" el cambio de estado y suma el plan.
    const ahora = new Date().toISOString();
    const meta = await d1Execute(
      "UPDATE directorio_pagos SET estado = 'aprobado', ref_payco = ?, transaction_id = ?, aprobado_at = ? WHERE id = ? AND estado != 'aprobado'",
      [refPayco, transactionId, ahora, pago.id]
    );
    if (meta.changes === 1) {
      try {
        const negocio = await d1SelectOne("SELECT plan_hasta FROM directorio_negocios WHERE id = ?", [pago.negocio_id]);
        await d1Execute("UPDATE directorio_negocios SET plan_hasta = ?, updated_at = ? WHERE id = ?", [
          sumarMeses(negocio?.plan_hasta, pago.meses),
          ahora,
          pago.negocio_id,
        ]);
      } catch (error) {
        // Si no se pudo sumar el plan, se libera el pago para que el reintento de ePayco lo procese.
        await d1Execute("UPDATE directorio_pagos SET estado = 'pendiente', aprobado_at = NULL WHERE id = ?", [pago.id]).catch(() => {});
        throw error;
      }
      after(() => notifyPagoDirectorio(pago));
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[webhook directorio] Error:", error);
    // 500 para que ePayco reintente.
    return NextResponse.json({ error: "Error procesando el pago" }, { status: 500 });
  }
}
