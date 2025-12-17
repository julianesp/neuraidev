"use client";

import React, { useState, useRef, useEffect } from "react";
import { obtenerProductosDestacados } from "@/lib/supabase/productos";
import Image from "next/image";
// import styles from "@/styles/components/AccesoriosDestacados.module.scss";
import styles from "@/styles/components/AccesoriosDestacados.module.scss";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/FavoriteButton";

const AccesoriosDestacados = () => {
  // Estado para almacenar los accesorios destacados
  const [destacados, setDestacados] = useState([]);

  // Estado para manejar posibles errores
  const [error, setError] = useState(null);

  // Estado para controlar el índice del accesorio actual en vista móvil
  const [currentIndex, setCurrentIndex] = useState(0);

  // Referencia al contenedor de scroll
  const scrollContainerRef = useRef(null);

  // Efecto para cargar los accesorios destacados al montar el componente
  useEffect(() => {
    const cargarAccesorios = async () => {
      try {
        const accesoriosData = await obtenerProductosDestacados();
        setDestacados(accesoriosData);
        setError(null);
      } catch (err) {
        console.error("Error al cargar accesorios destacados:", err);
        setError("No se pudieron cargar los accesorios");
      }
    };

    cargarAccesorios();
  }, []);

  // Función para manejar el desplazamiento a la izquierda
  const scrollLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scrollToItem(currentIndex - 1);
    }
  };

  // Función para manejar el desplazamiento a la derecha
  const scrollRight = () => {
    if (currentIndex < destacados.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollToItem(currentIndex + 1);
    }
  };

  // Función para desplazarse a un elemento específico
  const scrollToItem = (index) => {
    if (scrollContainerRef.current) {
      const itemWidth =
        scrollContainerRef.current.children[0]?.offsetWidth || 0;
      scrollContainerRef.current.scrollTo({
        left: itemWidth * index,
        behavior: "smooth",
      });
    }
  };

  // Renderizar mensaje de error
  if (error) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Accesorios Destacados</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Si no hay accesorios destacados
  if (destacados.length === 0) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Accesorios Destacados</h2>
        <p className="text-gray-600 text-center">
          No hay accesorios destacados disponibles
        </p>
      </div>
    );
  }

  // Renderizar el componente con los accesorios cargados
  return (
    <div
      className={`${styles.container} bg-yellow-50 p-2 rounded-lg border  dark:border-gray-500`}
    >
      <h2 className="text-2xl font-bold mb-6">Accesorios destacados</h2>

      {/* Navegación para móviles */}
      <div
        className={`flex justify-between items-center mb-1 ${styles.accesories}`}
      >
        <button
          onClick={scrollLeft}
          disabled={currentIndex === 0}
          className={`bg-yellow-500 text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="Anterior accesorio"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <span className="text-sm text-gray-600">
          {currentIndex + 1} / {destacados.length}
        </span>

        <button
          onClick={scrollRight}
          disabled={currentIndex === destacados.length - 1}
          className={`bg-yellow-500 text-justify flex justify-center items-center text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${currentIndex === destacados.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="Siguiente accesorio"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Contenedor con scroll horizontal */}
      <div
        ref={scrollContainerRef}
        className="flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {destacados.map((accesorio, index) => (
          <div
            key={`${accesorio.categoria}-${accesorio.id}-${index}`}
            className="accesorio-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0 snap-start mx-2 flex flex-col bg-white dark:bg-gray-800"
            style={{
              minWidth: "calc(100% - 1rem)",
              width: "calc(100% - 1rem)",
              opacity: currentIndex === index ? 1 : 0.7,
              transform: `scale(${currentIndex === index ? 1 : 0.95})`,
            }}
          >
            {/* Contenedor de imagen con posición relativa y tamaño fijo */}
            <div className="w-full h-48 relative">
              <Link href={`/accesorios/${accesorio.categoria}/${accesorio.id}`}>
                <Image
                  src={
                    accesorio.imagen_principal ||
                    (accesorio.imagenes && accesorio.imagenes.length > 0
                      ? accesorio.imagenes[0].url
                      : "/imageshttps://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen")
                  }
                  alt={`${accesorio.nombre} - Producto destacado en Neurai.dev`}
                  fill={true}
                  className="object-contain cursor-pointer"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                  loading="lazy"
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                />
              </Link>

              {/* Botón de favoritos en la esquina superior derecha */}
              <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                <FavoriteButton producto={accesorio} size="small" />
              </div>

              {/* Badge de stock si está bajo */}
              {accesorio.stock && accesorio.stock <= 5 && accesorio.stock > 0 && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  ¡{accesorio.stock} unidades!
                </div>
              )}
            </div>

            <div className="p-4 w-full flex flex-col flex-grow">
              <Link href={`/accesorios/${accesorio.categoria}/${accesorio.id}`}>
                <h3 className="font-semibold text-lg hover:text-yellow-600 transition-colors cursor-pointer">
                  {accesorio.nombre}
                </h3>
              </Link>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm line-clamp-2">
                {accesorio.descripcion}
              </p>
              <div className="mt-2 flex items-center mb-3">
                <span className="font-bold text-lg text-green-600">
                  $
                  {typeof accesorio.precio === "number"
                    ? accesorio.precio.toLocaleString("es-CL")
                    : accesorio.precio}
                </span>
                {accesorio.precioAnterior && (
                  <span className="text-gray-500 line-through ml-2 text-sm">
                    $
                    {typeof accesorio.precioAnterior === "number"
                      ? accesorio.precioAnterior.toLocaleString("es-CL")
                      : accesorio.precioAnterior}
                  </span>
                )}
              </div>

              {/* Botón de agregar al carrito - al final */}
              <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
                <AddToCartButton producto={accesorio} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores de paginación (puntos) */}
      <div className="flex justify-center mt-4 space-x-2">
        {destacados.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              scrollToItem(index);
            }}
            className={`h-2 rounded-full transition-all duration-300 focus:outline-none
              ${currentIndex === index ? "bg-yellow-500 w-4" : "bg-gray-300 w-2"}`}
            aria-label={`Ir al accesorio ${index + 1}`}
          ></button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/accesorios/destacados"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Ver todos los destacados
        </Link>
      </div>
    </div>
  );
};

export default AccesoriosDestacados;
