/**
 * Pedidos de /fastfoods, porciones del especial y clientes que vuelven
 * (solo servidor).
 *
 * Los precios y las porciones se calculan SIEMPRE con lo que hay en D1: del
 * cliente solo se aceptan ids y cantidades.
 */

import { d1Select, d1SelectOne, d1Execute } from "@/lib/db-d1";
import { ErrorFastfood } from "./acciones";
import { formatoPrecio, parseJSON } from "./utils";

export const ESTADOS_PEDIDO = ["nuevo", "preparando", "listo", "en_camino", "entregado", "cancelado"];
const ESTADOS_CERRADOS = ["entregado", "cancelado"];

const MAX_LINEAS = 30;
const MAX_CANTIDAD = 20;
const MAX_PEDIDOS_POR_IP = 5; // en 10 minutos, entre todos los negocios

// Sin letras/números que se confunden al dictarlos (O/0, I/1, S/5, B/8...).
const ALFABETO_CODIGO = "ACDEFHJKMNPRTUVWXY3479";

function generarCodigo() {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => ALFABETO_CODIGO[b % ALFABETO_CODIGO.length]).join("");
}

async function hashIp(ip) {
  if (!ip) return null;
  const datos = new TextEncoder().encode(`fastfoods:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Teléfono colombiano a 10 dígitos (quita el 57 si viene). */
export function normalizarTelefono(valor) {
  let d = String(valor || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("57")) d = d.slice(2);
  return d;
}

function limpiarTexto(valor, max) {
  return String(valor ?? "").trim().slice(0, max);
}

/**
 * Crea un pedido. Devuelve { id, token, codigo, total }.
 * items: [{ id, cantidad }] — ids de platos del menú o de especiales vigentes.
 */
export async function crearPedido({ slug, items, nombre, telefono, entrega, direccion, nota, ip }) {
  const negocio = await d1SelectOne(
    `SELECT id, nombre, domicilio, owner_clerk_id FROM fastfoods WHERE slug = ? AND estado = 'publicado'`,
    [slug]
  );
  if (!negocio) throw new ErrorFastfood(404, "Este negocio no está disponible");

  nombre = limpiarTexto(nombre, 60);
  telefono = normalizarTelefono(telefono);
  if (!nombre) throw new ErrorFastfood(400, "Escribe tu nombre");
  if (telefono.length < 7 || telefono.length > 12) throw new ErrorFastfood(400, "Escribe un teléfono válido");

  const esDomicilio = !!negocio.domicilio && entrega === "domicilio";
  direccion = limpiarTexto(direccion, 160);
  if (esDomicilio && !direccion) throw new ErrorFastfood(400, "Escribe la dirección de entrega");

  // Agrupa cantidades por id y valida.
  if (!Array.isArray(items) || items.length === 0) throw new ErrorFastfood(400, "El pedido está vacío");
  if (items.length > MAX_LINEAS) throw new ErrorFastfood(400, "Demasiados productos en un pedido");
  const cantidades = new Map();
  for (const it of items) {
    const n = Number(it?.cantidad);
    if (typeof it?.id !== "string" || !Number.isInteger(n) || n < 1 || n > MAX_CANTIDAD) {
      throw new ErrorFastfood(400, "Cantidad no válida");
    }
    cantidades.set(it.id, (cantidades.get(it.id) || 0) + n);
  }

  // Freno simple a pedidos falsos en ráfaga.
  const ipHash = await hashIp(ip);
  if (ipHash) {
    const desde = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const recientes = await d1SelectOne(
      `SELECT COUNT(*) AS n FROM fastfood_pedidos WHERE ip_hash = ? AND created_at > ?`,
      [ipHash, desde]
    );
    if ((recientes?.n || 0) >= MAX_PEDIDOS_POR_IP) {
      throw new ErrorFastfood(429, "Hiciste varios pedidos seguidos. Espera unos minutos.");
    }
  }

  // Precios y disponibilidad desde la base.
  const ids = [...cantidades.keys()];
  const ph = ids.map(() => "?").join(",");
  const ahora = new Date().toISOString();
  const [platos, especiales] = await Promise.all([
    d1Select(
      `SELECT id, nombre, precio FROM fastfood_menu WHERE fastfood_id = ? AND disponible = 1 AND id IN (${ph})`,
      [negocio.id, ...ids]
    ),
    d1Select(
      `SELECT id, titulo AS nombre, precio, porciones, vendidas FROM fastfood_especiales
       WHERE fastfood_id = ? AND expira_en > ? AND precio IS NOT NULL AND id IN (${ph})`,
      [negocio.id, ahora, ...ids]
    ),
  ]);
  const encontrados = new Map([
    ...platos.map((p) => [p.id, { ...p, tipo: "menu" }]),
    ...especiales.map((e) => [e.id, { ...e, tipo: "especial" }]),
  ]);
  const lineas = [];
  for (const [id, cantidad] of cantidades) {
    const prod = encontrados.get(id);
    if (!prod) throw new ErrorFastfood(409, "Algo de tu pedido ya no está disponible. Revisa el pedido.");
    lineas.push({ id, tipo: prod.tipo, nombre: prod.nombre, precio: prod.precio, cantidad });
  }
  const total = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);

  // Descontar porciones de los especiales; si alguno no alcanza, se revierte lo descontado.
  const descontados = [];
  try {
    for (const l of lineas.filter((x) => x.tipo === "especial")) {
      const meta = await d1Execute(
        `UPDATE fastfood_especiales SET vendidas = vendidas + ?
         WHERE id = ? AND (porciones IS NULL OR vendidas + ? <= porciones)`,
        [l.cantidad, l.id, l.cantidad]
      );
      if (!meta?.changes) {
        const e = encontrados.get(l.id);
        const quedan = Math.max(0, (e.porciones || 0) - (e.vendidas || 0));
        throw new ErrorFastfood(
          409,
          quedan > 0
            ? `Solo ${quedan === 1 ? "queda 1" : `quedan ${quedan}`} de «${l.nombre}»`
            : `«${l.nombre}» se agotó`
        );
      }
      descontados.push(l);
    }
  } catch (error) {
    await devolverPorciones(descontados);
    throw error;
  }

  const id = crypto.randomUUID();
  const token = crypto.randomUUID().replace(/-/g, "");
  const codigo = generarCodigo();
  try {
    await d1Execute(
      `INSERT INTO fastfood_pedidos
         (id, fastfood_id, codigo, token, cliente_nombre, cliente_telefono, entrega, direccion, nota,
          items, total, estado, ip_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'nuevo', ?, ?, ?)`,
      [
        id, negocio.id, codigo, token, nombre, telefono,
        esDomicilio ? "domicilio" : "recoger",
        esDomicilio ? direccion : null,
        limpiarTexto(nota, 200) || null,
        JSON.stringify(lineas), total, ipHash, ahora, ahora,
      ]
    );
  } catch (error) {
    await devolverPorciones(descontados);
    throw error;
  }

  return { id, token, codigo, total, negocio, lineas };
}

async function devolverPorciones(lineas) {
  for (const l of lineas) {
    await d1Execute(
      `UPDATE fastfood_especiales SET vendidas = MAX(0, vendidas - ?) WHERE id = ?`,
      [l.cantidad, l.id]
    ).catch((e) => console.error("[fastfoods] no se pudo devolver porciones", l.id, e));
  }
}

/** Texto corto del pedido para el push del dueño. */
export function resumenPedido(lineas, total) {
  const items = lineas.map((l) => `${l.cantidad}× ${l.nombre}`).join(", ");
  return `${items} — ${formatoPrecio(total)}`;
}

function formatearPedido(p) {
  return { ...p, items: parseJSON(p.items, []) };
}

/** Sellos que tiene hoy un cliente: pedidos entregados menos los ya canjeados. */
async function sellosDeCliente(fastfoodId, telefono) {
  const fila = await d1SelectOne(
    `SELECT
       (SELECT COUNT(*) FROM fastfood_pedidos
         WHERE fastfood_id = ? AND cliente_telefono = ? AND estado = 'entregado') AS entregados,
       (SELECT COALESCE(SUM(sellos), 0) FROM fastfood_canjes
         WHERE fastfood_id = ? AND cliente_telefono = ?) AS canjeados`,
    [fastfoodId, telefono, fastfoodId, telefono]
  );
  return Math.max(0, (fila?.entregados || 0) - (fila?.canjeados || 0));
}

/** Seguimiento público del pedido (por su token secreto). */
export async function getPedidoPorToken(token) {
  if (!/^[0-9a-f]{32}$/.test(token || "")) return null;
  const pedido = await d1SelectOne(
    `SELECT p.id, p.fastfood_id, p.codigo, p.cliente_nombre, p.cliente_telefono, p.entrega, p.direccion,
            p.nota, p.items, p.total, p.estado, p.created_at, p.updated_at,
            f.slug, f.nombre AS negocio_nombre, f.whatsapp, f.logo_url, f.tema,
            f.sellos_activo, f.sellos_meta, f.sellos_premio
     FROM fastfood_pedidos p JOIN fastfoods f ON f.id = p.fastfood_id
     WHERE p.token = ?`,
    [token]
  );
  if (!pedido) return null;

  let sellos = null;
  if (pedido.sellos_activo && pedido.sellos_meta > 0 && pedido.sellos_premio) {
    sellos = {
      tiene: await sellosDeCliente(pedido.fastfood_id, pedido.cliente_telefono),
      meta: pedido.sellos_meta,
      premio: pedido.sellos_premio,
    };
  }
  const { fastfood_id, cliente_telefono, ...publico } = formatearPedido(pedido);
  return { ...publico, sellos };
}

/** Pedidos del negocio: abiertos + los cerrados de las últimas 24 h. */
export async function listarPedidos(fastfoodId) {
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const filas = await d1Select(
    `SELECT id, codigo, cliente_nombre, cliente_telefono, entrega, direccion, nota, items, total, estado,
            created_at, updated_at
     FROM fastfood_pedidos
     WHERE fastfood_id = ? AND (estado NOT IN ('entregado', 'cancelado') OR created_at > ?)
     ORDER BY created_at DESC
     LIMIT 200`,
    [fastfoodId, desde]
  );
  return filas.map(formatearPedido);
}

export async function cambiarEstadoPedido(fastfoodId, pedidoId, estado) {
  if (!ESTADOS_PEDIDO.includes(estado)) throw new ErrorFastfood(400, "Estado no válido");
  const pedido = await d1SelectOne(
    `SELECT id, estado, items FROM fastfood_pedidos WHERE id = ? AND fastfood_id = ?`,
    [pedidoId, fastfoodId]
  );
  if (!pedido) throw new ErrorFastfood(404, "El pedido no existe");
  if (ESTADOS_CERRADOS.includes(pedido.estado)) {
    throw new ErrorFastfood(409, "Este pedido ya está cerrado");
  }
  // Solo cambia si sigue en el estado que leímos (evita dobles cancelaciones).
  const meta = await d1Execute(
    `UPDATE fastfood_pedidos SET estado = ?, updated_at = ? WHERE id = ? AND estado = ?`,
    [estado, new Date().toISOString(), pedidoId, pedido.estado]
  );
  if (!meta?.changes) throw new ErrorFastfood(409, "El pedido cambió, recarga la lista");
  if (estado === "cancelado") {
    await devolverPorciones(parseJSON(pedido.items, []).filter((l) => l.tipo === "especial"));
  }
}

/** Clientes del negocio (por teléfono) con cuántas veces han pedido y sus sellos. */
export async function listarClientes(fastfoodId) {
  return d1Select(
    `SELECT p.cliente_telefono AS telefono,
            (SELECT cliente_nombre FROM fastfood_pedidos x
              WHERE x.fastfood_id = p.fastfood_id AND x.cliente_telefono = p.cliente_telefono
              ORDER BY created_at DESC LIMIT 1) AS nombre,
            SUM(p.estado = 'entregado') AS entregados,
            SUM(CASE WHEN p.estado = 'entregado' THEN p.total ELSE 0 END) AS gastado,
            MAX(p.created_at) AS ultimo,
            SUM(p.estado = 'entregado') - COALESCE((SELECT SUM(sellos) FROM fastfood_canjes c
              WHERE c.fastfood_id = p.fastfood_id AND c.cliente_telefono = p.cliente_telefono), 0) AS sellos
     FROM fastfood_pedidos p
     WHERE p.fastfood_id = ? AND p.estado != 'cancelado'
     GROUP BY p.cliente_telefono
     ORDER BY entregados DESC, ultimo DESC
     LIMIT 300`,
    [fastfoodId]
  );
}

/** Entrega el premio de la tarjeta de sellos (descuenta la meta vigente). */
export async function canjearPremio(fastfoodId, telefono) {
  telefono = normalizarTelefono(telefono);
  const negocio = await d1SelectOne(
    `SELECT sellos_activo, sellos_meta FROM fastfoods WHERE id = ?`,
    [fastfoodId]
  );
  if (!negocio?.sellos_activo || !(negocio.sellos_meta > 0)) {
    throw new ErrorFastfood(400, "La tarjeta de sellos no está activa");
  }
  const tiene = await sellosDeCliente(fastfoodId, telefono);
  if (tiene < negocio.sellos_meta) {
    throw new ErrorFastfood(409, `Este cliente tiene ${tiene} de ${negocio.sellos_meta} sellos`);
  }
  await d1Execute(
    `INSERT INTO fastfood_canjes (id, fastfood_id, cliente_telefono, sellos, created_at) VALUES (?, ?, ?, ?, ?)`,
    [crypto.randomUUID(), fastfoodId, telefono, negocio.sellos_meta, new Date().toISOString()]
  );
}

/** Cambia las porciones de un especial (null = sin límite). */
export async function actualizarPorciones(fastfoodId, especialId, porciones) {
  const valor = porciones === null || porciones === "" ? null : Number(porciones);
  if (valor !== null && (!Number.isInteger(valor) || valor < 0 || valor > 10000)) {
    throw new ErrorFastfood(400, "Porciones no válidas");
  }
  const meta = await d1Execute(
    `UPDATE fastfood_especiales SET porciones = ? WHERE id = ? AND fastfood_id = ?`,
    [valor, especialId, fastfoodId]
  );
  if (!meta?.changes) throw new ErrorFastfood(404, "El especial no existe");
}

/** Especiales vigentes de todos los negocios publicados ("Hoy en ..."). */
export async function getEspecialesDeHoy({ ciudad = null, limite = 60 } = {}) {
  const ahora = new Date().toISOString();
  const filas = await d1Select(
    `SELECT e.id, e.titulo, e.descripcion, e.precio, e.foto_url, e.expira_en, e.porciones, e.vendidas, e.created_at,
            f.slug, f.nombre AS negocio, f.logo_url, f.ciudad, f.horario, f.tema, f.domicilio
     FROM fastfood_especiales e JOIN fastfoods f ON f.id = e.fastfood_id
     WHERE f.estado = 'publicado' AND e.expira_en > ? ${ciudad ? "AND LOWER(f.ciudad) = LOWER(?)" : ""}
     ORDER BY (e.porciones IS NOT NULL AND e.vendidas >= e.porciones) ASC, e.created_at DESC
     LIMIT ?`,
    ciudad ? [ahora, ciudad, limite] : [ahora, limite]
  );
  return filas.map((f) => ({
    ...f,
    domicilio: !!f.domicilio,
    horario: parseJSON(f.horario, null),
    tema: parseJSON(f.tema, {}),
    quedan: f.porciones === null ? null : Math.max(0, f.porciones - f.vendidas),
  }));
}

/** Ciudades con negocios publicados (para filtrar "Hoy en ..."). */
export async function getCiudades() {
  const filas = await d1Select(
    `SELECT ciudad, COUNT(*) AS n FROM fastfoods
     WHERE estado = 'publicado' AND ciudad IS NOT NULL AND ciudad != ''
     GROUP BY LOWER(ciudad) ORDER BY n DESC`
  );
  return filas.map((f) => f.ciudad);
}
