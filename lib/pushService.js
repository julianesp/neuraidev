import { d1Select } from "@/lib/db-d1";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const isDev = process.env.NODE_ENV === "development";
const log = (...args) => isDev && console.warn("[push]", ...args);
const logError = (...args) => console.error("[push]", ...args);

/**
 * Envía notificaciones push a una lista de Expo push tokens.
 * Divide en lotes de 100 (límite de la API de Expo). Nunca lanza: devuelve un
 * resumen para que quien llame decida qué hacer.
 *
 * @param {string[]} tokens - lista de ExponentPushToken[...] destino.
 * @param {{ title: string, body: string, data?: object }} mensaje
 * @returns {Promise<{ enviados: number, fallidos: number }>}
 */
export async function enviarPushExpo(tokens, mensaje) {
  const validos = (tokens || []).filter(
    (t) => typeof t === "string" && t.startsWith("ExponentPushToken"),
  );
  if (validos.length === 0) return { enviados: 0, fallidos: 0 };

  let enviados = 0;
  let fallidos = 0;

  // Lotes de 100 mensajes.
  for (let i = 0; i < validos.length; i += 100) {
    const lote = validos.slice(i, i + 100).map((to) => ({
      to,
      sound: "default",
      title: mensaje.title,
      body: mensaje.body,
      data: mensaje.data || {},
    }));

    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lote),
      });
      if (res.ok) {
        enviados += lote.length;
      } else {
        fallidos += lote.length;
        logError("Lote rechazado por Expo:", res.status);
      }
    } catch (e) {
      fallidos += lote.length;
      logError("Error enviando lote a Expo:", e.message);
    }
  }

  log(`Push enviado: ${enviados} ok, ${fallidos} fallidos`);
  return { enviados, fallidos };
}

/** Lee los push tokens de un usuario Clerk desde D1. */
async function tokensDeUsuario(clerkUserId) {
  try {
    const rows = await d1Select(
      "SELECT expo_token FROM push_tokens WHERE clerk_user_id = ?",
      [clerkUserId],
    );
    return (rows || []).map((r) => r.expo_token).filter(Boolean);
  } catch (e) {
    logError("Error leyendo tokens del usuario:", e.message);
    return [];
  }
}

/** Lee TODOS los push tokens registrados (para avisos masivos). */
export async function todosLosTokens() {
  try {
    const rows = await d1Select("SELECT expo_token FROM push_tokens", []);
    return (rows || []).map((r) => r.expo_token).filter(Boolean);
  } catch (e) {
    logError("Error leyendo todos los tokens:", e.message);
    return [];
  }
}

/** Lee los push tokens de todos los administradores por email. */
async function tokensDeAdmins() {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) return [];

  try {
    const placeholders = adminEmails.map(() => "?").join(",");
    const rows = await d1Select(
      `SELECT expo_token FROM push_tokens WHERE LOWER(email) IN (${placeholders}) AND expo_token IS NOT NULL`,
      adminEmails,
    );
    return (rows || []).map((r) => r.expo_token).filter(Boolean);
  } catch (e) {
    logError("Error leyendo tokens de admins:", e.message);
    return [];
  }
}

/**
 * Notifica a los admins de una nueva venta. Silencioso ante fallos.
 */
export async function notificarNuevaVentaAdmin({ numeroOrden, total, clienteNombre }) {
  const tokens = await tokensDeAdmins();
  if (tokens.length === 0) return { enviados: 0, fallidos: 0 };

  const totalFmt = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(total) || 0);

  return enviarPushExpo(tokens, {
    title: "Nueva venta 🛒",
    body: `${clienteNombre || "Cliente"} compró por ${totalFmt} — Pedido ${numeroOrden}`,
    data: { tipo: "nueva_venta", numeroOrden },
  });
}

/**
 * Notifica al comprador que su pago fue aprobado. Se llama desde el webhook de
 * ePayco. Silencioso ante fallos.
 */
export async function notificarPagoAprobado(clerkUserId, { numeroOrden, total }) {
  const tokens = await tokensDeUsuario(clerkUserId);
  if (tokens.length === 0) return { enviados: 0, fallidos: 0 };

  const totalFmt = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(total) || 0);

  return enviarPushExpo(tokens, {
    title: "¡Pago aprobado! 🎉",
    body: `Tu pedido ${numeroOrden} por ${totalFmt} fue confirmado.`,
    data: { tipo: "pago_aprobado", numeroOrden },
  });
}
