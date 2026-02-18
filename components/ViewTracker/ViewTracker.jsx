"use client";

import { useEffect, useRef } from "react";

/**
 * Componente invisible que registra una visita al producto.
 * Se llama una sola vez cuando el usuario abre la página del producto.
 */
export default function ViewTracker({ productId }) {
  const tracked = useRef(false);

  useEffect(() => {
    // Evitar doble llamada (StrictMode en dev monta 2 veces)
    if (tracked.current || !productId) return;
    tracked.current = true;

    // Esperar 1 segundo para no bloquear el render inicial
    const timer = setTimeout(() => {
      fetch(`/api/products/${productId}/track-view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {
        // Silenciar errores — no es crítico para el usuario
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [productId]);

  // No renderiza nada visible
  return null;
}
