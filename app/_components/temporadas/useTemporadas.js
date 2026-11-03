"use client";

import { useEffect, useState } from "react";
import {
  estadoTemporadas,
  leerPreview,
  PREVIEW_KEY,
  TEMPORADAS_EVENTO,
} from "@/lib/temporadas";

// Estado de las temporadas, recalculado cada 15 minutos (para que el cambio
// de día llegue sin recargar) y cuando el admin cambia la vista previa,
// incluso desde otra pestaña.
export default function useTemporadas() {
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    const actualizar = () => setEstado(estadoTemporadas(leerPreview()));
    actualizar();

    const alGuardar = (e) => {
      if (!e.key || e.key === PREVIEW_KEY) actualizar();
    };
    const intervalo = setInterval(actualizar, 15 * 60 * 1000);
    window.addEventListener(TEMPORADAS_EVENTO, actualizar);
    window.addEventListener("storage", alGuardar);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener(TEMPORADAS_EVENTO, actualizar);
      window.removeEventListener("storage", alGuardar);
    };
  }, []);

  return estado;
}

// true si el usuario pidió reducir el movimiento en su sistema
export function useMovimientoReducido() {
  const [reducido, setReducido] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cambio = () => setReducido(mq.matches);
    cambio();
    mq.addEventListener("change", cambio);
    return () => mq.removeEventListener("change", cambio);
  }, []);
  return reducido;
}
