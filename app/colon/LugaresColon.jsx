"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { lugares } from "./lugares";
import styles from "./Colon.module.scss";

/**
 * Lugares de Colón: cada lugar (parque, termales, iglesia…) aparece como una
 * tarjeta; al tocarla se despliegan sus fotos. Tocar una foto abre el visor a
 * pantalla completa con zoom y descarga.
 */
export default function LugaresColon() {
  const [abierto, setAbierto] = useState(null); // id del lugar desplegado
  const [visor, setVisor] = useState(null); // { lugar, indice }
  const galeriaRef = useRef(null);

  // Enlace directo: /colon#parque abre ese lugar.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (lugares.some((l) => l.id === id)) setAbierto(id);
  }, []);

  const alternar = (id) => {
    const nuevo = abierto === id ? null : id;
    setAbierto(nuevo);
    const url = nuevo ? `#${nuevo}` : window.location.pathname + window.location.search;
    window.history.replaceState(null, "", url);
  };

  // Al abrir un lugar, llevar la galería a la vista.
  useEffect(() => {
    if (!abierto || !galeriaRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    galeriaRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [abierto]);

  if (lugares.length === 0) return null;
  const lugarAbierto = lugares.find((l) => l.id === abierto);

  return (
    <section className={styles.lugaresSection} aria-labelledby="lugares-titulo">
      <h2 id="lugares-titulo" className={styles.eventosTitulo}>
        Lugares de Colón
      </h2>

      <div className={styles.lugaresGrid}>
        {lugares.map((lugar) => {
          const activo = lugar.id === abierto;
          return (
            <button
              key={lugar.id}
              type="button"
              className={`${styles.lugarCard} ${activo ? styles.lugarCardActiva : ""}`}
              onClick={() => alternar(lugar.id)}
              aria-expanded={activo}
              aria-controls={`galeria-${lugar.id}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lugar.fotos[0]?.thumb} alt="" loading="lazy" decoding="async" />
              <span className={styles.lugarCardOverlay}>
                <span className={styles.lugarCardTitulo}>{lugar.titulo}</span>
                <span className={styles.lugarCardMeta}>
                  {lugar.fotos.length} fotos · {activo ? "Ocultar" : "Ver fotos"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {lugarAbierto && (
        <article
          ref={galeriaRef}
          id={`galeria-${lugarAbierto.id}`}
          className={styles.lugar}
        >
          <header className={styles.lugarHeader}>
            <div>
              <h3 className={styles.lugarTitulo}>{lugarAbierto.titulo}</h3>
              {lugarAbierto.descripcion && (
                <p className={styles.lugarDescripcion}>{lugarAbierto.descripcion}</p>
              )}
            </div>
            <button
              type="button"
              className={styles.lugarCerrar}
              onClick={() => alternar(lugarAbierto.id)}
            >
              Cerrar
            </button>
          </header>

          <div className={styles.lugarGrid}>
            {lugarAbierto.fotos.map((foto, i) => (
              <button
                key={foto.src}
                type="button"
                className={`${styles.lugarFoto} ${i === 0 ? styles.lugarFotoGrande : ""}`}
                onClick={() => setVisor({ lugar: lugarAbierto, indice: i })}
                aria-label={`Ampliar: ${foto.alt}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={i === 0 ? foto.src : foto.thumb}
                  alt={foto.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </article>
      )}

      {visor && (
        <Visor
          lugar={visor.lugar}
          indiceInicial={visor.indice}
          onClose={() => setVisor(null)}
        />
      )}
    </section>
  );
}

// ── Visor a pantalla completa ────────────────────────────────────────────────

const ZOOM_MIN = 1;
const ZOOM_MAX = 5;
const limitar = (v, min, max) => Math.min(max, Math.max(min, v));

function Visor({ lugar, indiceInicial, onClose }) {
  const fotos = lugar.fotos;
  const total = fotos.length;
  const [indice, setIndice] = useState(indiceInicial);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [descargando, setDescargando] = useState(false);
  const [montado, setMontado] = useState(false);

  const escenaRef = useRef(null);
  const cerrarRef = useRef(null);
  const punteros = useRef(new Map());
  const gesto = useRef(null);
  const ultimoToque = useRef(0);

  const foto = fotos[indice];

  const reiniciarZoom = useCallback(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const prev = useCallback(() => {
    reiniciarZoom();
    setIndice((i) => (i - 1 + total) % total);
  }, [total, reiniciarZoom]);
  const next = useCallback(() => {
    reiniciarZoom();
    setIndice((i) => (i + 1) % total);
  }, [total, reiniciarZoom]);

  // Mantiene la foto dentro de la escena al hacer zoom/arrastrar.
  const acotar = useCallback((p, z) => {
    const el = escenaRef.current;
    if (!el || z <= 1) return { x: 0, y: 0 };
    const mx = ((z - 1) * el.clientWidth) / 2;
    const my = ((z - 1) * el.clientHeight) / 2;
    return { x: limitar(p.x, -mx, mx), y: limitar(p.y, -my, my) };
  }, []);

  const cambiarZoom = useCallback(
    (nuevo) => {
      const z = limitar(nuevo, ZOOM_MIN, ZOOM_MAX);
      setZoom(z);
      setPos((p) => acotar({ x: (p.x * z) / zoom, y: (p.y * z) / zoom }, z));
    },
    [zoom, acotar]
  );

  useEffect(() => setMontado(true), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "+" || e.key === "=") cambiarZoom(zoom + 0.5);
      else if (e.key === "-") cambiarZoom(zoom - 0.5);
      else if (e.key === "0") reiniciarZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next, cambiarZoom, reiniciarZoom, zoom]);

  // Bloquear el scroll de la página mientras el visor está abierto.
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, []);

  useEffect(() => {
    if (montado) cerrarRef.current?.focus();
  }, [montado]);

  // Rueda del mouse: zoom (listener no pasivo para poder evitar el scroll).
  useEffect(() => {
    const el = escenaRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      cambiarZoom(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [montado, zoom, cambiarZoom]);

  // Precargar las vecinas para que el cambio sea inmediato.
  useEffect(() => {
    [fotos[(indice + 1) % total], fotos[(indice - 1 + total) % total]].forEach((f) => {
      const img = new window.Image();
      img.src = f.src;
    });
  }, [indice, fotos, total]);

  // ── Gestos: arrastrar (con zoom), pellizcar, deslizar (sin zoom), doble toque
  const onPointerDown = (e) => {
    if (e.target.closest("button")) return;
    escenaRef.current.setPointerCapture(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      gesto.current = { tipo: "pellizco", dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    } else {
      gesto.current = {
        tipo: "arrastre",
        x: e.clientX,
        y: e.clientY,
        pos,
        movio: false,
        fuera: e.target === escenaRef.current, // tocó el fondo, no la foto
      };
    }
  };

  const onPointerMove = (e) => {
    if (!punteros.current.has(e.pointerId)) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesto.current;
    if (!g) return;

    if (g.tipo === "pellizco" && punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      const z = limitar((g.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / g.dist, ZOOM_MIN, ZOOM_MAX);
      setZoom(z);
      setPos((p) => acotar(p, z));
    } else if (g.tipo === "arrastre") {
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) g.movio = true;
      if (zoom > 1) setPos(acotar({ x: g.pos.x + dx, y: g.pos.y + dy }, zoom));
    }
  };

  const onPointerUp = (e) => {
    const g = gesto.current;
    punteros.current.delete(e.pointerId);

    if (g?.tipo === "arrastre") {
      const dx = e.clientX - g.x;
      if (zoom === 1 && Math.abs(dx) > 60) {
        (dx < 0 ? next : prev)();
      } else if (!g.movio) {
        const ahora = Date.now();
        if (ahora - ultimoToque.current < 300) {
          // Doble toque / doble clic: alternar zoom.
          ultimoToque.current = 0;
          if (zoom > 1) reiniciarZoom();
          else setZoom(2.5);
        } else {
          ultimoToque.current = ahora;
          // Un toque fuera de la foto (sin zoom) cierra el visor.
          if (zoom === 1 && g.fuera) onClose();
        }
      }
    }
    gesto.current = punteros.current.size === 1
      ? (() => {
          const [p] = [...punteros.current.values()];
          return { tipo: "arrastre", x: p.x, y: p.y, pos, movio: true };
        })()
      : null;
  };

  const descargar = async () => {
    const nombre = `colon-${lugar.id}-${indice + 1}-neurai.jpg`;
    setDescargando(true);
    try {
      const resp = await fetch(foto.src, { mode: "cors" });
      if (!resp.ok) throw new Error(String(resp.status));
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // Si el navegador bloquea la descarga, abrir la foto para guardarla a mano.
      window.open(foto.src, "_blank", "noopener");
    } finally {
      setDescargando(false);
    }
  };

  if (!montado) return null;

  return createPortal(
    <div className={styles.visor} role="dialog" aria-modal="true" aria-label={foto.alt}>
      <div
        ref={escenaRef}
        className={`${styles.visorEscena} ${zoom > 1 ? styles.visorEscenaZoom : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={foto.src}
          src={foto.src}
          alt={foto.alt}
          className={styles.visorImg}
          style={{
            backgroundImage: `url(${foto.thumb})`,
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
            transition: gesto.current ? "none" : undefined,
          }}
          draggable={false}
        />
      </div>

      {/* Barra superior: contador + herramientas + cerrar */}
      <div className={styles.visorBarra}>
        <span className={styles.visorContador}>
          {indice + 1} / {total}
        </span>
        <div className={styles.visorHerramientas}>
          <button
            type="button"
            className={styles.visorBoton}
            onClick={() => cambiarZoom(zoom - 0.5)}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Alejar"
            title="Alejar (−)"
          >
            <IconoMenos />
          </button>
          <button
            type="button"
            className={`${styles.visorBoton} ${styles.visorZoomValor}`}
            onClick={reiniciarZoom}
            aria-label="Restablecer zoom"
            title="Restablecer (0)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            className={styles.visorBoton}
            onClick={() => cambiarZoom(zoom + 0.5)}
            disabled={zoom >= ZOOM_MAX}
            aria-label="Acercar"
            title="Acercar (+)"
          >
            <IconoMas />
          </button>
          <button
            type="button"
            className={styles.visorBoton}
            onClick={descargar}
            disabled={descargando}
            aria-label="Descargar foto"
            title="Descargar"
          >
            <IconoDescargar />
          </button>
          <button
            ref={cerrarRef}
            type="button"
            className={styles.visorBoton}
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar (Esc)"
          >
            <IconoCerrar />
          </button>
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            className={`${styles.visorNav} ${styles.visorPrev}`}
            onClick={prev}
            aria-label="Foto anterior"
          >
            <IconoFlecha />
          </button>
          <button
            type="button"
            className={`${styles.visorNav} ${styles.visorNext}`}
            onClick={next}
            aria-label="Foto siguiente"
          >
            <IconoFlecha derecha />
          </button>
        </>
      )}
    </div>,
    document.body
  );
}

// ── Iconos (SVG en línea, heredan el color) ──────────────────────────────────

const svgProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function IconoMas() {
  return (
    <svg {...svgProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconoMenos() {
  return (
    <svg {...svgProps}>
      <path d="M5 12h14" />
    </svg>
  );
}
function IconoDescargar() {
  return (
    <svg {...svgProps}>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}
function IconoCerrar() {
  return (
    <svg {...svgProps}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function IconoFlecha({ derecha }) {
  return (
    <svg {...svgProps} width={26} height={26}>
      <path d={derecha ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} />
    </svg>
  );
}
