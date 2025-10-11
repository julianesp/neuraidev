"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./PresentationCarousel.module.scss";

const PresentationCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

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
      description: "Soluciones profesionales para todos tus problemas informáticos",
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
    // {
    //   id: 4,
    //   image:
    //     "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/loveFriend.jpg",
    //   title: "Ofertas Especiales",
    //   description: "No te pierdas nuestras promociones",
    //   link: "/ofertas",
    // },
  ];

  // Auto-slide cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Marcar como cargado después del montaje
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
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
      <div className={styles.carousel}>
        {/* Slides */}
        <div
          className={styles.slidesWrapper}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={slide.id} className={styles.slide}>
              <div className={styles.imageContainer}>
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className={styles.slideImage}
                  priority={index === 0}
                  quality={85}
                  sizes="100vw"
                />
                <div className={styles.overlay}></div>
              </div>

              <div className={styles.slideContent}>
                <h2 className={styles.slideTitle}>{slide.title}</h2>
                <p className={styles.slideDescription}>{slide.description}</p>

                <Link href={slide.link} className={styles.seeMoreButton}>
                  Ver más
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Controles de navegación */}
        <button
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={prevSlide}
          aria-label="Slide anterior"
        >
          ‹
        </button>

        <button
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={nextSlide}
          aria-label="Siguiente slide"
        >
          ›
        </button>

        {/* Indicadores */}
        <div className={styles.indicators}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentSlide ? styles.active : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresentationCarousel;
