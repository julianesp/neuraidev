// Lado servidor del descuento de cliente (ver lib/descuento-cliente.js).
import { clerkClient } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";
import { PORCENTAJE_DESCUENTO_CLIENTE } from "@/lib/descuento-cliente";

/**
 * Usuario de la petición sin depender del middleware de Clerk (las rutas
 * /api/payments lo saltan): token Bearer enviado por el checkout o, si no
 * viene, la cookie __session. Devuelve el usuario de Clerk o null.
 */
export async function usuarioDePeticion(request) {
  const tokens = [];
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) tokens.push(authHeader.slice(7).trim());
  const cookie = request.headers.get("cookie") || "";
  const sesion = cookie.match(/(?:^|;\s*)__session=([^;]+)/)?.[1];
  if (sesion) tokens.push(decodeURIComponent(sesion));

  for (const token of tokens) {
    if (!token || token === "null" || token === "undefined") continue;
    try {
      const decoded = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
        jwtKey: process.env.CLERK_JWT_KEY,
      });
      if (decoded?.sub) {
        const client = await clerkClient();
        return await client.users.getUser(decoded.sub);
      }
    } catch {
      // token vencido o inválido: se prueba el siguiente
    }
  }
  return null;
}

async function guardar(userId, descuento) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { descuento_cliente: descuento },
  });
}

/**
 * Al aprobar la calificación de un cliente de formateo/mantenimiento: le
 * activa el 15% si nunca lo ha tenido (uno por cliente).
 * @returns {Promise<'activado'|'ya_tenia'|'error'>}
 */
export async function activarDescuentoCliente(userId, testimonioId) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.descuento_cliente) return "ya_tenia";
    await guardar(userId, {
      porcentaje: PORCENTAJE_DESCUENTO_CLIENTE,
      estado: "disponible",
      testimonio_id: testimonioId,
      activado_at: new Date().toISOString(),
    });
    return "activado";
  } catch (e) {
    console.error("[descuento-cliente] no se pudo activar:", e?.message || e);
    return "error";
  }
}

// El checkout lo aplicó a una orden aún sin pagar
export async function reservarDescuentoCliente(user, referencia) {
  try {
    const actual = user.publicMetadata?.descuento_cliente || {};
    await guardar(user.id, { ...actual, estado: "reservado", orden: referencia });
  } catch (e) {
    console.error("[descuento-cliente] no se pudo reservar:", e?.message || e);
  }
}

// El pago de esa orden se confirmó: el descuento queda gastado
export async function marcarDescuentoClienteUsado(descuentoOrden, referencia) {
  if (!descuentoOrden?.user_id) return;
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(descuentoOrden.user_id);
    const actual = user.publicMetadata?.descuento_cliente || {};
    if (actual.estado === "usado") return;
    await guardar(user.id, {
      ...actual,
      estado: "usado",
      orden: referencia,
      usado_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[descuento-cliente] no se pudo marcar como usado:", e?.message || e);
  }
}
