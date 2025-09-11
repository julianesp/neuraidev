"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "../../styles/components/AccesoriosDestacados.module.scss";
import Link from "next/link";
import { generateProductSlug, buildProductUrl } from "../../utils/slugify";

const ProductosRecientes = () => {
  // Estado para almacenar los productos recientes
  const [recientes, setRecientes] = useState([]);

  // Estado para controlar la carga
  const [loading, setLoading] = useState(true);

  // Estado para manejar posibles errores
  const [errorState, setErrorState] = useState(null);

  // Estado para controlar errores de imágenes
  const [imgError, setImgError] = useState({});

  // Estado para controlar el índice del producto actual en vista móvil
  const [activeIndex, setActiveIndex] = useState(0);

  // Referencia al contenedor de scroll
  const containerRef = useRef(null);

  // Función para obtener productos recientes de los últimos 30 días
  const obtenerProductosRecientes = async () => {
    try {
      const response = await fetch("/api/productos/recientes");
      if (!response.ok) {
        throw new Error("Error al obtener productos recientes");
      }
      const data = await response.json();
      return data.productos || [];
    } catch (error) {
      console.error("Error al obtener productos recientes:", error);
      throw error;
    }
  };

  // Función para formatear la fecha de creación
  const formatearFechaCreacion = (fecha) => {
    const fechaCreacion = new Date(fecha);
    const ahora = new Date();
    const diferenciaDias = Math.floor(
      (ahora - fechaCreacion) / (1000 * 60 * 60 * 24),
    );

    if (diferenciaDias === 0) return "Hoy";
    if (diferenciaDias === 1) return "Ayer";
    if (diferenciaDias < 7) return `Hace ${diferenciaDias} días`;
    if (diferenciaDias < 30)
      return `Hace ${Math.floor(diferenciaDias / 7)} semanas`;
    return fechaCreacion.toLocaleDateString("es-ES");
  };

  // Efecto para cargar los productos recientes al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const productosData = await obtenerProductosRecientes();
        setRecientes(productosData);
        setErrorState(null);
      } catch (err) {
        console.error("Error al cargar productos recientes:", err);
        setErrorState("No se pudieron cargar los productos nuevos");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Función para manejar el desplazamiento hacia atrás
  const moveLeft = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      scrollToPosition(activeIndex - 1);
    }
  };

  // Función para manejar el desplazamiento hacia adelante
  const moveRight = () => {
    if (activeIndex < recientes.length - 1) {
      setActiveIndex(activeIndex + 1);
      scrollToPosition(activeIndex + 1);
    }
  };

  // Función para desplazarse a una posición específica
  const scrollToPosition = (index) => {
    if (containerRef.current) {
      const itemWidth = containerRef.current.children[0]?.offsetWidth || 0;
      containerRef.current.scrollTo({
        left: itemWidth * index,
        behavior: "smooth",
      });
    }
  };

  // Renderizar mensaje de error
  if (errorState) {
    return (
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Productos Nuevos</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{errorState}</p>
        </div>
      </div>
    );
  }

  // Si no hay productos recientes
  if (recientes.length === 0) {
    return (
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Productos Nuevos</h2>
        <p className="text-gray-600 text-center">
          No hay productos nuevos disponibles
        </p>
      </div>
    );
  }

  // Renderizar estado de carga
  if (loading) {
    return (
      <div
        className={`${styles.container} bg-blue-50 p-6 rounded-lg border dark:border-white`}
      >
        <h2 className="text-2xl font-bold mb-6">🆕 Productos Recientes</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">
            Cargando productos recientes...
          </span>
        </div>
      </div>
    );
  }

  // Renderizar el componente con los productos cargados
  return (
    <div
      className={`${styles.container} bg-blue-50 p-6 rounded-lg border  dark:border-white`}
    >
      <h2 className="text-2xl font-bold mb-6">
        🆕 Productos Recientes
        <span className="text-sm font-normal text-gray-600 ml-2">
          (Últimos 30 días)
        </span>
      </h2>

      {/* Navegación para móviles */}
      <div
        className={`flex justify-between items-center mb-1 ${styles.accesories}`}
      >
        <button
          onClick={moveLeft}
          disabled={activeIndex === 0}
          className={`bg-blue-500 text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${activeIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="Producto anterior"
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
          {activeIndex + 1} / {recientes.length}
        </span>

        <button
          onClick={moveRight}
          disabled={activeIndex === recientes.length - 1}
          className={`bg-blue-500 text-justify flex justify-center items-center text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${activeIndex === recientes.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="Siguiente producto"
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
        ref={containerRef}
        className="flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {recientes.map((producto, index) => {
          const productSlug = generateProductSlug(producto.nombre, producto.id);
          const productUrl = buildProductUrl(producto.categoria, productSlug);

          return (
            <Link
              key={producto.id}
              href={productUrl}
              className="producto-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0 snap-start mx-2 flex flex-col relative"
              style={{
                minWidth: "calc(100% - 1rem)",
                width: "calc(100% - 1rem)",
                opacity: activeIndex === index ? 1 : 0.7,
                transform: `scale(${activeIndex === index ? 1 : 0.95})`,
              }}
              onClick={(e) => {
                // Prevenir navegación para permitir el manejo de scroll primero
                e.preventDefault();
                setActiveIndex(index);
                scrollToPosition(index);

                // Navegar después de un breve delay para permitir la animación
                setTimeout(() => {
                  window.location.href = productUrl;
                }, 300);
              }}
            >
              {/* Badge de "NUEVO" */}
              <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                NUEVO
              </div>

              {/* Badge con fecha de creación */}
              <div className="absolute top-2 right-2 bg-white bg-opacity-90 text-gray-700 px-2 py-1 rounded-full text-xs font-medium z-10">
                {formatearFechaCreacion(producto.createdAt)}
              </div>
              {/* Contenedor de imagen con posición relativa y tamaño fijo */}
              <div className="w-full h-48 relative">
                <Image
                  src={
                    producto.imagenPrincipal ||
                    (producto.imagenes && producto.imagenes.length > 0
                      ? producto.imagenes[0].url
                      : "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Accesorios/books/used/algebra_intermedia/2.jpg")
                  }
                  alt={producto.nombre}
                  fill={true}
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false} // Solo true para imágenes above-the-fold
                  loading="lazy"
                  quality={85} // Reduce de 100 a 85
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                  onError={() =>
                    setImgError((prev) => ({
                      ...prev,
                      [`reciente-${producto.id}`]: true,
                    }))
                  }
                />
              </div>

              <div className="p-4 w-full">
                <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                <p className="text-black mt-1 text-sm line-clamp-2 dark:text-white">
                  {producto.descripcion}
                </p>
                <p className="text-blue-600 text-xs font-medium mt-1">
                  Categoría: {producto.categoria}
                </p>
                <div className="mt-2 flex items-center">
                  <span className="font-bold text-lg">
                    $
                    {typeof producto.precio === "number"
                      ? producto.precio.toLocaleString("es-CL")
                      : producto.precio}
                  </span>
                  {producto.precioAnterior && (
                    <span className="text-gray-500 line-through ml-2 text-sm">
                      $
                      {typeof producto.precioAnterior === "number"
                        ? producto.precioAnterior.toLocaleString("es-CL")
                        : producto.precioAnterior}
                    </span>
                  )}
                </div>

                {/* Mostrar stock si está disponible */}
                {producto.stock !== undefined && (
                  <div className="mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        producto.stock > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {producto.stock > 0
                        ? `${producto.stock} disponibles`
                        : "Sin stock"}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Indicadores de paginación (puntos) */}
      <div className="flex justify-center mt-4 space-x-2">
        {recientes.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveIndex(index);
              scrollToPosition(index);
            }}
            className={`h-2 rounded-full transition-all duration-300 focus:outline-none
              ${activeIndex === index ? "bg-blue-500 w-4" : "bg-gray-300 w-2"}`}
            aria-label={`Ir al producto ${index + 1}`}
          ></button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/accesorios"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Ver todos los productos
        </Link>
      </div>
    </div>
  );
};

export default ProductosRecientes;
