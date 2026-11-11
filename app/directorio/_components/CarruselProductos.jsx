"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const VELOCIDAD = 40; // px por segundo
const REANUDAR_MS = 1500; // espera tras soltar el dedo/mouse antes de seguir solo

// Fila de productos que transita sola y también se puede mover arrastrando
// (mouse) o deslizando (dedo). Se detiene al pasar el mouse o tocarla.
export default function CarruselProductos({ productos }) {
  const veces = Math.max(1, Math.ceil(14 / productos.length));
  const bloque = Array.from({ length: veces }, () => productos).flat();

  const contenedor = useRef(null);
  const pausa = useRef({ hover: false, toque: false, arrastre: false, hasta: 0 });
  const arrastre = useRef({ x: 0, scroll: 0, movido: false });

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mitad = () => el.scrollWidth / 2;

    el.scrollLeft = 1; // empieza en 1 para poder ir a la izquierda enseguida
    let pos = el.scrollLeft;
    let anterior = performance.now();
    let raf;

    // Bucle continuo: al pasar la mitad (copia 1 → copia 2) salta sin que se note.
    const envolver = () => {
      const m = mitad();
      if (!m) return;
      if (el.scrollLeft >= m) el.scrollLeft -= m;
      else if (el.scrollLeft <= 0) el.scrollLeft += m;
    };

    const paso = (ahora) => {
      const dt = Math.min((ahora - anterior) / 1000, 0.1);
      anterior = ahora;
      const p = pausa.current;
      const quieto =
        reducido || p.hover || p.toque || p.arrastre || ahora < p.hasta || document.hidden;
      if (quieto) {
        pos = el.scrollLeft;
      } else {
        pos += VELOCIDAD * dt;
        el.scrollLeft = pos;
        envolver();
        pos = el.scrollLeft;
      }
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);

    const alScroll = () => envolver();
    el.addEventListener("scroll", alScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", alScroll);
    };
  }, [bloque.length]);

  const reanudarLuego = () => {
    pausa.current.hasta = performance.now() + REANUDAR_MS;
  };

  // ── Mouse: arrastrar para mover ──
  const alPresionar = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = contenedor.current;
    arrastre.current = { x: e.clientX, scroll: el.scrollLeft, movido: false };
    pausa.current.arrastre = true;
    el.setPointerCapture?.(e.pointerId);
  };
  const alMover = (e) => {
    if (!pausa.current.arrastre) return;
    const dx = e.clientX - arrastre.current.x;
    if (Math.abs(dx) > 5) arrastre.current.movido = true;
    contenedor.current.scrollLeft = arrastre.current.scroll - dx;
  };
  const alSoltar = (e) => {
    if (!pausa.current.arrastre) return;
    pausa.current.arrastre = false;
    contenedor.current.releasePointerCapture?.(e.pointerId);
    reanudarLuego();
  };
  // Si se arrastró, no abrir el producto al soltar el mouse.
  const alHacerClic = (e) => {
    if (arrastre.current.movido) {
      e.preventDefault();
      e.stopPropagation();
      arrastre.current.movido = false;
    }
  };

  const tarjeta = (p, clave, oculto) => (
    <Link
      key={clave}
      href={p.href}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      aria-hidden={oculto || undefined}
      tabIndex={oculto ? -1 : undefined}
      className="group flex w-28 shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-blue-600 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="relative h-28 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {p.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imagen}
            alt={p.nombre}
            title={p.nombre}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-cover"
          />
        ) : null}
      </div>
      <span className="m-2 rounded-md bg-blue-600 px-2 py-1 text-center text-xs font-medium text-white">
        Ver
      </span>
    </Link>
  );

  return (
    <section className="mt-14" aria-labelledby="h-productos">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2
          id="h-productos"
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
        >
          <ShoppingBag className="h-5 w-5 text-blue-600" /> Productos de neurai.dev
        </h2>
        <Link
          href="/accesorios"
          className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold !text-white shadow transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-lg"
        >
          Ver toda la tienda →
        </Link>
      </div>
      <style>{`.prod-marquee::-webkit-scrollbar { display: none; }`}</style>
      <div
        ref={contenedor}
        className="prod-marquee flex cursor-grab pr-3 select-none items-start gap-3 overflow-x-auto active:cursor-grabbing"
        style={{ scrollbarWidth: "none", touchAction: "pan-x pan-y" }}
        onMouseEnter={() => (pausa.current.hover = true)}
        onMouseLeave={() => {
          pausa.current.hover = false;
          reanudarLuego();
        }}
        onFocus={() => (pausa.current.hover = true)}
        onBlur={() => (pausa.current.hover = false)}
        onTouchStart={() => (pausa.current.toque = true)}
        onTouchEnd={() => {
          pausa.current.toque = false;
          reanudarLuego();
        }}
        onTouchCancel={() => {
          pausa.current.toque = false;
          reanudarLuego();
        }}
        onPointerDown={alPresionar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onClickCapture={alHacerClic}
      >
        {bloque.map((p, i) => tarjeta(p, `a-${i}`, false))}
        {bloque.map((p, i) => tarjeta(p, `b-${i}`, true))}
      </div>
    </section>
  );
}
