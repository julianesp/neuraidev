import crypto from "crypto";

/**
 * Valida la firma (x_signature) que ePayco envía en el webhook de confirmación.
 *
 * Fórmula oficial de ePayco:
 *   sha256( p_cust_id_cliente ^ p_key ^ x_ref_payco ^ x_transaction_id ^ x_amount ^ x_currency_code )
 * (los campos se concatenan con el separador "^").
 *
 * IMPORTANTE: esta función NO decide por sí sola si se bloquea el pago. Devuelve
 * un resultado descriptivo y quien la llama decide. Así evitamos romper el flujo
 * de pagos web que ya funciona en producción: si faltan credenciales o el body no
 * trae firma, se reporta pero NO se lanza excepción.
 *
 * @param {Record<string, any>} body - datos recibidos del webhook de ePayco.
 * @returns {{ valida: boolean, motivo: string }}
 *   - valida=true  → la firma coincide.
 *   - valida=false → no coincide o no se pudo validar (ver `motivo`).
 */
export function validarFirmaEpayco(body) {
  // EPAYCO_CUST_ID es el nombre usado en Vercel; ambos contienen el p_cust_id_cliente.
  const pCustId = process.env.EPAYCO_P_CUST_ID_CLIENTE || process.env.EPAYCO_CUST_ID;
  const pKey = process.env.EPAYCO_P_KEY;

  // Sin credenciales no podemos validar. No bloqueamos (comportamiento previo).
  if (!pCustId || !pKey) {
    return {
      valida: false,
      motivo: "no-credenciales",
    };
  }

  const firmaRecibida = body?.x_signature;
  if (!firmaRecibida) {
    return { valida: false, motivo: "sin-firma-en-body" };
  }

  const refPayco = String(body.x_ref_payco ?? "");
  const transactionId = String(body.x_transaction_id ?? "");
  const amount = String(body.x_amount ?? "");
  const currency = String(body.x_currency_code ?? "");

  const cadena = [pCustId, pKey, refPayco, transactionId, amount, currency].join(
    "^",
  );

  const firmaCalculada = crypto
    .createHash("sha256")
    .update(cadena)
    .digest("hex");

  return {
    valida: firmaCalculada === String(firmaRecibida),
    motivo: firmaCalculada === String(firmaRecibida) ? "ok" : "no-coincide",
  };
}
