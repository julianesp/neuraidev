"use client";
import React, { useState, useEffect } from "react";
import styles from "./BackToTop.module.scss";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Controla la visibilidad del botón basado en el scroll
  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar el botón cuando el scroll supera los 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Agrega el event listener
    window.addEventListener("scroll", toggleVisibility);

    // Limpia el event listener al desmontar
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Función para scrollear al inicio de la página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Efecto de animación opcional similar al que usas en tus enlaces
    setTimeout(() => {
      const header = document.querySelector("header");
      if (header) {
        // Remover cualquier animación existente
        header.classList.remove(styles.bounceAnimation);

        // Forzar un reflow para que la animación pueda aplicarse nuevamente
        void header.offsetWidth;

        // Añadir la clase de animación
        header.classList.add(styles.bounceAnimation);

        // Eliminar la clase después de que la animación se complete
        setTimeout(() => {
          header.classList.remove(styles.bounceAnimation);
        }, 1000);
      }
    }, 500);
  };

  return (
    <button
      className={`${styles.backToTop} ${isVisible ? styles.visible : ""}`}
      onClick={scrollToTop}
      aria-label="Volver arriba"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
};

export default BackToTop;
