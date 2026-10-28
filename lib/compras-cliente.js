// Compras de un cliente en neurai.dev, cruzando las tres fuentes:
//   · orders  → pedidos online (ePayco); casi nunca guardan clerk_user_id, por
//               eso también se buscan por customer_email
//   · ventas  → ventas registradas a mano en el dashboard (tienda / servicios)
//   · clientes → ficha del cliente (totales acumulados)
// Lo usan la verificación de calificaciones del panel y el perfil del cliente.
import { d1Select } from "@/lib/db";

const limpiarEmail = (e) => String(e || "").trim().toLowerCase();
// Últimos 10 dígitos: 3001234567, +57 300 123 4567 y 573001234567 coinciden
const limpiarTelefono = (t) => String(t || "").replace(/\D/g, "").slice(-10);

function parse(json) {
  if (!json || typeof json !== "string") return json || null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const PEDIDO_PAGADO = (p) =>
  p.estado_pago === "completado" || p.estado === "completado" || p.estado === "pagado";

/** Productos de un pedido (viven en metadata.productos; order_items está vacía). */
export function itemsDePedido(pedido) {
  const meta = parse(pedido.metadata) || {};
  return (meta.productos || []).map((it, i) => ({
    id: `${pedido.id}-${i}`,
    producto_id: it.id,
    nombre_producto: it.name || it.nombre || "Producto",
    cantidad: Number(it.quantity ?? it.cantidad) || 1,
    precio_unitario: Number(it.price ?? it.precio) || 0,
    subtotal: (Number(it.price ?? it.precio) || 0) * (Number(it.quantity ?? it.cantidad) || 1),
  }));
}

/**
 * @param {{ userId?: string, emails?: string[], telefonos?: string[], nombre?: string, conCoincidenciasPorNombre?: boolean }} q
 */
export async function buscarComprasCliente({
  userId = null,
  emails = [],
  telefonos = [],
  nombre = "",
  conCoincidenciasPorNombre = false,
}) {
  const correos = [...new Set(emails.map(limpiarEmail).filter(Boolean))];
  const tels = [...new Set(telefonos.map(limpiarTelefono).filter((t) => t.length >= 7))];
  const marcas = (arr) => arr.map(() => "?").join(", ");

  // Pedidos online por cuenta o correo
  const condPedidos = [];
  const paramsPedidos = [];
  if (userId) {
    condPedidos.push("clerk_user_id = ?");
    paramsPedidos.push(userId);
  }
  if (correos.length) {
    condPedidos.push(`LOWER(customer_email) IN (${marcas(correos)})`);
    paramsPedidos.push(...correos);
  }
  const pedidos = condPedidos.length
    ? await d1Select(
        `SELECT id, numero_orden, estado, estado_pago, total, descuentos, metodo_pago, created_at,
                fecha_pago, numero_seguimiento, transportadora, customer_name, customer_email, metadata
           FROM orders WHERE ${condPedidos.join(" OR ")} ORDER BY created_at DESC LIMIT 100`,
        paramsPedidos,
      ).catch(() => [])
    : [];

  // Ventas registradas a mano, por correo o teléfono
  const condVentas = [];
  const paramsVentas = [];
  if (correos.length) {
    condVentas.push(`LOWER(cliente_email) IN (${marcas(correos)})`);
    paramsVentas.push(...correos);
  }
  if (tels.length) {
    condVentas.push(
      `substr(replace(replace(replace(replace(COALESCE(cliente_telefono,''),' ',''),'+',''),'-',''),'(',''), -10) IN (${marcas(tels)})`,
    );
    paramsVentas.push(...tels);
  }
  const ventas = condVentas.length
    ? await d1Select(
        `SELECT id, numero_venta, fecha_venta, producto_nombre, cantidad, subtotal_venta,
                cliente_nombre, cliente_email, cliente_telefono, metodo_pago
           FROM ventas WHERE ${condVentas.join(" OR ")} ORDER BY fecha_venta DESC LIMIT 100`,
        paramsVentas,
      ).catch(() => [])
    : [];

  // Ficha del cliente
  const cliente = correos.length
    ? (
        await d1Select(
          `SELECT id, nombre, telefono, email, total_compras, total_gastado, fecha_primera_compra, fecha_ultima_compra
             FROM clientes WHERE LOWER(email) IN (${marcas(correos)}) LIMIT 1`,
          correos,
        ).catch(() => [])
      )[0] || null
    : null;

  // Solo para el admin: ventas cuyo nombre se parece (no es prueba, es pista)
  let porNombre = [];
  const palabras = String(nombre || "")
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => p.length >= 3)
    .slice(0, 2);
  if (conCoincidenciasPorNombre && palabras.length) {
    const yaVistas = new Set(ventas.map((v) => v.id));
    porNombre = (
      await d1Select(
        `SELECT id, numero_venta, fecha_venta, producto_nombre, cantidad, subtotal_venta,
                cliente_nombre, cliente_telefono
           FROM ventas WHERE ${palabras.map(() => "LOWER(cliente_nombre) LIKE ?").join(" AND ")}
          ORDER BY fecha_venta DESC LIMIT 20`,
        palabras.map((p) => `%${p}%`),
      ).catch(() => [])
    ).filter((v) => !yaVistas.has(v.id));
  }

  const pagados = pedidos.filter(PEDIDO_PAGADO);
  const totalOnline = pagados.reduce((s, p) => s + (Number(p.total) || 0), 0);
  const totalVentas = ventas.reduce((s, v) => s + (Number(v.subtotal_venta) || 0), 0);
  const fechas = [
    ...pagados.map((p) => p.fecha_pago || p.created_at),
    ...ventas.map((v) => v.fecha_venta),
  ].filter(Boolean).sort();

  return {
    pedidos,
    ventas,
    cliente,
    porNombre,
    resumen: {
      haComprado: pagados.length > 0 || ventas.length > 0 || Number(cliente?.total_compras) > 0,
      pedidosPagados: pagados.length,
      ventasRegistradas: ventas.length,
      totalGastado: totalOnline + totalVentas,
      primeraCompra: fechas[0] || null,
      ultimaCompra: fechas[fechas.length - 1] || null,
    },
  };
}
