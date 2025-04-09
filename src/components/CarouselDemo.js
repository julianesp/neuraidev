"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import styles from "@/styles/Carousel.module.scss";

export function CarouselDemo({
  images = [],
  apiUrl,
  showIndicators = true,
  showArrows = true, // Nueva prop para controlar la visibilidad de las flechas
}) {
  const [imageData, setImageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const autoplayTimerRef = useRef(null);

  // Cargar imágenes desde API (mismo código que antes)
  useEffect(() => {
    if (apiUrl) {
      setLoading(true);
      setError(null);

      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          let extractedImages = [];

          if (Array.isArray(data)) {
            extractedImages = data.flatMap((item) => {
              if (Array.isArray(item.images)) {
                return item.images;
              } else if (typeof item.images === "string") {
                return [item.images];
              } else {
                return Object.values(item).filter(
                  (value) =>
                    typeof value === "string" &&
                    (value.includes("http") || value.includes("/")),
                );
              }
            });
          } else if (typeof data === "object" && data !== null) {
            extractedImages = Object.values(data).filter(
              (value) =>
                typeof value === "string" &&
                (value.includes("http") || value.includes("/")),
            );
          }

          setImageData(extractedImages);
        })
        .catch((error) => {
          console.error("Error cargando imágenes:", error);
          setError(error.message);
        })
        .finally(() => setLoading(false));
    }
  }, [apiUrl]);

  // Obtener las imágenes a mostrar
  const displayImages = images.length > 0 ? images : imageData;

  // Función para iniciar el autoplay usando useRef para evitar problemas de dependencias
  const startAutoplayRef = useRef(() => {});

  // Definimos la función real de autoplay
  useEffect(() => {
    // Definimos la función dentro del efecto para tener acceso a los valores más recientes
    startAutoplayRef.current = () => {
      console.log("Iniciando autoplay");
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }

      if (!displayImages || displayImages.length <= 1) return;

      autoplayTimerRef.current = setTimeout(() => {
        if (!isPaused) {
          console.log("Avanzando al siguiente slide");
          setCurrentIndex(
            (prevIndex) => (prevIndex + 1) % displayImages.length,
          );
        }
        startAutoplayRef.current(); // Llamar recursivamente a través de la referencia
      }, 5000);
    };
  }, [displayImages, isPaused]);

  // Iniciar autoplay al montar el componente
  useEffect(() => {
    console.log("Configurando autoplay inicial");
    // Llamamos a la función de inicio inmediatamente después de montar
    startAutoplayRef.current();

    return () => {
      console.log("Limpiando temporizador al desmontar");
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, []); // Sin dependencias para ejecutar solo al montar/desmontar

  // Función para pausar temporalmente el autoplay
  const pauseAutoplay = () => {
    console.log("Pausando autoplay");

    // Detener cualquier temporizador existente
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
    }

    setIsPaused(true);

    // Reanudar después de 1 segundo
    setTimeout(() => {
      console.log("Reanudando autoplay después de pausa");
      setIsPaused(false);
      // Reiniciar el autoplay explícitamente
      startAutoplayRef.current();
    }, 1000);
  };

  // Navegación manual
  const goToPrevious = () => {
    const newIndex =
      currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1;
    console.log("Cambiando a slide anterior:", newIndex);
    setCurrentIndex(newIndex);
    pauseAutoplay();
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % displayImages.length;
    console.log("Cambiando a slide siguiente:", newIndex);
    setCurrentIndex(newIndex);
    pauseAutoplay();
  };

  const goToSlide = (index) => {
    console.log("Cambiando a slide específico:", index);
    setCurrentIndex(index);
    pauseAutoplay();
  };

  if (loading) {
    return <div>Cargando imágenes...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!displayImages || displayImages.length === 0) {
    return (
      <div>No hay imágenes disponibles. Verifique la estructura del JSON.</div>
    );
  }

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carousel}>
        <div className={styles.carouselContent}>
          {/* Solo mostramos la imagen actual */}
          <div className={styles.carouselItem} key={currentIndex}>
            <div className="p-1 h-full">
              <div className={styles.card}>
                <div className={`${styles.cardContent} p-0`}>
                  <Image
                    src={displayImages[currentIndex]}
                    alt={`Imagen ${currentIndex + 1}`}
                    className="rounded-lg"
                    width={800}
                    height={600}
                    priority
                    sizes="(max-width: 768px) 100vw, 80vw"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de navegación - ahora condicionales basados en prop showArrows */}
        {showArrows && displayImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="carousel-prev"
              aria-label="Anterior"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="carousel-next"
              aria-label="Siguiente"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Indicadores - condicionales basados en prop showIndicators */}
      {showIndicators && displayImages.length > 1 && (
        <div className={styles.indicators}>
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentIndex ? styles.active : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CarouselDemo;
