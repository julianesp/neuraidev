"use client";

import { useEffect } from "react";

// Cuenta UNA visita por sesión del navegador y negocio, solo cuando la página se está viendo de verdad
// (no en precargas en segundo plano) y solo en navegadores reales (los robots no ejecutan esto).
export default function RegistrarVista({ negocioId }) {
  useEffect(() => {
    const clave = `dir-vista:${negocioId}`;
    const enviar = () => {
      try {
        if (sessionStorage.getItem(clave)) return;
        sessionStorage.setItem(clave, "1");
      } catch {
        /* sin sessionStorage: se cuenta igual, el servidor también filtra repeticiones */
      }
      try {
        navigator.sendBeacon(
          "/api/directorio/evento",
          new Blob([JSON.stringify({ id: negocioId, tipo: "vista" })], { type: "application/json" })
        );
      } catch {
        /* las estadísticas nunca deben afectar la página */
      }
    };

    if (document.visibilityState === "visible") {
      enviar();
      return;
    }
    const alVolverVisible = () => {
      if (document.visibilityState === "visible") {
        document.removeEventListener("visibilitychange", alVolverVisible);
        enviar();
      }
    };
    document.addEventListener("visibilitychange", alVolverVisible);
    return () => document.removeEventListener("visibilitychange", alVolverVisible);
  }, [negocioId]);

  return null;
}
