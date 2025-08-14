import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";

import styles from "../styles/components/Carousel.module.scss";
export function CarouselDemo({
  images = [],
  apiUrl,
  showIndicators = true,
  showArrows = true,
  enableTransitions = false,
}) {
  const [imageData, setImageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Optimización: Solo cargar en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoizar imágenes para evitar re-renders
  const displayImages = useMemo(() => {
    return images.length > 0 ? images : imageData;
  }, [images, imageData]);

  // Optimización: Cargar datos solo cuando sea necesario
  useEffect(() => {
    if (!apiUrl || images.length > 0) return;

    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl);

        if (!response.ok)
          throw new Error(
            `Error HTTP ${response.status}: ${response.statusText}`,
          );

        const data = await response.json();

        if (!isMounted) return;

        // Procesar solo las primeras 5 imágenes para mejorar performance
        let extractedImages = [];
        const productos = data.accesorios || data;
        if (Array.isArray(productos)) {
          extractedImages = productos
            .slice(0, 5)
            .flatMap((item) => {
              if (item.imagenPrincipal) {
                return item.imagenPrincipal;
              } else if (Array.isArray(item.imagenes)) {
                return item.imagenes[0]?.url || item.imagenes[0];
              } else if (Array.isArray(item.images)) {
                return item.images[0];
              }
              return typeof item.images === "string" ? item.images : null;
            })
            .filter(Boolean);
        }

        setImageData(extractedImages);
      } catch (error) {
        console.error("Error loading images:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [apiUrl, images.length]);

  // Optimización: useCallback para prevenir re-renders
  const nextSlide = useCallback(() => {
    if (displayImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevSlide = useCallback(() => {
    if (displayImages.length <= 1) return;
    setCurrentIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1,
    );
  }, [displayImages.length]);

  // Auto-play optimizado
  useEffect(() => {
    if (!enableTransitions || displayImages.length <= 1) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [enableTransitions, displayImages.length, nextSlide]);

  // Renderizado condicional para evitar hidratación
  if (!isClient) return null;

  if (loading) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.loadingPlaceholder}>
          <div className={styles.spinner}>🔄</div>
        </div>
      </div>
    );
  }

  if (displayImages.length === 0) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.noImages}>No hay imágenes disponibles</div>
      </div>
    );
  }

  return (
    <div className={`${styles.carouselContainer} h-7`}>
      <div className={`${styles.carousel} h-7`}>
        <div className={styles.carouselContent}>
          <div className={styles.carouselItem} key={currentIndex}>
            <div className="h-full">
              <div className={styles.card}>
                <div className={`${styles.cardContent} p-0 h-7`}>
                  <Image
                    src={displayImages[currentIndex]}
                    alt={`Imagen ${currentIndex + 1}`}
                    width={800}
                    height={600}
                    priority={currentIndex === 0}
                    loading={currentIndex === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 768px) 100vw, 80vw"
                    quality={85}
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        {showArrows && displayImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="carousel-prev"
              aria-label="Imagen anterior"
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15 18l-6-6 6-6v12z" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="carousel-next"
              aria-label="Imagen siguiente"
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 18l6-6-6-6v12z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Indicadores */}
      {showIndicators && displayImages.length > 1 && (
        <div className={styles.indicators}>
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentIndex ? styles.active : ""
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Ir a imagen ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CarouselDemo;
