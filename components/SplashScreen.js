"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "../styles/components/SplashScreen.module.scss";

// Tiempo mínimo en pantalla para que alcancen a verse las nubes cruzando
const TIEMPO_MINIMO = 1800;
// Si algo se queda colgado, no bloquear la app más de esto
const TIEMPO_MAXIMO = 8000;

function esAppInstalada() {
  if (typeof window === "undefined") return false;
  const modos = ["standalone", "fullscreen", "minimal-ui"];
  return (
    modos.some((m) => window.matchMedia(`(display-mode: ${m})`).matches) ||
    window.navigator.standalone === true ||
    document.referrer.startsWith("android-app://")
  );
}

// Progreso real de la carga del home (0–1):
// 25% hidratación, 15% fuentes, 60% imágenes visibles (no diferidas)
function medirCarga(fuentesListas) {
  const imagenes = Array.from(document.images).filter(
    (img) => img.loading !== "lazy" && !img.closest("[data-splash]"),
  );
  const cargadas = imagenes.filter((img) => img.complete).length;
  const partImagenes = imagenes.length ? cargadas / imagenes.length : 1;
  const docListo = document.readyState === "complete" ? 1 : 0.5;
  return 0.25 + (fuentesListas ? 0.15 : 0) + 0.6 * partImagenes * docListo;
}

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [forzar, setForzar] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const fuentesListas = useRef(false);

  useEffect(() => {
    let hasLoaded = false;
    try {
      hasLoaded = sessionStorage.getItem("appLoaded") === "true";
    } catch {}

    if (!esAppInstalada() || hasLoaded) {
      setIsVisible(false);
      return;
    }
    setForzar(true);

    document.fonts?.ready.then(() => {
      fuentesListas.current = true;
    });

    const inicio = performance.now();
    let mostrado = 0;
    let terminado = false;
    let frame;
    let timerSalida;
    let timerOcultar;

    const terminar = () => {
      if (terminado) return;
      terminado = true;
      setProgreso(100);
      timerSalida = setTimeout(() => setSaliendo(true), 250);
      timerOcultar = setTimeout(() => {
        setIsVisible(false);
        try {
          sessionStorage.setItem("appLoaded", "true");
        } catch {}
      }, 850);
    };

    const tick = () => {
      const transcurrido = performance.now() - inicio;
      const real = medirCarga(fuentesListas.current);
      // La barra nunca va más rápido que el tiempo mínimo ni que la carga real
      const objetivo = Math.min(real, transcurrido / TIEMPO_MINIMO);
      // Avance suave hacia el objetivo, sin retroceder nunca
      mostrado = Math.max(mostrado, mostrado + (objetivo - mostrado) * 0.12);
      setProgreso(Math.round(mostrado * 100));

      if (
        (real >= 1 && transcurrido >= TIEMPO_MINIMO && mostrado > 0.97) ||
        transcurrido >= TIEMPO_MAXIMO
      ) {
        terminar();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timerSalida);
      clearTimeout(timerOcultar);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      data-splash
      className={`${styles.splashScreen} ${forzar ? styles.forzar : ""} ${
        saliendo ? styles.fadeOut : ""
      }`}
      role="status"
      aria-label={`Cargando neurai.dev, ${progreso}%`}
    >
      {/* Capa lejana: nubes grandes y muy borrosas */}
      <div className={`${styles.capa} ${styles.capaLejana}`} aria-hidden="true">
        <span className={`${styles.nube} ${styles.l1}`} />
        <span className={`${styles.nube} ${styles.l2}`} />
        <span className={`${styles.nube} ${styles.l3}`} />
      </div>

      {/* Velo borroso de fondo (backdrop-blur-sm) */}
      <div className={styles.velo} aria-hidden="true" />

      {/* Capa cercana: nubes nítidas que cruzan por detrás del logo */}
      <div className={`${styles.capa} ${styles.capaCercana}`} aria-hidden="true">
        <span className={`${styles.nube} ${styles.c1}`} />
        <span className={`${styles.nube} ${styles.c2}`} />
        <span className={`${styles.nube} ${styles.c3}`} />
      </div>

      <div className={styles.tarjeta}>
        <Image
          src="/favicon.svg"
          alt=""
          width={112}
          height={112}
          className={styles.logo}
          priority
        />
        <h1 className={styles.title}>neurai.dev</h1>

        <div className={styles.progreso}>
          <div className={styles.pista}>
            <div
              className={styles.barra}
              style={{ transform: `scaleX(${progreso / 100})` }}
            />
          </div>
          <div className={styles.estado}>
            <span>{progreso >= 100 ? "¡Listo!" : "Preparando la tienda…"}</span>
            <span className={styles.porcentaje}>{progreso}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
