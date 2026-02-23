'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * Componente que muestra un carrusel de imágenes de productos de una categoría
 * Las imágenes cambian automáticamente cada 2 segundos
 */
export default function CategoryImageCarousel({ categoryId, fallbackIcon }) {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar imágenes de productos al montar el componente
  useEffect(() => {
    async function loadImages() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/category-images?category=${categoryId}`);

        if (!response.ok) {
          throw new Error('Error al cargar imágenes');
        }

        const data = await response.json();

        if (data.images && data.images.length > 0) {
          setImages(data.images);
        }
      } catch (err) {
        console.error(`Error cargando imágenes de ${categoryId}:`, err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadImages();
  }, [categoryId]);

  // Rotar imágenes cada 2 segundos
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Cambiar cada 2 segundos

    return () => clearInterval(interval);
  }, [images.length]);

  // Si hay error o no hay imágenes, mostrar el ícono de respaldo
  if (error || (!isLoading && images.length === 0)) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-t-xl">
        {fallbackIcon}
      </div>
    );
  }

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-t-xl animate-pulse flex items-center justify-center">
        {fallbackIcon}
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 rounded-t-xl overflow-hidden bg-white dark:bg-gray-800">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image}
            alt={`Producto ${categoryId} ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index === 0} // Priorizar la primera imagen
          />
        </div>
      ))}

      {/* Indicadores de posición */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? 'bg-white w-4'
                  : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
