"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "./TecnicoSistemas.module.scss";

// Curva ease-out fuerte (mismo lenguaje que el resto de animaciones del skill).
const EASE_OUT = [0.23, 1, 0.32, 1];

// Cuántas fotos laterales (borrosas) se muestran a cada lado de la central.
const LADOS = 2;

/**
 * Coverflow: una foto grande al centro y sus vecinas a los costados, con
 * desenfoque y en menor escala, para invitar a navegar. Click en una lateral la
 * trae al centro; click en la central abre el lightbox a pantalla completa.
 *
 * Propósito de la animación: consistencia espacial — la foto elegida se desliza
 * desde su lado y las vecinas comunican "hay más, muévete hacia acá".
 */
export default function Coverflow({ fotos, titulo, onAbrir }) {
  const [indice, setIndice] = useState(0);
  const reduce = useReducedMotion();
  const total = fotos.length;

  const irA = useCallback(
    (i) => setIndice(((i % total) + total) % total),
    [total]
  );
  const prev = useCallback(() => irA(indice - 1), [irA, indice]);
  const next = useCallback(() => irA(indice + 1), [irA, indice]);

  // Flechas del teclado cuando la galería tiene el foco.
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "Enter") { e.preventDefault(); onAbrir(fotos, indice); }
    },
    [prev, next, onAbrir, fotos, indice]
  );

  return (
    <div className={styles.coverflow}>
      <div className={styles.coverflowLayout}>
      <div
        className={styles.coverflowEscena}
        tabIndex={0}
        role="group"
        aria-label={`${titulo}: ${total} fotos, usa las flechas para navegar`}
        onKeyDown={onKeyDown}
      >
        {fotos.map((url, i) => {
          // Desplazamiento respecto al centro, por el camino más corto.
          let delta = i - indice;
          if (delta > total / 2) delta -= total;
          if (delta < -total / 2) delta += total;

          const distancia = Math.abs(delta);
          if (distancia > LADOS) return null; // fuera de escena

          const esCentro = delta === 0;

          // Posición/escala/desenfoque por distancia al centro.
          const x = delta * 46; // % del ancho de la escena
          const escala = esCentro ? 1 : 1 - distancia * 0.16;
          const desenfoque = esCentro ? 0 : distancia * 2.5;
          const opacidad = esCentro ? 1 : 0.55 - (distancia - 1) * 0.18;

          return (
            <motion.button
              key={i}
              type="button"
              className={`${styles.coverflowFoto} ${esCentro ? styles.coverflowCentro : ""}`}
              style={{ zIndex: LADOS - distancia }}
              aria-label={
                esCentro
                  ? `Ver ${titulo} — foto ${i + 1} en grande`
                  : `Ir a la foto ${i + 1}`
              }
              aria-hidden={!esCentro}
              onClick={() => (esCentro ? onAbrir(fotos, i) : irA(i))}
              initial={false}
              animate={
                reduce
                  ? { opacity: opacidad } // sin desplazamiento con reduced-motion
                  : {
                      transform: `translate(-50%, -50%) translateX(${x}%) scale(${escala})`,
                      opacity: opacidad,
                      filter: `blur(${desenfoque}px)`,
                    }
              }
              transition={{ duration: 0.42, ease: EASE_OUT }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={esCentro ? `${titulo} — foto ${i + 1}` : ""}
                loading="lazy"
                draggable={false}
              />
              {esCentro && (
                <span className={styles.coverflowLupa} aria-hidden="true">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </span>
              )}
            </motion.button>
          );
        })}

        {/* Flechas de navegación */}
        <button
          type="button"
          className={`${styles.coverflowNav} ${styles.coverflowNavPrev}`}
          onClick={prev}
          aria-label="Foto anterior"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.coverflowNav} ${styles.coverflowNavNext}`}
          onClick={next}
          aria-label="Foto siguiente"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Panel lateral de miniaturas (solo en pantallas grandes, vía CSS) */}
      <div className={styles.coverflowMiniaturas} role="list" aria-label={`Miniaturas de ${titulo}`}>
        {fotos.map((url, i) => (
          <button
            key={i}
            type="button"
            role="listitem"
            className={`${styles.coverflowMini} ${i === indice ? styles.coverflowMiniActiva : ""}`}
            onClick={() => irA(i)}
            aria-label={`Ver la foto ${i + 1}`}
            aria-current={i === indice}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" loading="lazy" draggable={false} />
          </button>
        ))}
      </div>
      </div>

      {/* Puntos indicadores (se ocultan en desktop, donde manda el panel) */}
      <div className={styles.coverflowPuntos}>
        {fotos.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.coverflowPunto} ${i === indice ? styles.coverflowPuntoActivo : ""}`}
            onClick={() => irA(i)}
            aria-label={`Ir a la foto ${i + 1}`}
            aria-current={i === indice}
          />
        ))}
      </div>
    </div>
  );
}
