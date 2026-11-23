/**
 * WhatsApp Cloud API (Meta) — envío de mensajes y utilidades del webhook.
 *
 * Variables de entorno:
 *   WHATSAPP_TOKEN            Token de usuario del sistema (Business Settings > System Users)
 *   WHATSAPP_PHONE_NUMBER_ID  ID del número que envía (+57 317 4503604)
 *   WHATSAPP_APP_SECRET       Clave secreta de la app "neurai Mensajes" (firma del webhook)
 *   WHATSAPP_VERIFY_TOKEN     Texto acordado para verificar el webhook al configurarlo
 */
import crypto from "crypto";
import { d1Execute } from "@/lib/db-d1";

const GRAPH = "https://graph.facebook.com/v23.0";

export function whatsappConfigurado() {
  return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/** Deja solo dígitos y agrega el 57 a celulares colombianos de 10 dígitos. */
export function normalizarTelefono(tel) {
  let d = String(tel || "").replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("3")) d = `57${d}`;
  if (d.length < 11 || d.length > 15) return null;
  return d;
}

/** Comprueba la firma X-Hub-Signature-256 que Meta pone en cada POST del webhook. */
export function firmaValida(rawBody, header) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const esperado = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const recibido = header.slice(7);
  if (recibido.length !== esperado.length) return false;
  return crypto.timingSafeEqual(Buffer.from(recibido), Buffer.from(esperado));
}

async function llamarApi(payload) {
  if (!whatsappConfigurado()) {
    return { ok: false, error: "WhatsApp no está configurado" };
  }
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[WHATSAPP] Error de la API:", JSON.stringify(data?.error || data));
    return { ok: false, error: data?.error?.message || `HTTP ${res.status}` };
  }
  return { ok: true, id: data?.messages?.[0]?.id || null };
}

/** Guarda un mensaje enviado en el historial (para el panel y el contexto del asistente). */
async function registrarSaliente(telefono, texto, id, origen, tipo = "texto") {
  try {
    await d1Execute(
      `INSERT OR IGNORE INTO whatsapp_mensajes (telefono, direccion, tipo, texto, wa_message_id, origen)
       VALUES (?, 'saliente', ?, ?, ?, ?)`,
      [telefono, tipo, texto, id, origen]
    );
    await d1Execute(
      `INSERT INTO whatsapp_conversaciones (telefono, ultimo_mensaje, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(telefono) DO UPDATE SET ultimo_mensaje = excluded.ultimo_mensaje, updated_at = datetime('now')`,
      [telefono, texto?.slice(0, 200) || ""]
    );
  } catch (e) {
    console.error("[WHATSAPP] No se pudo registrar el mensaje saliente:", e.message);
  }
}

/**
 * Texto libre. Solo llega si el cliente escribió en las últimas 24 horas
 * (ventana de atención de Meta); fuera de ella hay que usar una plantilla.
 */
export async function enviarTexto(telefono, texto, origen = "asistente") {
  const to = normalizarTelefono(telefono);
  if (!to) return { ok: false, error: "Teléfono inválido" };
  const r = await llamarApi({
    to,
    type: "text",
    text: { body: texto.slice(0, 4096), preview_url: true },
  });
  if (r.ok) await registrarSaliente(to, texto, r.id, origen);
  return r;
}

/**
 * Plantilla aprobada por Meta (sirve fuera de la ventana de 24 h).
 * @param {string[]} parametros  valores de {{1}}, {{2}}… del cuerpo, en orden
 * @param {string} resumen       texto que se guarda en el historial
 */
export async function enviarPlantilla(telefono, nombre, parametros = [], resumen = "", idioma = "es") {
  const to = normalizarTelefono(telefono);
  if (!to) return { ok: false, error: "Teléfono inválido" };
  const r = await llamarApi({
    to,
    type: "template",
    template: {
      name: nombre,
      language: { code: idioma },
      components: parametros.length
        ? [{ type: "body", parameters: parametros.map((p) => ({ type: "text", text: String(p) })) }]
        : [],
    },
  });
  if (r.ok) await registrarSaliente(to, resumen || `[plantilla ${nombre}]`, r.id, "plantilla", "plantilla");
  return r;
}

/** Marca el mensaje como leído (las palomitas azules del cliente). */
export async function marcarLeido(waMessageId) {
  if (!whatsappConfigurado() || !waMessageId) return;
  await llamarApi({ status: "read", message_id: waMessageId }).catch(() => {});
}

export function formatearPesos(valor) {
  return `$${Math.round(Number(valor) || 0).toLocaleString("es-CO")}`;
}
