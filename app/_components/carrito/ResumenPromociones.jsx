"use client";

import { useCart } from "@/context/CartContext";

/**
 * En el carrito, encima del total: subtotal, descuentos de promociones
 * aplicados y, si falta poco, cuántas unidades faltan para activar una.
 */
export default function ResumenPromociones() {
  const { cart, getSubtotal, descuentosPromociones, promociones, descuentoCliente } = useCart();

  // "Lleva 2 más y obtén 10%": promos de un solo producto que aún no se activan
  const pistas = [];
  for (const promo of promociones || []) {
    const ids = promo.productos_ids || [];
    if (ids.length !== 1 || descuentosPromociones.some((d) => d.promocion_id === promo.id)) continue;
    const cantidad = cart
      .filter((i) => String(i.id) === String(ids[0]) && !i.seller_clerk_user_id)
      .reduce((s, i) => s + i.cantidad, 0);
    const minimo = promo.cantidad_minima || 1;
    if (cantidad > 0 && cantidad < minimo) {
      const nombre = cart.find((i) => String(i.id) === String(ids[0]))?.nombre || promo.nombre;
      pistas.push(
        `Agrega ${minimo - cantidad} más de ${nombre} y obtén ${promo.descuento_valor}% de descuento`,
      );
    }
  }

  const hayDescuentos = descuentosPromociones.length > 0 || Boolean(descuentoCliente);
  if (!hayDescuentos && pistas.length === 0) return null;

  return (
    <div className="space-y-1 text-sm">
      {pistas.map((texto) => (
        <p
          key={texto}
          className="rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-3 py-2"
        >
          🔥 {texto}
        </p>
      ))}
      {hayDescuentos && (
        <>
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span>Subtotal</span>
            <span>${getSubtotal().toLocaleString("es-CO")}</span>
          </div>
          {descuentosPromociones.map((d) => (
            <div
              key={d.promocion_id}
              className="flex items-center justify-between text-blue-700 dark:text-blue-300 font-medium"
            >
              <span>🔥 {d.nombre}</span>
              <span>-${d.monto.toLocaleString("es-CO")}</span>
            </div>
          ))}
          {descuentoCliente && (
            <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 font-medium">
              <span>⭐ Descuento cliente ({descuentoCliente.porcentaje}%)</span>
              <span>-${descuentoCliente.monto.toLocaleString("es-CO")}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
