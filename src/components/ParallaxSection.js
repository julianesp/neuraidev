// "use client";
// import React, { useEffect, useRef } from "react";
// import styles from "../styles/Home.module.scss";

// const ParallaxSection = ({
//   bgImage,
//   children,
//   speed = 0.5,
//   height = "500px",
//   className = "",
//   overlayOpacity = 0.3,
// }) => {
//   const sectionRef = useRef(null);

//   useEffect(() => {
//     if (!sectionRef.current) return;

//     const handleScroll = () => {
//       if (!sectionRef.current) return;

//       const scrollPosition = window.scrollY;
//       const offset = scrollPosition * speed;
//       const yPos = -offset;

//       // Aplicar el efecto parallax con transform para mejor rendimiento
//       sectionRef.current.style.backgroundPosition = `center ${yPos}px`;
//     };

//     // Configuración inicial
//     handleScroll();

//     // Agregar event listener
//     window.addEventListener("scroll", handleScroll);

//     // Limpieza
//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, [speed]);

//   return (
//     <div
//       ref={sectionRef}
//       className={`${styles.parallaxSection} ${className}`}
//       style={{
//         backgroundImage: `url(${bgImage})`,
//         height: height,
//         position: "relative",
//       }}
//     >
//       {/* Overlay para mejorar la visibilidad del contenido */}
//       <div
//         className={styles.parallaxOverlay}
//         style={{
//           backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
//         }}
//       ></div>

//       {/* Contenedor del contenido */}
//       <div className={styles.parallaxContent}>{children}</div>
//     </div>
//   );
// };

// export default ParallaxSection;

"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.scss";

const ParallaxSection = ({
  bgImage,
  height = "400px",
  speed = 0.5,
  className = "",
  overlayOpacity = 0,
  children,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Efecto para manejar el parallax al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;

        setIsVisible(isInView);
        setScrollY(window.scrollY);
      }
    };

    // Ejecutamos una vez para configurar el estado inicial
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Calcular el desplazamiento parallax basado en el scroll
  const yPos = scrollY * speed;

  // Estilo de fondo con efecto parallax
  const backgroundStyle = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    height,
    transform: `translateY(${yPos}px)`,
    transition: "transform 0.1s ease-out",
  };

  // Estilo para el overlay con opacidad configurable
  const overlayStyle = {
    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
  };

  // Combinar clases adicionales con las del componente
  const combinedClassName = `${styles.parallaxContainer} ${className} ${isVisible ? styles.visible : ""}`;

  return (
    <div ref={sectionRef} className={combinedClassName} style={{ height }}>
      <div className={styles.parallaxSection} style={backgroundStyle}>
        {overlayOpacity > 0 && <div style={overlayStyle} />}
        <div className={styles.parallaxContent}>{children}</div>
      </div>
    </div>
  );
};

export default ParallaxSection;
