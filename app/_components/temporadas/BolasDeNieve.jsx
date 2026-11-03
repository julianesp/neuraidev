"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Una bola de nieve por clic (temporada de nieve): sale desde abajo, crece
// como si viniera hacia quien mira, se estrella contra la "pantalla" y se
// aplasta en una sola mancha que se derrite. Solo hay una bola a la vez:
// un clic nuevo quita la anterior.

const ALTO_NAVBAR = 60;
const TAM_BOLA = 90;
const INTERACTIVOS =
  "a, button, input, textarea, select, label, summary, video, iframe, [role='button'], [contenteditable='true']";

const FONDO_BOLA =
  "radial-gradient(circle at 32% 30%, #ffffff 0%, #f8fafc 35%, #dbeafe 70%, #93c5fd 100%)";

export default function BolasDeNieve() {
  const capaRef = useRef(null);

  useEffect(() => {
    const capa = capaRef.current;
    if (!capa) return;

    const limpiar = () => {
      gsap.killTweensOf(capa.querySelectorAll("*"));
      gsap.set(capa, { x: 0, y: 0 });
      capa.replaceChildren();
    };

    const estallar = (bola, x, y) => {
      // Sacudida corta del "vidrio"
      gsap.to(capa, {
        keyframes: [
          { x: -5, y: 3, duration: 0.04 },
          { x: 4, y: -3, duration: 0.04 },
          { x: 0, y: 0, duration: 0.05 },
        ],
      });

      // La misma bola se aplasta contra la pantalla, se escurre y se derrite
      const tam = 150;
      gsap.set(bola, {
        x: x - tam / 2,
        y: y - tam / 2,
        width: tam,
        height: tam,
        scale: 1,
        rotation: 0,
        borderRadius: "48% 52% 45% 55% / 55% 45% 55% 45%",
      });
      gsap
        .timeline({ onComplete: () => bola.remove() })
        .fromTo(
          bola,
          { scaleX: 0.6, scaleY: 0.6 },
          { scaleX: 1.15, scaleY: 0.9, duration: 0.12, ease: "power2.out" },
        )
        .to(bola, { scaleX: 1, scaleY: 1, duration: 0.25, ease: "back.out(2)" })
        .to(bola, { y: "+=50", scaleY: 1.12, duration: 2.4, ease: "power1.in" }, 0.9)
        .to(bola, { opacity: 0, duration: 1.1, ease: "power1.in" }, 2.2);
    };

    const lanzar = (x, y) => {
      limpiar();
      const alto = window.innerHeight - ALTO_NAVBAR;
      const desdeX = window.innerWidth * (0.3 + Math.random() * 0.4);
      const desdeY = alto + 40;

      const bola = document.createElement("div");
      Object.assign(bola.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: `${TAM_BOLA}px`,
        height: `${TAM_BOLA}px`,
        borderRadius: "50%",
        background: FONDO_BOLA,
        boxShadow:
          "inset -6px -8px 14px rgba(59,130,246,0.25), 0 6px 18px rgba(30,58,138,0.35)",
      });
      capa.appendChild(bola);

      // Arco: sube un poco por encima de la línea recta mientras se acerca
      const arco = { t: 0 };
      const altura = Math.min(160, Math.abs(desdeY - y) * 0.35);
      gsap.to(arco, {
        t: 1,
        duration: 0.42,
        ease: "power1.in",
        onUpdate: () => {
          const t = arco.t;
          gsap.set(bola, {
            x: desdeX + (x - desdeX) * t - TAM_BOLA / 2,
            y: desdeY + (y - desdeY) * t - Math.sin(Math.PI * t) * altura - TAM_BOLA / 2,
            scale: 0.15 + t * 1.35, // crece: viene hacia la pantalla
            rotation: t * 300,
          });
        },
        onComplete: () => {
          if (bola.isConnected) estallar(bola, x, y);
        },
      });
    };

    const alClic = (e) => {
      if (e.button !== 0) return;
      if (e.target.closest(INTERACTIVOS)) return;
      if (window.getSelection()?.toString()) return; // estaba seleccionando texto
      lanzar(e.clientX, e.clientY - ALTO_NAVBAR);
    };

    // "click" y no "pointerdown": en el celular no se dispara al hacer scroll
    document.addEventListener("click", alClic);
    return () => {
      document.removeEventListener("click", alClic);
      limpiar();
    };
  }, []);

  return (
    <div
      ref={capaRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: ALTO_NAVBAR,
        left: 0,
        right: 0,
        bottom: 0,
        // Encima de la nieve, debajo del navbar (2002) y de los modales
        zIndex: 901,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    />
  );
}
