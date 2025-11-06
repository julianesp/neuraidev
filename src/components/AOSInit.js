"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * AOSInit - Componente que inicializa las animaciones AOS (Animate On Scroll)
 * Este componente debe ser incluido en el layout principal para habilitar
 * las animaciones parallax en todo el sitio
 */
export default function AOSInit() {
  useEffect(() => {
    AOS.init({
      // Duración de las animaciones en milisegundos
      duration: 1000,

      // Retraso antes de que comience la animación
      delay: 100,

      // Si las animaciones deben ocurrir solo una vez
      once: true,

      // Offset desde el punto de activación original
      offset: 100,

      // Función de aceleración
      easing: "ease-in-out",

      // Si se debe animar elementos cuando se hace scroll hacia arriba
      mirror: false,

      // Si se deben deshabilitar animaciones en dispositivos móviles
      disable: false,
    });

    // Refrescar AOS cuando cambie el contenido
    AOS.refresh();
  }, []);

  return null;
}
