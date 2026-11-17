"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { lugares } from "./lugares";
import styles from "./Colon.module.scss";

/**
 * Lugares de Colón: una sección por lugar (parque, termales, iglesia…), cada
 * una con su cuadrícula de fotos. Tocar una foto abre el visor a pantalla
 * completa con flechas, teclado y deslizar en celular.
 */
export default function LugaresColon() {
  const [visor, setVisor] = useState(null); // { fotos, indice }

  if (lugares.length === 0) return null;

  return (
    <section className={styles.lugaresSection} aria-labelledby="lugares-titulo">
      <h2 id="lugares-titulo" className={styles.eventosTitulo}>
        Lugares de Colón
      </h2>

      {lugares.length > 1 && (
        <nav className={styles.lugaresNav} aria-label="Lugares">
          {lugares.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={styles.lugaresChip}>
              {l.titulo}
            </a>
          ))}
        </nav>
      )}

      {lugares.map((lugar) => (
        <article key={lugar.id} id={lugar.id} className={styles.lugar}>
          <header className={styles.lugarHeader}>
            <h3 className={styles.lugarTitulo}>{lugar.titulo}</h3>
            {lugar.descripcion && (
              <p className={styles.lugarDescripcion}>{lugar.descripcion}</p>
            )}
          </header>

          <div className={styles.lugarGrid}>
            {lugar.fotos.map((foto, i) => (
              <button
                key={foto.src}
                type="button"
                className={`${styles.lugarFoto} ${i === 0 ? styles.lugarFotoGrande : ""}`}
                onClick={() => setVisor({ fotos: lugar.fotos, indice: i })}
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
      ))}

      {visor && (
        <Visor
          fotos={visor.fotos}
          indiceInicial={visor.indice}
          onClose={() => setVisor(null)}
        />
      )}
    </section>
  );
}

function Visor({ fotos, indiceInicial, onClose }) {
  const [indice, setIndice] = useState(indiceInicial);
  const total = fotos.length;
  const toque = useRef(null);
  const cerrarRef = useRef(null);

  const prev = useCallback(() => setIndice((i) => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIndice((i) => (i + 1) % total), [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onClose, prev, next]);

  // Precargar las vecinas para que el cambio sea inmediato.
  useEffect(() => {
    [fotos[(indice + 1) % total], fotos[(indice - 1 + total) % total]].forEach((f) => {
      const img = new window.Image();
      img.src = f.src;
    });
  }, [indice, fotos, total]);

  const foto = fotos[indice];

  return (
    <div
      className={styles.visor}
      role="dialog"
      aria-modal="true"
      aria-label={foto.alt}
      onClick={onClose}
      onTouchStart={(e) => {
        toque.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (toque.current == null) return;
        const dx = e.changedTouches[0].clientX - toque.current;
        toque.current = null;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={foto.src}
        src={foto.src}
        alt={foto.alt}
        className={styles.visorImg}
        style={{ backgroundImage: `url(${foto.thumb})` }}
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />

      <button
        ref={cerrarRef}
        type="button"
        className={styles.visorCerrar}
        onClick={onClose}
        aria-label="Cerrar"
      >
        ✕
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            className={`${styles.visorNav} ${styles.visorPrev}`}
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.visorNav} ${styles.visorNext}`}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Foto siguiente"
          >
            ›
          </button>
          <span className={styles.visorContador}>
            {indice + 1} / {total}
          </span>
        </>
      )}
    </div>
  );
}
