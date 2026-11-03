"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Bolas de nieve al hacer clic (temporada de nieve): la bola sale desde abajo,
// crece como si viniera hacia quien mira, se estrella contra la "pantalla" y
// explota: queda una mancha de nieve pegada al vidrio que se escurre y se
// derrite, y salen pedacitos volando.

const ALTO_NAVBAR = 60;
const MAX_MANCHAS = 6;
const INTERACTIVOS =
  "a, button, input, textarea, select, label, summary, video, iframe, [role='button'], [contenteditable='true']";

// Mancha irregular: un círculo central y gotas alrededor
function crearMancha(tam) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "-100 -100 200 200");
  svg.setAttribute("width", tam);
  svg.setAttribute("height", tam);
  svg.style.overflow = "visible";

  // id único: si se borra una mancha, las demás no pierden su degradado
  const id = `nieve-mancha-${Math.random().toString(36).slice(2, 9)}`;
  const g = document.createElementNS(ns, "g");
  g.setAttribute("fill", `url(#${id})`);
  const defs = document.createElementNS(ns, "defs");
  defs.innerHTML = `
    <radialGradient id="${id}" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </radialGradient>`;
  svg.appendChild(defs);

  const circulo = (cx, cy, r) => {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", cx.toFixed(1));
    c.setAttribute("cy", cy.toFixed(1));
    c.setAttribute("r", r.toFixed(1));
    g.appendChild(c);
    return c;
  };

  circulo(0, 0, 42);
  const gotas = 9 + Math.floor(Math.random() * 5);
  for (let i = 0; i < gotas; i++) {
    const a = (i / gotas) * Math.PI * 2 + Math.random() * 0.4;
    const d = 38 + Math.random() * 28;
    // brazo que une la gota con el centro
    circulo(Math.cos(a) * d * 0.6, Math.sin(a) * d * 0.6, 12 + Math.random() * 8);
    circulo(Math.cos(a) * d, Math.sin(a) * d, 5 + Math.random() * 9);
    if (Math.random() < 0.5) {
      const d2 = d + 14 + Math.random() * 20;
      circulo(Math.cos(a) * d2, Math.sin(a) * d2, 2 + Math.random() * 4);
    }
  }
  // Chorritos que luego se escurren hacia abajo
  const chorros = [];
  for (let i = 0; i < 3; i++) {
    const x = -28 + Math.random() * 56;
    chorros.push(circulo(x, 30, 6 + Math.random() * 4));
  }
  svg.appendChild(g);
  return { svg, chorros };
}

export default function BolasDeNieve() {
  const capaRef = useRef(null);

  useEffect(() => {
    const capa = capaRef.current;
    if (!capa) return;
    const manchas = [];

    const estallar = (x, y) => {
      // Sacudida corta del "vidrio"
      gsap.fromTo(
        capa,
        { x: 0, y: 0 },
        {
          keyframes: [
            { x: -5, y: 3, duration: 0.04 },
            { x: 4, y: -3, duration: 0.04 },
            { x: -2, y: 2, duration: 0.04 },
            { x: 0, y: 0, duration: 0.05 },
          ],
        },
      );

      // Destello del golpe
      const golpe = document.createElement("div");
      Object.assign(golpe.style, {
        position: "absolute",
        left: `${x - 90}px`,
        top: `${y - 90}px`,
        width: "180px",
        height: "180px",
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(219,234,254,0.6) 40%, rgba(219,234,254,0) 70%)",
      });
      capa.appendChild(golpe);
      gsap.fromTo(
        golpe,
        { scale: 0.3, opacity: 1 },
        { scale: 1.8, opacity: 0, duration: 0.5, ease: "power2.out", onComplete: () => golpe.remove() },
      );

      // Mancha pegada a la pantalla
      const tam = 150 + Math.random() * 70;
      const { svg, chorros } = crearMancha(tam);
      const mancha = document.createElement("div");
      Object.assign(mancha.style, {
        position: "absolute",
        left: `${x - tam / 2}px`,
        top: `${y - tam / 2}px`,
        width: `${tam}px`,
        height: `${tam}px`,
        filter: "drop-shadow(0 3px 6px rgba(30,58,138,0.35))",
      });
      mancha.appendChild(svg);
      capa.appendChild(mancha);
      manchas.push(mancha);
      if (manchas.length > MAX_MANCHAS) {
        const vieja = manchas.shift();
        gsap.to(vieja, { opacity: 0, duration: 0.3, onComplete: () => vieja.remove() });
      }

      gsap
        .timeline({
          onComplete: () => {
            mancha.remove();
            const i = manchas.indexOf(mancha);
            if (i >= 0) manchas.splice(i, 1);
          },
        })
        .fromTo(
          mancha,
          { scale: 0.35, rotation: Math.random() * 360, opacity: 1 },
          { scale: 1, duration: 0.18, ease: "back.out(3)" },
        )
        // se queda pegada un momento, se escurre y se derrite
        .to(mancha, { y: "+=40", scaleY: 1.08, duration: 2.6, ease: "power1.in" }, 0.9)
        .to(mancha, { opacity: 0, duration: 1.2, ease: "power1.in" }, 2.3);

      chorros.forEach((c, i) => {
        gsap.to(c, {
          attr: { cy: 70 + Math.random() * 50 },
          duration: 2 + i * 0.4,
          delay: 0.6 + Math.random() * 0.4,
          ease: "power1.in",
        });
      });

      // Pedacitos que salen volando y caen
      const pedazos = 18 + Math.floor(Math.random() * 8);
      for (let i = 0; i < pedazos; i++) {
        const p = document.createElement("span");
        const lado = 4 + Math.random() * 9;
        Object.assign(p.style, {
          position: "absolute",
          left: "0",
          top: "0",
          width: `${lado}px`,
          height: `${lado}px`,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #ffffff, #e0ecff)",
          boxShadow: "0 1px 3px rgba(30,58,138,0.35)",
        });
        capa.appendChild(p);
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 140;
        gsap
          .timeline({ onComplete: () => p.remove() })
          .fromTo(
            p,
            { x: x - lado / 2, y: y - lado / 2, scale: 1.4, opacity: 1 },
            {
              x: x + Math.cos(a) * d,
              y: y + Math.sin(a) * d * 0.8 - 30,
              scale: 1,
              duration: 0.45 + Math.random() * 0.25,
              ease: "power3.out",
            },
          )
          .to(p, {
            y: `+=${120 + Math.random() * 160}`,
            x: `+=${(Math.random() - 0.5) * 40}`,
            opacity: 0,
            scale: 0.5,
            duration: 0.9 + Math.random() * 0.6,
            ease: "power2.in",
          });
      }
    };

    const lanzar = (x, y) => {
      // Sale desde abajo (como si alguien la lanzara) hacia el punto del clic
      const ancho = window.innerWidth;
      const alto = window.innerHeight - ALTO_NAVBAR;
      const desdeX = ancho * (0.3 + Math.random() * 0.4);
      const desdeY = alto + 40;
      const tam = 90;

      const bola = document.createElement("div");
      Object.assign(bola.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: `${tam}px`,
        height: `${tam}px`,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 32% 30%, #ffffff 0%, #f8fafc 35%, #dbeafe 70%, #93c5fd 100%)",
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
          const bx = desdeX + (x - desdeX) * t;
          const by = desdeY + (y - desdeY) * t - Math.sin(Math.PI * t) * altura;
          const escala = 0.15 + t * 1.35; // crece: viene hacia la pantalla
          gsap.set(bola, {
            x: bx - tam / 2,
            y: by - tam / 2,
            scale: escala,
            rotation: t * 300,
          });
        },
        onComplete: () => {
          bola.remove();
          estallar(x, y);
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
      gsap.killTweensOf(capa);
      capa.replaceChildren();
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
