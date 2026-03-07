"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./PresentationCarousel.module.scss";

const PresentationCarousel = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef(null);
  const rotationRef = useRef(0);

  // Datos del carrusel con imágenes y enlaces
  const slides = [
    {
      id: 1,
      image:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/collage.jpg",
      title: "Productos Destacados",
      description: "Descubre nuestros mejores productos",
      link: "/accesorios/destacados",
    },
    {
      id: 2,
      image:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/servicios/mantenimiento.jpg",
      title: "Técnico en Sistemas",
      description:
        "Soluciones profesionales para todos tus problemas informáticos",
      link: "/servicios/tecnico-sistemas",
    },
    {
      id: 3,
      image:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/servicios/web_develop.png",
      title: "Desarrollador Web",
      description: "Creando soluciones digitales innovadoras para tu negocio",
      link: "/servicios/desarrollador-software",
    },
  ];

  // Duplicar slides para el efecto infinito
  const infiniteSlides = [...slides, ...slides, ...slides];

  // Animación continua
  useEffect(() => {
    setIsLoaded(true);
    window.scrollTo(0, 0);

    const animate = () => {
      rotationRef.current += 0.2; // Velocidad de rotación
      setRotation(rotationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Calcular posición y escala de cada tarjeta
  const getCardStyle = (index) => {
    const totalSlides = infiniteSlides.length;
    const anglePerSlide = 360 / slides.length;
    const radius = 600; // Radio del cilindro

    // Ángulo de la tarjeta actual
    const angle = (index * anglePerSlide - rotation) % 360;

    // Normalizar ángulo entre -180 y 180
    const normalizedAngle = angle > 180 ? angle - 360 : angle;

    // Calcular posición en el cilindro
    const x = Math.sin((normalizedAngle * Math.PI) / 180) * radius;
    const z = Math.cos((normalizedAngle * Math.PI) / 180) * radius - radius;

    // Calcular escala basada en la posición Z (cercanía al centro)
    const distanceFromCenter = Math.abs(normalizedAngle);

    // Escala diferente para X (width) y Y (height)
    // En el centro: scaleX 1.6 (60% más ancho), scaleY 1.1 (10% más alto)
    const scaleX = distanceFromCenter < 30
      ? 1.6 - (distanceFromCenter / 30) * 0.6  // 1.6 en centro, 1.0 a 30°
      : 0.85;

    const scaleY = distanceFromCenter < 30
      ? 1.1 - (distanceFromCenter / 30) * 0.1  // 1.1 en centro, 1.0 a 30°
      : 0.85;

    // Calcular opacidad
    const opacity = distanceFromCenter < 60
      ? 1 - (distanceFromCenter / 120)
      : 0.3;

    // Calcular rotationY para el efecto cilíndrico
    const rotateY = -normalizedAngle * 0.6;

    return {
      transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scaleX}, ${scaleY})`,
      opacity: opacity,
      zIndex: Math.round(1000 + z),
    };
  };

  if (!isLoaded) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.loadingSkeleton}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonText}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carousel3D}>
        <div className={styles.cylinderWrapper}>
          {infiniteSlides.map((slide, index) => (
            <div
              key={`${slide.id}-${index}`}
              className={styles.card3D}
              style={getCardStyle(index)}
            >
              <Link href={slide.link} className={styles.cardLink}>
                <div className={styles.imageContainer}>
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className={styles.slideImage}
                    priority={index === 0}
                    quality={85}
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className={styles.overlay}></div>
                </div>

                <div className={styles.slideContent}>
                  <h2 className={styles.slideTitle}>{slide.title}</h2>
                  <p className={styles.slideDescription}>{slide.description}</p>
                  <span className={styles.seeMoreButton}>Ver más</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresentationCarousel;
