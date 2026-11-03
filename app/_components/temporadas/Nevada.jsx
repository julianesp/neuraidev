"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import useTemporadas, { useMovimientoReducido } from "./useTemporadas";
import { COPOS_MAX } from "@/lib/temporadas";

// Copos de nieve que salen por debajo del navbar y caen hasta el footer
// (se posan sobre su borde y se derriten). La cantidad la da la fecha
// (lib/temporadas.js). Canvas 2D con sprites pre-dibujados: es lo más liviano
// para tenerlo en todas las páginas.

// Bolas de nieve al hacer clic (GSAP): se descargan solo en temporada
const BolasDeNieve = dynamic(() => import("./BolasDeNieve"), { ssr: false });

const ALTO_NAVBAR = 60;
const RUTAS_SIN_NIEVE = ["/dashboard", "/admin", "/sign-in", "/sign-up"];

// Dibuja un copo una sola vez en un canvas pequeño para reutilizarlo
function crearSprite(radio, cristal, oscuro) {
  const lado = Math.ceil(radio * 2 + 4);
  const c = document.createElement("canvas");
  c.width = c.height = lado;
  const ctx = c.getContext("2d");
  const centro = lado / 2;
  // Modo claro: copo azul muy suave con borde gris-azulado para que se vea
  // sobre fondos blancos. Modo oscuro: blanco.
  const relleno = oscuro ? "rgba(255,255,255,0.95)" : "rgba(219,234,254,0.95)";
  const borde = oscuro ? "rgba(255,255,255,0.9)" : "rgba(96,165,250,0.85)";

  if (cristal) {
    ctx.strokeStyle = borde;
    ctx.lineWidth = Math.max(1, radio / 6);
    ctx.lineCap = "round";
    ctx.translate(centro, centro);
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -radio);
      // ramitas
      ctx.moveTo(0, -radio * 0.55);
      ctx.lineTo(radio * 0.28, -radio * 0.78);
      ctx.moveTo(0, -radio * 0.55);
      ctx.lineTo(-radio * 0.28, -radio * 0.78);
      ctx.stroke();
    }
  } else {
    const g = ctx.createRadialGradient(centro, centro, 0, centro, centro, radio);
    g.addColorStop(0, relleno);
    g.addColorStop(0.6, relleno);
    g.addColorStop(1, oscuro ? "rgba(255,255,255,0)" : "rgba(147,197,253,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(centro, centro, radio, 0, Math.PI * 2);
    ctx.fill();
    if (!oscuro) {
      ctx.strokeStyle = "rgba(96,165,250,0.45)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(centro, centro, radio * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  return c;
}

function nuevoCopo(ancho, alto, alInicio) {
  const profundidad = Math.random(); // 0 = lejos, 1 = cerca
  const cristal = Math.random() < 0.28;
  const radio = cristal ? 5 + profundidad * 6 : 1.5 + profundidad * 3;
  return {
    x: Math.random() * ancho,
    // Al cargar se reparten por la pantalla; después nacen bajo el navbar
    y: alInicio ? Math.random() * alto : -radio * 2 - Math.random() * 40,
    radio,
    cristal,
    profundidad,
    vy: 0.35 + profundidad * 0.9 + Math.random() * 0.3,
    fase: Math.random() * Math.PI * 2,
    amplitud: 0.3 + Math.random() * 0.8,
    giro: Math.random() * Math.PI * 2,
    vGiro: (Math.random() - 0.5) * 0.02,
    alpha: 0.55 + profundidad * 0.45,
    posado: 0, // > 0 mientras se derrite sobre el footer
    offsetX: 0,
  };
}

export default function Nevada() {
  const temporadas = useTemporadas();
  const reducido = useMovimientoReducido();
  const pathname = usePathname();
  const canvasRef = useRef(null);

  const intensidad = temporadas?.nieve ?? 0;
  const excluida = RUTAS_SIN_NIEVE.some((r) => pathname?.startsWith(r));
  const activa = intensidad > 0 && !excluida && !reducido;

  useEffect(() => {
    if (!activa) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let ancho = 0;
    let alto = 0;
    let dpr = 1;
    let copos = [];
    let sprites = null;
    let oscuro = document.documentElement.classList.contains("dark");
    let raf = 0;
    let tiempo = 0;
    let viento = 0;
    let vientoObjetivo = 0;
    let ultimoScroll = window.scrollY;
    let empujeScroll = 0;
    let puntero = { x: -9999, y: -9999 };
    let footer = null;
    let footerTop = Infinity;

    const cantidadObjetivo = () => {
      const movil = window.innerWidth < 768;
      return Math.max(1, Math.round(COPOS_MAX * intensidad * (movil ? 0.5 : 1)));
    };

    const prepararSprites = () => {
      sprites = { punto: new Map(), cristal: new Map() };
    };
    const spriteDe = (copo) => {
      const tipo = copo.cristal ? "cristal" : "punto";
      const clave = Math.round(copo.radio * 2) / 2;
      let s = sprites[tipo].get(clave);
      if (!s) {
        s = crearSprite(clave * dpr, copo.cristal, oscuro);
        sprites[tipo].set(clave, s);
      }
      return s;
    };

    const medir = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      ancho = window.innerWidth;
      alto = window.innerHeight - ALTO_NAVBAR;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      canvas.style.width = `${ancho}px`;
      canvas.style.height = `${alto}px`;
      prepararSprites();

      const objetivo = cantidadObjetivo();
      if (copos.length === 0) {
        copos = Array.from({ length: objetivo }, () => nuevoCopo(ancho, alto, true));
      } else if (copos.length > objetivo) {
        copos.length = objetivo;
      } else {
        while (copos.length < objetivo) copos.push(nuevoCopo(ancho, alto, false));
      }
    };

    const medirFooter = () => {
      if (!footer || !footer.isConnected) {
        footer = document.querySelector("[data-pie-sitio]");
      }
      footerTop = footer
        ? footer.getBoundingClientRect().top - ALTO_NAVBAR
        : Infinity;
    };

    const alScroll = () => {
      const y = window.scrollY;
      empujeScroll += (y - ultimoScroll) * 0.25;
      ultimoScroll = y;
      medirFooter();
    };
    const alMoverPuntero = (e) => {
      puntero = { x: e.clientX, y: e.clientY - ALTO_NAVBAR };
    };
    const alSalirPuntero = () => {
      puntero = { x: -9999, y: -9999 };
    };

    const observadorTema = new MutationObserver(() => {
      const ahora = document.documentElement.classList.contains("dark");
      if (ahora !== oscuro) {
        oscuro = ahora;
        prepararSprites();
      }
    });
    observadorTema.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const cuadro = () => {
      tiempo += 1;
      // Cambios de viento suaves cada cierto tiempo
      if (tiempo % 360 === 0) vientoObjetivo = (Math.random() - 0.5) * 1.2;
      viento += (vientoObjetivo - viento) * 0.005;
      empujeScroll *= 0.9;
      if (tiempo % 20 === 0) medirFooter();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const piso = Math.min(alto, footerTop);

      for (let i = 0; i < copos.length; i++) {
        const c = copos[i];

        if (c.posado > 0) {
          // Derritiéndose sobre el borde del footer (sigue al footer al hacer scroll)
          c.posado -= 0.008;
          c.y = footerTop - c.radio * 0.6;
          if (c.posado <= 0 || footerTop > alto + 20 || footerTop < -20) {
            copos[i] = nuevoCopo(ancho, alto, false);
            continue;
          }
        } else {
          c.fase += 0.01 + c.profundidad * 0.01;
          c.x += Math.sin(c.fase) * c.amplitud * 0.5 + viento * (0.4 + c.profundidad);
          c.y += c.vy - empujeScroll * (0.2 + c.profundidad * 0.3);
          c.giro += c.vGiro;

          // Se apartan un poco del cursor
          const dx = c.x - puntero.x;
          const dy = c.y - puntero.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 6400) {
            const fuerza = (1 - Math.sqrt(d2) / 80) * 1.5;
            c.offsetX += (dx > 0 ? 1 : -1) * fuerza;
          }
          c.offsetX *= 0.94;

          if (c.y >= piso - c.radio * 0.6) {
            if (piso < alto && c.x > 0 && c.x < ancho) {
              c.posado = 1; // llegó al footer
            } else {
              copos[i] = nuevoCopo(ancho, alto, false);
              continue;
            }
          }
          if (c.y < -60) c.y = alto - 1; // scroll hacia arriba rápido
          if (c.x < -20) c.x = ancho + 20;
          if (c.x > ancho + 20) c.x = -20;
        }

        const s = spriteDe(c);
        const alpha = c.posado > 0 ? c.alpha * c.posado : c.alpha;
        ctx.globalAlpha = alpha;
        const px = (c.x + c.offsetX) * dpr;
        const py = c.y * dpr;
        if (c.cristal) {
          ctx.setTransform(1, 0, 0, 1, px, py);
          ctx.rotate(c.giro);
          ctx.drawImage(s, -s.width / 2, -s.height / 2);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
          ctx.drawImage(s, px - s.width / 2, py - s.height / 2);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(cuadro);
    };

    const alCambiarVisibilidad = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(cuadro);
    };

    medir();
    medirFooter();
    raf = requestAnimationFrame(cuadro);
    window.addEventListener("resize", medir);
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("pointermove", alMoverPuntero, { passive: true });
    document.addEventListener("pointerleave", alSalirPuntero);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      cancelAnimationFrame(raf);
      observadorTema.disconnect();
      window.removeEventListener("resize", medir);
      window.removeEventListener("scroll", alScroll);
      window.removeEventListener("pointermove", alMoverPuntero);
      document.removeEventListener("pointerleave", alSalirPuntero);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, [activa, intensidad, pathname]);

  if (!activa) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: ALTO_NAVBAR,
          left: 0,
          // Debajo del navbar (2002), menús, carrito y modales
          zIndex: 900,
          pointerEvents: "none",
        }}
      />
      <BolasDeNieve />
    </>
  );
}
