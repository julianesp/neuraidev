"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../styles/components/SplashScreen.module.scss";

// Entrada de la PWA instalada: fondo azul de marca con nubes difuminadas
// que se mueven. En el navegador normal el CSS la oculta (display-mode).
export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const esPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    // Detectar si la app ya se cargó antes en esta sesión
    let hasLoaded = false;
    try {
      hasLoaded = sessionStorage.getItem("appLoaded") === "true";
    } catch {}

    if (!esPWA || hasLoaded) {
      setIsVisible(false);
      return;
    }

    // Dejar ver las nubes un momento antes de desvanecer
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);

    // Ocultar splash después de la animación de salida
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      try {
        sessionStorage.setItem("appLoaded", "true");
      } catch {}
    }, 2600);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.splashScreen} ${isLoaded ? styles.fadeOut : ""}`}
      aria-hidden="true"
    >
      <div className={styles.clouds}>
        <span className={`${styles.cloud} ${styles.cloud1}`} />
        <span className={`${styles.cloud} ${styles.cloud2}`} />
        <span className={`${styles.cloud} ${styles.cloud3}`} />
        <span className={`${styles.cloud} ${styles.cloud4}`} />
        <span className={`${styles.cloud} ${styles.cloud5}`} />
      </div>
      <div className={styles.veil} />

      <div className={styles.logoContainer}>
        <Image
          src="/favicon.svg"
          alt="neurai.dev"
          width={120}
          height={120}
          className={styles.logo}
          priority
        />
        <h1 className={styles.title}>neurai.dev</h1>
      </div>
      <div className={styles.loader}>
        <div className={styles.loaderBar}></div>
      </div>
    </div>
  );
}
