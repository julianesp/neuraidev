"use client";

import { TIPOS_OFERTA } from "@/lib/precios";

/**
 * Etiqueta de "Oferta" / "Precio de lanzamiento" con el ahorro. No se muestra
 * cuándo termina: la fecha solo sirve para que el descuento se apague solo.
 * Recibe el producto ya pasado por aplicarPrecioVigente (lib/precios.js).
 *   variante="detalle" → bloque grande para la ficha del producto
 *   variante="tarjeta" → píldora pequeña para las tarjetas del catálogo
 */
export default function EtiquetaOferta({ producto, variante = "detalle" }) {
  const tipo = TIPOS_OFERTA[producto?.ofertaTipo];
  if (!tipo || !producto.precioAnterior) return null;

  const ahorro = producto.precioAnterior - producto.precio;
  const pct = Math.round((ahorro / producto.precioAnterior) * 100);

  if (variante === "tarjeta") {
    return (
      <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
        {tipo.emoji} {producto.ofertaTipo === "lanzamiento" ? "Lanzamiento" : `-${pct}%`}
      </span>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3">
      <p className="font-bold text-blue-700 dark:text-blue-300">
        {tipo.emoji} {producto.ofertaNombre || tipo.etiqueta}
        <span className="ml-2 inline-block bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full align-middle">
          -{pct}%
        </span>
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
        Ahorras ${ahorro.toLocaleString("es-CO")}
        {producto.ofertaTipo === "lanzamiento" && " por ser de los primeros en comprarlo"}
        .
      </p>
    </div>
  );
}
