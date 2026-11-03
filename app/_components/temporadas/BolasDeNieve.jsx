"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Una bola de nieve por clic (temporada de nieve): sale desde abajo, crece
// como si viniera hacia quien mira, se estrella contra la "pantalla" y se
// aplasta en una sola mancha que se derrite. Solo hay una bola a la vez:
// un clic nuevo quita la anterior.

const ALTO_NAVBAR = 60;
const TAM_BOLA = 30;
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
          { x: -2, y: 1, duration: 0.04 },
          { x: 2, y: -1, duration: 0.04 },
          { x: 0, y: 0, duration: 0.05 },
        ],
      });

      // La misma bola se aplasta contra la pantalla y, como si estuviera
      // pegada a un vidrio, se escurre rápido hacia abajo estirándose como
      // una gota y dejando un rastro húmedo
      const tam = 50;
      const caida = 110; // cuánto baja deslizándose
      gsap.set(bola, {
        x: x - tam / 2,
        y: y - tam / 2,
        width: tam,
        height: tam,
        scale: 1,
        rotation: 0,
        transformOrigin: "50% 15%",
        borderRadius: "48% 52% 45% 55% / 55% 45% 55% 45%",
      });

      const rastro = document.createElement("div");
      Object.assign(rastro.style, {
        position: "absolute",
        left: `${x - 13}px`,
        top: `${y - 6}px`,
        width: "26px",
        height: "0px",
        borderRadius: "13px",
        background:
          "linear-gradient(to bottom, rgba(248,250,252,0.15), rgba(219,234,254,0.75))",
        boxShadow: "0 0 4px rgba(30,58,138,0.2)",
      });
      capa.insertBefore(rastro, bola);

      gsap
        .timeline({
          onComplete: () => {
            bola.remove();
            rastro.remove();
          },
        })
        .fromTo(
          bola,
          { scaleX: 0.6, scaleY: 0.6 },
          { scaleX: 1.15, scaleY: 0.9, duration: 0.12, ease: "power2.out" },
        )
        .to(bola, { scaleX: 1, scaleY: 1, duration: 0.2, ease: "back.out(2)" })
        // pegada un instante y luego se desliza rápido, cada vez más estirada
        .to(
          bola,
          {
            y: `+=${caida}`,
            scaleY: 2.4,
            scaleX: 0.7,
            borderRadius: "50% 50% 46% 46% / 30% 30% 70% 70%",
            duration: 0.7,
            ease: "power1.in",
          },
          0.35,
        )
        .to(rastro, { height: caida + 30, duration: 0.7, ease: "power1.in" }, 0.35)
        .to(bola, { opacity: 0, duration: 0.4, ease: "power1.in" }, 0.8)
        .to(rastro, { opacity: 0, duration: 0.8, ease: "power1.out" }, 0.95);
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
          "inset -2px -3px 5px rgba(59,130,246,0.25), 0 2px 6px rgba(30,58,138,0.35)",
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
