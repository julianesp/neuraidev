"use client";

import dynamic from "next/dynamic";
import useTemporadas, { useMovimientoReducido } from "./useTemporadas";

// La escena (GSAP, framer-motion y tsParticles) solo se descarga del 1° al
// 7 de enero o cuando el admin enciende la vista previa.
const CarnavalEscena = dynamic(() => import("./CarnavalEscena"), { ssr: false });

export default function Carnaval() {
  const temporadas = useTemporadas();
  const reducido = useMovimientoReducido();
  if (!temporadas?.carnaval) return null;
  return (
    <CarnavalEscena
      dia={temporadas.carnaval}
      vistaPrevia={temporadas.previewCarnaval}
      reducido={reducido}
    />
  );
}
