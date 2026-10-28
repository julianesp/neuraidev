// Descuento de cliente de servicio técnico: 15% en UNA compra de la tienda,
// para quien ya contrató formateo/mantenimiento y dejó su calificación, una
// vez que el admin la aprueba. Sin códigos: vive en la cuenta Clerk del
// cliente, en publicMetadata.descuento_cliente:
//   { porcentaje: 15, estado: 'disponible' | 'reservado' | 'usado',
//     testimonio_id, activado_at, orden?, usado_at? }
// 'reservado' = se aplicó a un pago que aún no se confirma; si ese pago no se
// completa, el descuento sigue sirviendo para el siguiente intento.
// Funciones puras: las usan el carrito y el checkout del servidor.

export const PORCENTAJE_DESCUENTO_CLIENTE = 15;

export function descuentoUsable(meta) {
  const d = meta?.descuento_cliente;
  if (!d) return null;
  if (d.estado !== "disponible" && d.estado !== "reservado") return null;
  const pct = Number(d.porcentaje) || PORCENTAJE_DESCUENTO_CLIENTE;
  return pct > 0 && pct < 100 ? { ...d, porcentaje: pct } : null;
}

// Monto a descontar sobre la base (subtotal ya con promociones)
export function montoDescuentoCliente(base, meta) {
  const d = descuentoUsable(meta);
  if (!d || !(base > 0)) return 0;
  return Math.round(base * (d.porcentaje / 100));
}
