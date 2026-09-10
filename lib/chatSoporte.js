/**
 * lib/chatSoporte.js — Lógica de datos del chat interno comprador ↔ vendedor.
 *
 * Todas las funciones operan sobre las tablas `chat_conversaciones` y
 * `chat_mensajes` (ver migrations/add-chat-soporte.sql) mediante los helpers
 * REST de Cloudflare D1.
 */

import { d1Select, d1SelectOne, d1Execute } from "./db-d1";

const REMITENTES = ["usuario", "admin", "sistema"];

/**
 * Devuelve la conversación por id, o null si no existe.
 */
export async function getConversacion(id) {
  return d1SelectOne(`SELECT * FROM chat_conversaciones WHERE id = ?`, [id]);
}

/**
 * Lista las conversaciones de un usuario (por clerk_user_id o email).
 * Ordena por último mensaje descendente.
 */
export async function listarConversacionesUsuario({ clerkUserId, email }) {
  if (clerkUserId) {
    return d1Select(
      `SELECT * FROM chat_conversaciones
       WHERE clerk_user_id = ?
       ORDER BY COALESCE(ultimo_mensaje_at, created_at) DESC`,
      [clerkUserId]
    );
  }
  if (email) {
    return d1Select(
      `SELECT * FROM chat_conversaciones
       WHERE customer_email = ?
       ORDER BY COALESCE(ultimo_mensaje_at, created_at) DESC`,
      [email]
    );
  }
  return [];
}

/**
 * Lista todas las conversaciones para la bandeja del admin.
 * @param {string} [estado] - filtra por 'abierta' | 'cerrada' (opcional)
 */
export async function listarConversacionesAdmin(estado) {
  if (estado === "abierta" || estado === "cerrada") {
    return d1Select(
      `SELECT * FROM chat_conversaciones
       WHERE estado = ?
       ORDER BY COALESCE(ultimo_mensaje_at, created_at) DESC`,
      [estado]
    );
  }
  return d1Select(
    `SELECT * FROM chat_conversaciones
     ORDER BY COALESCE(ultimo_mensaje_at, created_at) DESC`
  );
}

/**
 * Trae los mensajes de una conversación, en orden cronológico.
 */
export async function listarMensajes(conversacionId) {
  return d1Select(
    `SELECT * FROM chat_mensajes
     WHERE conversacion_id = ?
     ORDER BY created_at ASC`,
    [conversacionId]
  );
}

/**
 * Crea una conversación nueva. Devuelve el registro creado.
 */
export async function crearConversacion({
  clerkUserId = null,
  email = null,
  nombre = null,
  orderId = null,
  asunto = "Consulta general",
}) {
  const id = crypto.randomUUID();
  const ahora = new Date().toISOString();

  await d1Execute(
    `INSERT INTO chat_conversaciones
       (id, clerk_user_id, customer_email, customer_name, order_id, asunto, estado, no_leidos_admin, no_leidos_usuario, ultimo_mensaje_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'abierta', 0, 0, ?, ?)`,
    [id, clerkUserId, email, nombre, orderId, asunto, ahora, ahora]
  );

  return getConversacion(id);
}

/**
 * Inserta un mensaje en una conversación y actualiza los contadores de no
 * leídos del lado contrario, además de `ultimo_mensaje_at`.
 *
 * @param {string} conversacionId
 * @param {'usuario'|'admin'|'sistema'} remitente
 * @param {string} contenido
 * @returns {Promise<Object>} el mensaje insertado
 */
export async function agregarMensaje(conversacionId, remitente, contenido) {
  if (!REMITENTES.includes(remitente)) {
    throw new Error(`Remitente inválido: ${remitente}`);
  }
  const texto = (contenido || "").trim();
  if (!texto) throw new Error("El mensaje no puede estar vacío");

  const id = crypto.randomUUID();
  const ahora = new Date().toISOString();

  await d1Execute(
    `INSERT INTO chat_mensajes (id, conversacion_id, remitente, contenido, leido, created_at)
     VALUES (?, ?, ?, ?, 0, ?)`,
    [id, conversacionId, remitente, texto, ahora]
  );

  // Incrementar el "no leído" del destinatario:
  //  - mensaje del usuario/sistema  → aumenta no_leidos_admin
  //  - mensaje del admin            → aumenta no_leidos_usuario
  const columna =
    remitente === "admin" ? "no_leidos_usuario" : "no_leidos_admin";

  await d1Execute(
    `UPDATE chat_conversaciones
     SET ${columna} = ${columna} + 1, ultimo_mensaje_at = ?
     WHERE id = ?`,
    [ahora, conversacionId]
  );

  return { id, conversacion_id: conversacionId, remitente, contenido: texto, leido: 0, created_at: ahora };
}

/**
 * Marca como leídos los mensajes de una conversación para un lado y resetea su
 * contador de no leídos.
 * @param {string} conversacionId
 * @param {'usuario'|'admin'} lado - quién está leyendo
 */
export async function marcarLeido(conversacionId, lado) {
  if (lado === "admin") {
    // El admin lee los mensajes de usuario/sistema
    await d1Execute(
      `UPDATE chat_mensajes SET leido = 1
       WHERE conversacion_id = ? AND remitente IN ('usuario', 'sistema')`,
      [conversacionId]
    );
    await d1Execute(
      `UPDATE chat_conversaciones SET no_leidos_admin = 0 WHERE id = ?`,
      [conversacionId]
    );
  } else {
    // El usuario lee los mensajes del admin (y del sistema)
    await d1Execute(
      `UPDATE chat_mensajes SET leido = 1
       WHERE conversacion_id = ? AND remitente IN ('admin', 'sistema')`,
      [conversacionId]
    );
    await d1Execute(
      `UPDATE chat_conversaciones SET no_leidos_usuario = 0 WHERE id = ?`,
      [conversacionId]
    );
  }
}

/**
 * Cambia el estado (abierta/cerrada) de una conversación.
 */
export async function actualizarEstado(conversacionId, estado) {
  const nuevo = estado === "cerrada" ? "cerrada" : "abierta";
  await d1Execute(
    `UPDATE chat_conversaciones SET estado = ? WHERE id = ?`,
    [nuevo, conversacionId]
  );
}

/**
 * Crea (o reutiliza) una conversación ligada a un pedido y agrega un mensaje
 * automático del sistema. Se usa desde el webhook de pago cuando una orden
 * queda APROBADA. Nunca debe lanzar hacia arriba de forma que bloquee el flujo
 * de pago: el llamador debe envolverla en try/catch.
 *
 * @param {Object} order - fila de la tabla orders
 * @returns {Promise<Object|null>} la conversación usada
 */
export async function crearMensajeSistemaPedido(order) {
  if (!order) return null;

  const clerkUserId = order.clerk_user_id || null;
  const email = order.customer_email || null;
  const nombre = order.customer_name || null;
  const numeroOrden = order.numero_orden || order.id;

  // Reutilizar una conversación ya ligada a este pedido, si existe.
  let conversacion = await d1SelectOne(
    `SELECT * FROM chat_conversaciones WHERE order_id = ? LIMIT 1`,
    [order.id]
  );

  if (!conversacion) {
    conversacion = await crearConversacion({
      clerkUserId,
      email,
      nombre,
      orderId: order.id,
      asunto: `Pedido #${numeroOrden}`,
    });
  }

  const contenido =
    `¡Gracias por tu compra! 🎉 Tu pedido #${numeroOrden} fue confirmado. ` +
    `Si tienes cualquier duda sobre tu pedido, respóndenos por aquí y te atenderemos lo antes posible.`;

  await agregarMensaje(conversacion.id, "sistema", contenido);

  return conversacion;
}
