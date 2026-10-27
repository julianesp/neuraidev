"use client";

import { useEffect, useState } from "react";
import { TIPOS_OFERTA } from "@/lib/precios";

// Tiempo restante legible: "3 días", "5 h 20 min", "12 min".
function restante(hastaMs, ahora) {
  const ms = hastaMs - ahora;
  if (ms <= 0) return null;
  const min = Math.floor(ms / 60000);
  const dias = Math.floor(min / 1440);
  if (dias >= 2) return `${dias} días`;
  const h = Math.floor(min / 60);
  if (h >= 1) return `${h} h ${min % 60} min`;
  return `${Math.max(min, 1)} min`;
}

/**
 * Etiqueta de "Oferta" / "Precio de lanzamiento" con ahorro y cuenta regresiva.
 * Recibe el producto ya pasado por aplicarPrecioVigente (lib/precios.js).
 *   variante="detalle" → bloque grande para la ficha del producto
 *   variante="tarjeta" → píldora pequeña para las tarjetas del catálogo
 */
export default function EtiquetaOferta({ producto, variante = "detalle" }) {
  const tipo = TIPOS_OFERTA[producto?.ofertaTipo];
  const hastaMs = producto?.ofertaHasta ? new Date(producto.ofertaHasta).getTime() : null;
  // null hasta montar: evita diferencias de hidratación con la hora del servidor
  const [ahora, setAhora] = useState(null);

  useEffect(() => {
    if (!hastaMs) return;
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 60000);
    return () => clearInterval(t);
  }, [hastaMs]);

  if (!tipo || !producto.precioAnterior) return null;

  const ahorro = producto.precioAnterior - producto.precio;
  const pct = Math.round((ahorro / producto.precioAnterior) * 100);
  const queda = hastaMs && ahora ? restante(hastaMs, ahora) : null;

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
        {queda && (
          <>
            {" "}
            <strong>Termina en {queda}.</strong>
          </>
        )}
      </p>
    </div>
  );
}
