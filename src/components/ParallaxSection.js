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
