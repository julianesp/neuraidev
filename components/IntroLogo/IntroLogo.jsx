"use client";

import { useEffect, useState } from "react";
import LogoNeurai from "@/components/LogoNeurai/LogoNeurai";
import styles from "./IntroLogo.module.scss";

// Duración total de la intro (la salida en CSS empieza en 2.6s y dura 0.4s)
const DURACION = 3000;

/**
 * Intro al cargar el sitio: el logo en CSS hace dos guiños durante 3 segundos
 * sobre la página desenfocada (backdrop-blur-sm). Todo lo visual va en CSS
 * (entrada, guiños con data-wink="auto" y salida), así que funciona igual
 * aunque el JS tarde; el JS solo la quita del DOM al final o al hacer clic.
 * Se muestra una vez por sesión: INTRO_LOGO_SCRIPT (introScript.js, en el
 * <head>) marca <html data-intro-visto> en las recargas y el CSS la oculta.
 */
export default function IntroLogo() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (document.documentElement.hasAttribute("data-intro-visto")) {
      setVisible(false);
      return;
    }
    // Contado desde el inicio de la navegación, igual que la animación CSS
    const timer = setTimeout(
      () => setVisible(false),
      Math.max(0, DURACION - performance.now()),
    );
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={styles.intro}
      aria-hidden="true"
      onClick={() => setVisible(false)}
    >
      <span className={styles.logo}>
        <LogoNeurai size="var(--intro-logo-size)" wink="auto" />
      </span>
    </div>
  );
}
