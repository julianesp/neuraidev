"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./PresentationCarousel.module.scss";

// Slides por defecto mientras carga la BD o si no hay slides configurados
const DEFAULT_SLIDES = [
  {
    id: "default-1",
    imagen_url: "https://pub-c0883d14d3e84a69bf84546fa108aa0b.r2.dev/collage%20celulares_2.png",
    titulo: "Accesorios para Celulares",
    descripcion: "Cables, cargadores, fundas y más para tu smartphone",
    link: "/accesorios/celulares",
    boton_texto: "Ver celulares",
  },
  {
    id: "default-2",
    imagen_url: "https://pub-c0883d14d3e84a69bf84546fa108aa0b.r2.dev/collage%20computadoras.png",
    titulo: "Accesorios para Computadores",
    descripcion: "Teclados, mouse, cables y componentes para PC",
    link: "/accesorios/computadoras",
    boton_texto: "Ver computadores",
  },
  {
    id: "default-3",
    imagen_url: "https://pub-c0883d14d3e84a69bf84546fa108aa0b.r2.dev/tecSis.png",
    titulo: "Técnico en Sistemas",
    descripcion: "Soluciones profesionales para todos tus problemas informáticos",
    link: "/servicios/tecnico-sistemas",
    boton_texto: "Ver más",
  },
  {
    id: "default-4",
    imagen_url: "https://pub-c0883d14d3e84a69bf84546fa108aa0b.r2.dev/parque%20Col%C3%B3n.png",
    titulo: "Colón, Putumayo",
    descripcion: "Tu tienda de tecnología en el corazón de Colón",
    link: null,
    boton_texto: null,
    boton_secundario: { texto: "Conocer Colón", href: "https://es.wikipedia.org/wiki/Col%C3%B3n_(Putumayo)" },
  },
];

const PresentationCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slides, setSlides] = useState(DEFAULT_SLIDES);

  // Aviso "Próximamente disponible" para el botón secundario del slide
  const [mostrarProximamente, setMostrarProximamente] = useState(false);

  useEffect(() => {
    fetch('/api/carousel')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.slides?.length > 0) {
          setSlides(data.slides.map(s => ({
            ...s,
            imagen_url: s.imagen_url,
            titulo: s.titulo,
            descripcion: s.descripcion,
            boton_texto: s.boton_texto ?? 'Ver más',
          })));
        }
      })
      .catch(() => {
        // Si falla, mantiene los slides por defecto
      });
  }, []);

  // Auto-slide cada 5 segundos (solo si isPlaying es true)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, isPlaying]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

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
                  src={slide.imagen_url}
                  alt={slide.titulo}
                  fill
                  className={styles.slideImage}
                  priority={index === 0}
                  quality={85}
                  sizes="100vw"
                  unoptimized
                />
                <div className={styles.overlay}></div>
              </div>

              <div className={styles.slideContent}>
                <h2 className={styles.slideTitle}>{slide.titulo}</h2>
                {slide.descripcion && (
                  <p className={styles.slideDescription}>{slide.descripcion}</p>
                )}
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

        {/* Botón Play/Pause */}
        <button
          className={styles.playPauseButton}
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pausar carrusel" : "Reproducir carrusel"}
          title="Pausar / Reproducir"
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Botones del slide actual — fuera del overflow:hidden para no quedar cortados */}
      {(currentSlideData?.link || currentSlideData?.boton_secundario) && (
        <div className={styles.slideButtons}>
          {currentSlideData.link && (
            <Link href={currentSlideData.link} className={styles.seeMoreButton}>
              {currentSlideData.boton_texto ?? "Ver más"}
            </Link>
          )}
          {currentSlideData.boton_secundario && (
            <button
              type="button"
              onClick={() => setMostrarProximamente(true)}
              className={styles.secondaryButton}
            >
              {currentSlideData.boton_secundario.texto}
            </button>
          )}
        </div>
      )}

      {/* Aviso "Próximamente disponible" */}
      {mostrarProximamente && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setMostrarProximamente(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-4">🚧</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Próximamente disponible
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Esta sección estará disponible muy pronto.
            </p>
            <button
              type="button"
              onClick={() => setMostrarProximamente(false)}
              className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationCarousel;
