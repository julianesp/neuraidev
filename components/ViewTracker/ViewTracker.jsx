"use client";

import { useEffect, useRef } from "react";

/**
 * Genera o recupera un sessionID único para el visitante
 */
function getSessionId() {
  if (typeof window === "undefined") return null;

  let sessionId = sessionStorage.getItem("visitor_session_id");

  if (!sessionId) {
    // Generar un ID único combinando timestamp + random
    sessionId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem("visitor_session_id", sessionId);
  }

  return sessionId;
}

/**
 * Componente invisible que registra una visita al producto.
 * Se llama una sola vez cuando el usuario abre la página del producto.
 * Trackea visitantes únicos usando sessionID.
 */
export default function ViewTracker({ productId }) {
  const tracked = useRef(false);

  useEffect(() => {
    // Evitar doble llamada (StrictMode en dev monta 2 veces)
    if (tracked.current || !productId) return;
    tracked.current = true;

    const sessionId = getSessionId();

    if (!sessionId) return;

    // Esperar 1 segundo para no bloquear el render inicial
    const timer = setTimeout(() => {
      fetch(`/api/products/${productId}/track-view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {
        // Silenciar errores — no es crítico para el usuario
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [productId]);

  // No renderiza nada visible
  return null;
}
