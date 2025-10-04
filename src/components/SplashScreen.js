"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../styles/components/SplashScreen.module.scss";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Detectar si la app ya se cargó antes en esta sesión
    const hasLoaded = sessionStorage.getItem("appLoaded");

    if (hasLoaded) {
      setIsVisible(false);
      return;
    }

    // Simular carga inicial
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    // Ocultar splash después de la animación
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("appLoaded", "true");
    }, 2500);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`${styles.splashScreen} ${isLoaded ? styles.fadeOut : ""}`}>
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
