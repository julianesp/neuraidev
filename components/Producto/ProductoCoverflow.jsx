"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import styles from "./ProductoCoverflow.module.scss";

// Curva ease-out fuerte (mismo lenguaje que el coverflow de tecnico-sistemas).
const EASE_OUT = [0.23, 1, 0.32, 1];

// Cuántas fotos laterales (borrosas) se muestran a cada lado de la central.
const LADOS = 2;

/**
 * Coverflow de productos: una imagen grande al centro y sus vecinas a los
 * costados con desenfoque y menor escala. A la DERECHA de la imagen central se
 * muestra la info (nombre + precio + botón "Ver") SOLO del producto central.
 *
 * @param {Array}    productos   lista de productos
 * @param {Function} getImagen   (producto) => url de la imagen
 * @param {Function} getHref     (producto) => ruta del detalle (destino del botón "Ver")
 * @param {Function} renderBadgeIzq  (producto) => nodo superpuesto arriba-izq (opcional)
 * @param {Function} renderBadgeDer  (producto) => nodo superpuesto arriba-der (opcional)
 * @param {Function} renderPrecio    (producto) => nodo del precio (opcional)
 * @param {string}   verTodosHref  ruta del enlace "ver todos" (opcional)
 * @param {string}   verTodosTexto texto del enlace "ver todos" (opcional)
 */
export default function ProductoCoverflow({
  productos,
  getImagen,
  getHref,
  renderBadgeIzq,
  renderBadgeDer,
  renderPrecio,
  verTodosHref,
  verTodosTexto,
}) {
  const [indice, setIndice] = useState(0);
  const reduce = useReducedMotion();
  const total = productos.length;

  const irA = useCallback(
    (i) => setIndice(((i % total) + total) % total),
    [total],
  );
  const prev = useCallback(() => irA(indice - 1), [irA, indice]);
  const next = useCallback(() => irA(indice + 1), [irA, indice]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    },
    [prev, next],
  );

  if (total === 0) return null;

  const actual = productos[indice];

  return (
    <div className={styles.coverflow}>
      <div className={styles.cuerpo}>
      <div
        className={styles.escena}
        tabIndex={0}
        role="group"
        aria-label={`Galería de productos: ${total} elementos, usa las flechas para navegar`}
        onKeyDown={onKeyDown}
      >
        {productos.map((producto, i) => {
          // Desplazamiento respecto al centro por el camino más corto.
          let delta = i - indice;
          if (delta > total / 2) delta -= total;
          if (delta < -total / 2) delta += total;

          const distancia = Math.abs(delta);
          if (distancia > LADOS) return null; // fuera de escena

          const esCentro = delta === 0;

          const x = delta * 46; // % del ancho de la escena
          const escala = esCentro ? 1 : 1 - distancia * 0.16;
          const desenfoque = esCentro ? 0 : distancia * 2.5;
          const opacidad = esCentro ? 1 : 0.55 - (distancia - 1) * 0.18;

          return (
            <motion.button
              key={`${getHref(producto)}-${i}`}
              type="button"
              className={`${styles.foto} ${esCentro ? styles.centro : ""}`}
              style={{ zIndex: LADOS - distancia }}
              aria-label={
                esCentro ? "Producto actual" : `Ir al producto ${i + 1}`
              }
              aria-hidden={!esCentro}
              onClick={() => irA(i)}
              initial={false}
              animate={
                reduce
                  ? { opacity: opacidad }
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
                src={getImagen(producto)}
                alt={esCentro ? "" : ""}
                loading="lazy"
                draggable={false}
              />
            </motion.button>
          );
        })}

        {/* Badges superpuestos sobre la foto central (favoritos, stock, nuevo) */}
        {renderBadgeIzq && actual && (
          <div className={styles.badgeIzq}>{renderBadgeIzq(actual)}</div>
        )}
        {renderBadgeDer && actual && (
          <div className={styles.badgeDer}>{renderBadgeDer(actual)}</div>
        )}

        {/* Flechas de navegación encima de las imágenes */}
        <button
          type="button"
          className={`${styles.nav} ${styles.navPrev}`}
          onClick={prev}
          aria-label="Producto anterior"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.nav} ${styles.navNext}`}
          onClick={next}
          aria-label="Producto siguiente"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Info del producto central a la derecha: nombre + precio + botón Ver */}
      {actual && (
        <div className={styles.info}>
          <h3 className={styles.titulo}>
            <Link href={getHref(actual)}>{actual.nombre}</Link>
          </h3>
          {renderPrecio && renderPrecio(actual)}
          <div className={styles.acciones}>
            <Link href={getHref(actual)} className={styles.botonVer}>
              Ver
            </Link>
          </div>
        </div>
      )}
      </div>

      {/* Puntos indicadores */}
      <div className={styles.puntos}>
        {productos.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.punto} ${i === indice ? styles.puntoActivo : ""}`}
            onClick={() => irA(i)}
            aria-label={`Ir al producto ${i + 1}`}
            aria-current={i === indice}
          />
        ))}
      </div>

      <div className={styles.contador}>
        {indice + 1} / {total}
      </div>

      {verTodosHref && (
        <div className={styles.verTodos}>
          <Link href={verTodosHref}>{verTodosTexto || "Ver todos"}</Link>
        </div>
      )}
    </div>
  );
}
