"use client";

// components/AccesoriosContainer.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle, Eye } from "lucide-react";
import Head from "next/head"; // Importar Head para SEO
import styles from "./AccesoriosContainer.module.scss"; // Importamos estilos SCSS

// Componente principal mejorado
const AccesoriosContainer = ({
  apiUrl,
  accesorio: accesorioProps,
  otrosAccesorios: otrosAccesoriosProps = [],
  telefono: telefonoProps = "+573174503604",
}) => {
  // Referencia para el scrolling
  const containerRef = useRef(null);

  const [todosAccesorios, setTodosAccesorios] = useState([]);
  const [accesorio, setAccesorio] = useState(null);
  const [otrosAccesorios, setOtrosAccesorios] = useState([]);
  const [telefono, setTelefono] = useState(telefonoProps);
  const [mainSlideIndex, setMainSlideIndex] = useState(0);
  const [relatedSlideIndex, setRelatedSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // Bandera para evitar cargas múltiples
  const [isMobile, setIsMobile] = useState(false);
  const [imageError, setImageError] = useState({}); // Controlar errores de carga de imágenes
  const [imageRetries, setImageRetries] = useState({}); // Controlar reintentos de carga

  // Efecto para detectar si estamos en móvil
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  // En AccesoriosContainer, modifica la función cambiarAccesorio para ajustar el scroll
  const cambiarAccesorio = useCallback(
    (nuevoAccesorio) => {
      if (!nuevoAccesorio) {
        console.error(
          "Error: Intento de cambiar a un accesorio nulo o indefinido",
        );
        return;
      }

      // Resetear el índice del slide principal
      setMainSlideIndex(0);

      // Resetear los errores de imagen
      setImageError({});

      // 1. Guardar el accesorio actual
      const accesorioActual = accesorio;

      // 2. Establecer el nuevo accesorio principal
      setAccesorio(nuevoAccesorio);

      // 3. Actualizar otros accesorios...
      // [resto del código para actualizar accesorios]

      // Hacer scroll con un pequeño offset para que el contenido sea visible
      if (containerRef.current) {
        // Calculamos la posición del elemento
        const rect = containerRef.current.getBoundingClientRect();
        // Usamos scrollTo con un offset en lugar de scrollIntoView
        window.scrollTo({
          top: window.scrollY + rect.top - 100, // Offset de 100px
          behavior: "smooth",
        });
      }
    },
    [accesorio],
  );

  // Cargar datos solo si no se han proporcionado directamente y hay una apiUrl
  useEffect(() => {
    // Evitar cargar múltiples veces
    if (dataLoaded) return;

    // Caso 1: Tenemos datos como props
    if (accesorioProps) {
      const todos = [accesorioProps, ...otrosAccesoriosProps];
      setTodosAccesorios(todos);
      setAccesorio(accesorioProps);
      setOtrosAccesorios(otrosAccesoriosProps);
      setLoading(false);
      setDataLoaded(true);
      return;
    }

    // Caso 2: Necesitamos cargar desde API
    if (!apiUrl) {
      setLoading(false);
      setDataLoaded(true);
      return;
    }

    const cargarDatos = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Error al cargar datos: ${response.status}`);
        }

        const data = await response.json();

        let accesoriosData = [];
        let accesorioInicial = null;
        let otrosAccesoriosData = [];
        let telefonoConfig = telefono;

        // Estructura 1: Array directo de accesorios
        if (Array.isArray(data)) {
          accesoriosData = [...data];
          if (data.length > 0) {
            accesorioInicial = data[0];
            otrosAccesoriosData = data.slice(1);
          }
        }
        // Estructura 2: Objeto con propiedad 'accesorios'
        else if (data.accesorios && Array.isArray(data.accesorios)) {
          accesoriosData = [...data.accesorios];
          if (data.accesorios.length > 0) {
            accesorioInicial = data.accesorios[0];
            otrosAccesoriosData = data.accesorios.slice(1);
          }

          // Configuración adicional
          if (data.configuracion && data.configuracion.telefono) {
            telefonoConfig = data.configuracion.telefono;
          }
        }

        // Actualizar estados
        setTodosAccesorios(accesoriosData);
        setAccesorio(accesorioInicial);
        setOtrosAccesorios(otrosAccesoriosData);
        setTelefono(telefonoConfig);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    };

    cargarDatos();
  }, [apiUrl, accesorioProps, otrosAccesoriosProps, telefono, dataLoaded]);

  // Función para avanzar en el carrusel principal
  const nextMainSlide = (e) => {
    e.preventDefault(); // Prevenir comportamiento predeterminado

    if (
      !accesorio?.imagenes ||
      !Array.isArray(accesorio.imagenes) ||
      accesorio.imagenes.length <= 1
    )
      return;

    setMainSlideIndex((prevIndex) =>
      prevIndex === accesorio.imagenes.length - 1 ? 0 : prevIndex + 1,
    );
  };

  // Función para retroceder en el carrusel principal
  const prevMainSlide = (e) => {
    e.preventDefault(); // Prevenir comportamiento predeterminado

    if (
      !accesorio?.imagenes ||
      !Array.isArray(accesorio.imagenes) ||
      accesorio.imagenes.length <= 1
    )
      return;

    setMainSlideIndex((prevIndex) =>
      prevIndex === 0 ? accesorio.imagenes.length - 1 : prevIndex - 1,
    );
  };

  // Función para avanzar en el carrusel de productos relacionados
  const nextRelatedSlide = (e) => {
    e.preventDefault(); // Prevenir comportamiento predeterminado

    if (!otrosAccesorios || otrosAccesorios.length <= (isMobile ? 2 : 3))
      return;

    const totalSlides = Math.ceil(otrosAccesorios.length / (isMobile ? 2 : 3));
    setRelatedSlideIndex((prevIndex) =>
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1,
    );
  };

  // Función para retroceder en el carrusel de productos relacionados
  const prevRelatedSlide = (e) => {
    e.preventDefault(); // Prevenir comportamiento predeterminado

    if (!otrosAccesorios || otrosAccesorios.length <= (isMobile ? 2 : 3))
      return;

    const totalSlides = Math.ceil(otrosAccesorios.length / (isMobile ? 2 : 3));
    setRelatedSlideIndex((prevIndex) =>
      prevIndex === 0 ? totalSlides - 1 : prevIndex + 1,
    );
  };

  // Manejar errores de carga de imágenes con sistema de reintento
  const handleImageError = (index, imageSrc) => {
    console.warn(`Error cargando imagen: ${imageSrc}`);

    // Comprobar si ya hemos reintentado esta imagen
    const currentRetries = imageRetries[index] || 0;

    if (currentRetries < 2) {
      // Reintentar cargando la imagen
      setImageRetries((prev) => ({
        ...prev,
        [index]: currentRetries + 1,
      }));

      // Forzar reintento agregando timestamp para evitar caché
      const timeStamp = new Date().getTime();
      const retrySrc = imageSrc.includes("?")
        ? `${imageSrc}&retry=${timeStamp}`
        : `${imageSrc}?retry=${timeStamp}`;

      // Actualizar la URL temporal para forzar recarga (solo para lógica interna)
      setTimeout(() => {
        const img = new Image();
        img.src = retrySrc;
      }, 1000);
    } else {
      // Después de reintentos fallidos, marcar como error
      setImageError((prev) => ({
        ...prev,
        [index]: true,
      }));
    }
  };

  // Determinar si mostrar botones de navegación para productos relacionados
  const mostrarBotonesRelacionados =
    otrosAccesorios && otrosAccesorios.length > (isMobile ? 2 : 3);

  // Si está cargando, mostrar un spinner
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 mt-8 bg-white/30 backdrop-blur-md rounded-lg shadow-lg flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay accesorio, mostrar un mensaje
  if (!accesorio) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-white/30 backdrop-blur-md rounded-lg shadow-lg">
        <h1 className="text-xl font-bold text-center">
          No se encontraron accesorios
        </h1>
      </div>
    );
  }

  // URL para WhatsApp con mensaje predefinido que incluye enlace clickeable a la página
  const obtenerUrlActual = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  // Formatear correctamente el mensaje para WhatsApp
  const mensajeBase = `Hola, estoy interesado en el accesorio: ${accesorio.nombre || ""}`;
  const urlActual = obtenerUrlActual();
  const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeBase)}%0A%0A${encodeURIComponent("Puedes verlo aquí: ")}${encodeURIComponent(urlActual)}`;

  // Determinar si hay imágenes para mostrar
  const tieneImagenes =
    accesorio.imagenes &&
    Array.isArray(accesorio.imagenes) &&
    accesorio.imagenes.length > 0;

  // Obtener la imagen principal - PRIORIZA imagenPrincipal como fuente principal
  let imagenPrincipal = accesorio.imagenPrincipal || null;

  // Solo si no hay imagenPrincipal, intentar usar la primera de imagenes
  if (!imagenPrincipal && tieneImagenes) {
    imagenPrincipal =
      typeof accesorio.imagenes[0] === "object" && accesorio.imagenes[0].url
        ? accesorio.imagenes[0].url
        : accesorio.imagenes[0];
  }

  return (
    <div
      ref={containerRef}
      id="accesorios-container"
      className={`${styles.container} max-w-6xl mx-auto p-4 bg-white/30 backdrop-blur-md rounded-lg shadow-lg`}
      style={{
        opacity: accesorio.vendido ? accesorio.estilos?.opacidad || 0.8 : 1,
        filter: accesorio.vendido
          ? accesorio.estilos?.filtro || "grayscale(50%)"
          : "none",
      }}
    >
      {/* Etiqueta de VENDIDO */}
      {accesorio.vendido && (
        <div className="text-center mb-4">
          <span
            className="inline-block px-4 py-2 rounded-full text-lg font-bold transform -rotate-3 shadow-lg"
            style={{
              backgroundColor:
                accesorio.estilos?.fondoTextoVendido || "#000000",
              color: accesorio.estilos?.colorTextoVendido || "#ff4444",
            }}
          >
            {accesorio.estilos?.textoVendido || "VENDIDO"}
          </span>
        </div>
      )}

      {/* Título del accesorio */}
      <h1 className="text-3xl font-bold text-center mb-6">
        {accesorio.nombre}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Carrusel principal - SECCIÓN MEJORADA */}
        <div className={`${styles.mainImageContainer} relative h-60 md:h-80`}>
          <div className="h-full w-full relative overflow-hidden rounded-lg">
            {tieneImagenes ? (
              accesorio.imagenes.map((imagen, index) => {
                const imagenUrl =
                  typeof imagen === "object" && imagen.url
                    ? imagen.url
                    : imagen;

                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                      index === mainSlideIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div className="relative w-full h-full">
                      {!imageError[`main-${index}`] ? (
                        <Image
                          src={imagenUrl}
                          alt={`${accesorio.nombre} - Imagen ${index + 1}`}
                          fill={true}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="rounded-lg object-contain"
                          priority={index === mainSlideIndex}
                          onError={() =>
                            handleImageError(`main-${index}`, imagenUrl)
                          }
                          unoptimized={imagenUrl.includes(
                            "firebasestorage.googleapis.com",
                          )}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-slate-100/40 backdrop-blur-sm rounded-lg">
                          <Image
                            src="/images/placeholder-product.png"
                            alt="Imagen no disponible"
                            width={200}
                            height={200}
                            className="mb-2 opacity-60"
                          />
                          <p className="text-gray-500">Imagen no disponible</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : imagenPrincipal ? (
              <div className="absolute inset-0">
                <div className="relative w-full h-full">
                  {!imageError["principal"] ? (
                    <Image
                      src={imagenPrincipal}
                      alt={accesorio.nombre}
                      fill={true}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="rounded-lg object-contain"
                      priority
                      onError={() => handleImageError("principal")}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-white/20 backdrop-blur-sm rounded-lg">
                      <p className="text-gray-500 dark:text-gray-300">
                        Imagen no disponible
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-white/20 backdrop-blur-sm rounded-lg">
                <p className="text-gray-500 dark:text-gray-300">
                  No hay imágenes disponibles
                </p>
              </div>
            )}

            {/* Controles del carrusel principal - solo si hay múltiples imágenes */}
            {tieneImagenes && accesorio.imagenes.length > 1 && (
              <>
                <button
                  onClick={prevMainSlide}
                  className={`${styles.navButton} bg-black text-white dark:bg-white absolute left-2 top-1/2 transform -translate-y-1/2 border-solid border-white p-2 rounded-full shadow-md  transition-all  darl:text-black dark:text-black dark:border-white dark:border-solid `}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextMainSlide}
                  className={`${styles.navButton} bg-black text-white dark:bg-white dark:text-black absolute right-2 top-1/2 transform -translate-y-1/2 border-solid border-white p-2 rounded-full shadow-md hover:bg-opacity-75 transition-all`}
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Indicadores de posición */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center mx-auto space-x-2 bg-orange-300 h-5 p-1 w-56 rounded-xl border-stone-950">
                  {accesorio.imagenes.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        setMainSlideIndex(index);
                      }}
                      className={`w-3 h-3 rounded-full ${
                        index === mainSlideIndex ? "bg-primary" : "bg-gray-300"
                      }`}
                      aria-label={`Ir a imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
              Descripción
            </h2>
            <p className="whitespace-pre-line text-black dark:text-white mb-4">
              {accesorio.descripcion || "Sin descripción disponible"}
            </p>

            {/* Características */}
            {accesorio.caracteristicas &&
              accesorio.caracteristicas.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2 text-black dark:text-black">
                    Características
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {accesorio.caracteristicas.map((caracteristica, index) => (
                      <li
                        key={index}
                        className="text-gray-800 dark:text-gray-200"
                      >
                        {caracteristica}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Precio */}
            <div className="mt-4">
              <span className="text-2xl font-bold text-primary dark:text-white">
                Valor $
                {typeof accesorio.precio === "number"
                  ? accesorio.precio.toLocaleString("es-CO")
                  : accesorio.precio}
              </span>
              {accesorio.precioAnterior && (
                <span className="ml-2 text-gray-400 dark:text-gray-500 line-through">
                  $
                  {typeof accesorio.precioAnterior === "number"
                    ? accesorio.precioAnterior.toLocaleString("es-CO")
                    : accesorio.precioAnterior}
                </span>
              )}
            </div>
          </div>

          {/* Botón de WhatsApp */}
          {accesorio.vendido ? (
            <div className="mt-6 bg-gray-400 text-white py-3 px-6 rounded-lg flex items-center justify-center opacity-60 cursor-not-allowed">
              <MessageCircle className="mr-2" />
              Producto no disponible
            </div>
          ) : (
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.boton} mt-6 bg-green-500 text-black dark:text-white py-3 px-6 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors`}
            >
              <MessageCircle className="mr-2 text-black dark:text-white" />
              Consultar por WhatsApp
            </Link>
          )}
        </div>
      </div>

      {otrosAccesorios && otrosAccesorios.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Otros accesorios
          </h2>

          <div className="relative">
            <div className={styles.otrosAccesoriosGrid}>
              {otrosAccesorios.map((item, itemIndex) => {
                // Obtener URL de imagen de manera segura
                const itemImageUrl =
                  item.imagenPrincipal ||
                  (item.imagenes && item.imagenes.length > 0
                    ? typeof item.imagenes[0] === "object" &&
                      item.imagenes[0].url
                      ? item.imagenes[0].url
                      : item.imagenes[0]
                    : null);

                return (
                  <div
                    key={itemIndex}
                    className={`${styles.relatedItemCard} ${styles.otrosAccesoriosItem} bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-lg p-3 hover:shadow-md transition-shadow ${
                      item.vendido ? "relative" : ""
                    }`}
                    style={{
                      opacity: item.vendido ? item.estilos?.opacidad || 0.6 : 1,
                      filter: item.vendido
                        ? item.estilos?.filtro || "grayscale(100%)"
                        : "none",
                    }}
                  >
                    {/* Etiqueta de VENDIDO para productos relacionados */}
                    {item.vendido && (
                      <div
                        className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-bold transform rotate-12"
                        style={{
                          backgroundColor:
                            item.estilos?.fondoTextoVendido || "#000000",
                          color: item.estilos?.colorTextoVendido || "#ff4444",
                        }}
                      >
                        {item.estilos?.textoVendido || "VENDIDO"}
                      </div>
                    )}

                    <div className="relative h-40 mb-2 overflow-hidden rounded">
                      {!imageError[`related-${itemIndex}`] && itemImageUrl ? (
                        <Image
                          src={itemImageUrl}
                          alt={item.nombre || ""}
                          fill={true}
                          className="object-contain"
                          onError={() =>
                            handleImageError(`related-${itemIndex}`)
                          }
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={false} // Solo true para imágenes above-the-fold
                          loading="lazy"
                          quality={85} // Reduce de 100 a 85
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-white/20 backdrop-blur-sm">
                          <p className="text-gray-500">Sin imagen</p>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm truncate text-black dark:text-white">
                      {item.nombre || ""}
                    </h3>
                    <p className="text-black dark:text-white font-bold mt-1">
                      $
                      {typeof item.precio === "number"
                        ? item.precio.toLocaleString("es-CO")
                        : item.precio}
                    </p>

                    {/* Botón Ver */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();

                        cambiarAccesorio(item);
                      }}
                      className={`mt-3 py-2 px-4 rounded flex items-center justify-center w-full transition-colors text-sm ${
                        item.vendido
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                      aria-label={`Ver detalles de ${item.nombre || "accesorio"}`}
                      disabled={item.vendido}
                    >
                      <Eye size={16} className="mr-1" />
                      Ver
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Controles del carrusel */}
            {mostrarBotonesRelacionados && (
              <>
                {/* <button
                  onClick={prevRelatedSlide}
                  className={`${styles.navButton} absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all z-10`}
                  aria-label="Ver productos anteriores"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextRelatedSlide}
                  className={`${styles.navButton} absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all z-10`}
                  aria-label="Ver productos siguientes"
                >
                  <ChevronRight size={20} />
                </button> */}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccesoriosContainer;

// "use client";

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
//   useMemo,
// } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { ChevronLeft, ChevronRight, MessageCircle, Eye } from "lucide-react";
// import styles from "./AccesoriosContainer.module.scss";

// // Hook personalizado para manejo de imágenes
// const useImageHandler = () => {
//   const [imageError, setImageError] = useState({});
//   const [imageRetries, setImageRetries] = useState({});

//   const handleImageError = useCallback(
//     (index, imageSrc) => {
//       console.warn(`Error cargando imagen: ${imageSrc}`);

//       const currentRetries = imageRetries[index] || 0;

//       if (currentRetries < 2) {
//         setImageRetries((prev) => ({
//           ...prev,
//           [index]: currentRetries + 1,
//         }));

//         // Reintento con timestamp para evitar caché
//         setTimeout(() => {
//           const img = new Image();
//           const timeStamp = Date.now();
//           img.src = imageSrc.includes("?")
//             ? `${imageSrc}&retry=${timeStamp}`
//             : `${imageSrc}?retry=${timeStamp}`;
//         }, 1000);
//       } else {
//         setImageError((prev) => ({
//           ...prev,
//           [index]: true,
//         }));
//       }
//     },
//     [imageRetries],
//   );

//   const resetImageErrors = useCallback(() => {
//     setImageError({});
//     setImageRetries({});
//   }, []);

//   return { imageError, handleImageError, resetImageErrors };
// };

// // Hook para detección de dispositivo móvil
// const useMobileDetection = () => {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();

//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   return isMobile;
// };

// // Componente optimizado para imagen con placeholder
// const OptimizedImage = React.memo(
//   ({
//     src,
//     alt,
//     fill = true,
//     sizes,
//     className,
//     priority = false,
//     onError,
//     index,
//     hasError = false,
//   }) => {
//     if (hasError || !src) {
//       return (
//         <div className="flex flex-col items-center justify-center h-full bg-slate-100/40 backdrop-blur-sm rounded-lg">
//           <div className="text-6xl text-gray-400 mb-2">📷</div>
//           <p className="text-gray-500 text-sm">Imagen no disponible</p>
//         </div>
//       );
//     }

//     return (
//       <Image
//         src={src}
//         alt={alt}
//         fill={fill}
//         sizes={sizes}
//         className={className}
//         priority={priority}
//         onError={() => onError && onError(index, src)}
//         quality={85}
//         loading={priority ? "eager" : "lazy"}
//         placeholder="blur"
//         blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
//         unoptimized={src.includes("firebasestorage.googleapis.com")}
//       />
//     );
//   },
// );

// OptimizedImage.displayName = "OptimizedImage";

// // Componente principal optimizado
// const AccesoriosContainer = ({
//   apiUrl,
//   accesorio: accesorioProps,
//   otrosAccesorios: otrosAccesoriosProps = [],
//   telefono: telefonoProps = "+573174503604",
// }) => {
//   // Referencias y hooks personalizados
//   const containerRef = useRef(null);
//   const isMobile = useMobileDetection();
//   const { imageError, handleImageError, resetImageErrors } = useImageHandler();

//   // Estados principales
//   const [todosAccesorios, setTodosAccesorios] = useState([]);
//   const [accesorio, setAccesorio] = useState(null);
//   const [otrosAccesorios, setOtrosAccesorios] = useState([]);
//   const [telefono, setTelefono] = useState(telefonoProps);
//   const [mainSlideIndex, setMainSlideIndex] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [dataLoaded, setDataLoaded] = useState(false);

//   // Función optimizada para cambiar accesorio
//   const cambiarAccesorio = useCallback(
//     (nuevoAccesorio) => {
//       if (!nuevoAccesorio) {
//         console.error("Error: Intento de cambiar a un accesorio nulo");
//         return;
//       }

//       // Resetear estados
//       setMainSlideIndex(0);
//       resetImageErrors();
//       setAccesorio(nuevoAccesorio);

//       // Actualizar otros accesorios excluyendo el actual
//       const nuevosOtros = todosAccesorios.filter(
//         (item) =>
//           item.id !== nuevoAccesorio.id ||
//           item.nombre !== nuevoAccesorio.nombre,
//       );
//       setOtrosAccesorios(nuevosOtros);

//       // Scroll suave optimizado
//       if (containerRef.current) {
//         const rect = containerRef.current.getBoundingClientRect();
//         const scrollTop =
//           window.pageYOffset || document.documentElement.scrollTop;

//         window.scrollTo({
//           top: scrollTop + rect.top - 100,
//           behavior: "smooth",
//         });
//       }
//     },
//     [todosAccesorios, resetImageErrors],
//   );

//   // Efecto para carga de datos
//   useEffect(() => {
//     if (dataLoaded) return;

//     // Caso 1: Props directos
//     if (accesorioProps) {
//       const todos = [accesorioProps, ...otrosAccesoriosProps];
//       setTodosAccesorios(todos);
//       setAccesorio(accesorioProps);
//       setOtrosAccesorios(otrosAccesoriosProps);
//       setLoading(false);
//       setDataLoaded(true);
//       return;
//     }

//     // Caso 2: Carga desde API
//     if (!apiUrl) {
//       setLoading(false);
//       setDataLoaded(true);
//       return;
//     }

//     const cargarDatos = async () => {
//       try {
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 10000);

//         const response = await fetch(apiUrl, {
//           signal: controller.signal,
//           headers: {
//             "Cache-Control": "no-cache",
//           },
//         });

//         clearTimeout(timeoutId);

//         if (!response.ok) {
//           throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//         }

//         const data = await response.json();

//         let accesoriosData = [];
//         let accesorioInicial = null;
//         let otrosAccesoriosData = [];
//         let telefonoConfig = telefono;

//         // Procesamiento de datos
//         if (Array.isArray(data)) {
//           accesoriosData = [...data];
//           if (data.length > 0) {
//             accesorioInicial = data[0];
//             otrosAccesoriosData = data.slice(1);
//           }
//         } else if (data.accesorios?.length) {
//           accesoriosData = [...data.accesorios];
//           accesorioInicial = data.accesorios[0];
//           otrosAccesoriosData = data.accesorios.slice(1);

//           if (data.configuracion?.telefono) {
//             telefonoConfig = data.configuracion.telefono;
//           }
//         }

//         // Actualizar estados
//         setTodosAccesorios(accesoriosData);
//         setAccesorio(accesorioInicial);
//         setOtrosAccesorios(otrosAccesoriosData);
//         setTelefono(telefonoConfig);
//       } catch (error) {
//         console.error("Error cargando datos:", error);
//         // Aquí podrías agregar un estado de error para mostrar al usuario
//       } finally {
//         setLoading(false);
//         setDataLoaded(true);
//       }
//     };

//     cargarDatos();
//   }, [apiUrl, accesorioProps, otrosAccesoriosProps, telefono, dataLoaded]);

//   // Handlers del carrusel optimizados
//   const navegarSlide = useCallback(
//     (direccion) => {
//       if (!accesorio?.imagenes?.length || accesorio.imagenes.length <= 1)
//         return;

//       setMainSlideIndex((prevIndex) => {
//         if (direccion === "next") {
//           return prevIndex === accesorio.imagenes.length - 1
//             ? 0
//             : prevIndex + 1;
//         } else {
//           return prevIndex === 0
//             ? accesorio.imagenes.length - 1
//             : prevIndex - 1;
//         }
//       });
//     },
//     [accesorio?.imagenes?.length],
//   );

//   const nextMainSlide = useCallback(
//     (e) => {
//       e.preventDefault();
//       navegarSlide("next");
//     },
//     [navegarSlide],
//   );

//   const prevMainSlide = useCallback(
//     (e) => {
//       e.preventDefault();
//       navegarSlide("prev");
//     },
//     [navegarSlide],
//   );

//   // Memoización de valores computados
//   const { whatsappUrl, tieneImagenes, imagenPrincipal } = useMemo(() => {
//     if (!accesorio)
//       return { whatsappUrl: "", tieneImagenes: false, imagenPrincipal: null };

//     const mensajeBase = `Hola, estoy interesado en el accesorio: ${accesorio.nombre || ""}`;
//     const urlActual = typeof window !== "undefined" ? window.location.href : "";
//     const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeBase)}%0A%0A${encodeURIComponent("Puedes verlo aquí: ")}${encodeURIComponent(urlActual)}`;

//     const tieneImagenes = accesorio.imagenes?.length > 0;
//     let imagenPrincipal = accesorio.imagenPrincipal || null;

//     if (!imagenPrincipal && tieneImagenes) {
//       const primeraImagen = accesorio.imagenes[0];
//       imagenPrincipal =
//         typeof primeraImagen === "object" && primeraImagen.url
//           ? primeraImagen.url
//           : primeraImagen;
//     }

//     return { whatsappUrl, tieneImagenes, imagenPrincipal };
//   }, [accesorio, telefono]);

//   // Loading state
//   if (loading) {
//     return (
//       <div className="max-w-6xl mx-auto p-4 mt-8 bg-white/30 backdrop-blur-md rounded-lg shadow-lg">
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//           <span className="ml-3 text-lg">Cargando accesorios...</span>
//         </div>
//       </div>
//     );
//   }

//   // Empty state
//   if (!accesorio) {
//     return (
//       <div className="max-w-6xl mx-auto p-4 bg-white/30 backdrop-blur-md rounded-lg shadow-lg">
//         <div className="text-center py-12">
//           <div className="text-6xl mb-4">🔍</div>
//           <h1 className="text-xl font-bold">No se encontraron accesorios</h1>
//           <p className="text-gray-600 mt-2">
//             Intenta recargar la página o verifica la conexión.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={containerRef}
//       id="accesorios-container"
//       className={`${styles.container} max-w-6xl mx-auto p-4 bg-white/30 backdrop-blur-md rounded-lg shadow-lg`}
//     >
//       {/* Título */}
//       <header className="text-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//           {accesorio.nombre}
//         </h1>
//         {/* {accesorio.categoria && (
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//             {accesorio.categoria}
//           </p>
//         )} */}
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//         {/* Carrusel principal */}
//         <section
//           className={`${styles.mainImageContainer} relative h-60 md:h-80`}
//           aria-label="Galería de imágenes del producto"
//         >
//           <div className="h-full w-full relative overflow-hidden rounded-lg bg-white/10">
//             {tieneImagenes ? (
//               accesorio.imagenes.map((imagen, index) => {
//                 const imagenUrl =
//                   typeof imagen === "object" && imagen.url
//                     ? imagen.url
//                     : imagen;

//                 return (
//                   <div
//                     key={`slide-${index}`}
//                     className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
//                       index === mainSlideIndex ? "opacity-100" : "opacity-0"
//                     }`}
//                     role="img"
//                     aria-label={`Imagen ${index + 1} de ${accesorio.imagenes.length} de ${accesorio.nombre}`}
//                   >
//                     <OptimizedImage
//                       src={imagenUrl}
//                       alt={`${accesorio.nombre} - Vista ${index + 1}`}
//                       sizes="(max-width: 768px) 100vw, 50vw"
//                       className="rounded-lg object-contain"
//                       priority={index === mainSlideIndex}
//                       onError={handleImageError}
//                       index={`main-${index}`}
//                       hasError={imageError[`main-${index}`]}
//                     />
//                   </div>
//                 );
//               })
//             ) : imagenPrincipal ? (
//               <div className="absolute inset-0">
//                 <OptimizedImage
//                   src={imagenPrincipal}
//                   alt={accesorio.nombre}
//                   sizes="(max-width: 768px) 100vw, 50vw"
//                   className="rounded-lg object-contain"
//                   priority
//                   onError={handleImageError}
//                   index="principal"
//                   hasError={imageError["principal"]}
//                 />
//               </div>
//             ) : (
//               <div className="flex items-center justify-center h-full">
//                 <div className="text-center">
//                   <div className="text-6xl text-gray-400 mb-2">📷</div>
//                   <p className="text-gray-500">No hay imágenes disponibles</p>
//                 </div>
//               </div>
//             )}

//             {/* Controles del carrusel */}
//             {tieneImagenes && accesorio.imagenes.length > 1 && (
//               <>
//                 <button
//                   onClick={prevMainSlide}
//                   className={`${styles.navButton} absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full shadow-lg transition-all backdrop-blur-sm`}
//                   aria-label="Ver imagen anterior"
//                   type="button"
//                 >
//                   <ChevronLeft size={24} />
//                 </button>

//                 <button
//                   onClick={nextMainSlide}
//                   className={`${styles.navButton} absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full shadow-lg transition-all backdrop-blur-sm`}
//                   aria-label="Ver imagen siguiente"
//                   type="button"
//                 >
//                   <ChevronRight size={24} />
//                 </button>

//                 {/* Indicadores */}
//                 <div
//                   className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full"
//                   role="tablist"
//                   aria-label="Indicadores de imagen"
//                 >
//                   {accesorio.imagenes.map((_, index) => (
//                     <button
//                       key={`indicator-${index}`}
//                       onClick={(e) => {
//                         e.preventDefault();
//                         setMainSlideIndex(index);
//                       }}
//                       className={`w-2 h-2 rounded-full transition-all ${
//                         index === mainSlideIndex
//                           ? "bg-white scale-125"
//                           : "bg-white/50 hover:bg-white/75"
//                       }`}
//                       role="tab"
//                       aria-selected={index === mainSlideIndex}
//                       aria-label={`Ver imagen ${index + 1}`}
//                       type="button"
//                     />
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>
//         </section>

//         {/* Información del producto */}
//         <section className="flex flex-col justify-between">
//           <div className="space-y-4">
//             <div>
//               <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
//                 Descripción
//               </h2>
//               <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
//                 {accesorio.descripcion || "Sin descripción disponible"}
//               </p>
//             </div>

//             {/* Características */}
//             {accesorio.caracteristicas?.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
//                   Características
//                 </h3>
//                 <ul className="list-disc pl-5 space-y-1">
//                   {accesorio.caracteristicas.map((caracteristica, index) => (
//                     <li
//                       key={index}
//                       className="text-gray-700 dark:text-gray-300"
//                     >
//                       {caracteristica}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Precio */}
//             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
//               <div className="flex items-center space-x-3">
//                 <span className="text-2xl font-bold text-green-600 dark:text-green-400">
//                   $
//                   {typeof accesorio.precio === "number"
//                     ? accesorio.precio.toLocaleString("es-CO")
//                     : accesorio.precio}
//                 </span>
//                 {accesorio.precioAnterior && (
//                   <span className="text-gray-500 line-through">
//                     $
//                     {typeof accesorio.precioAnterior === "number"
//                       ? accesorio.precioAnterior.toLocaleString("es-CO")
//                       : accesorio.precioAnterior}
//                   </span>
//                 )}
//               </div>
//               {accesorio.precioAnterior && (
//                 <p className="text-sm text-green-600 dark:text-green-400 mt-1">
//                   ¡Precio especial!
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Botón de WhatsApp */}
//           <Link
//             href={whatsappUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className={`${styles.boton} mt-6 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg flex items-center justify-center transition-all transform hover:scale-105 shadow-lg`}
//             aria-label="Contactar por WhatsApp para consultar sobre este producto"
//           >
//             <MessageCircle className="mr-2" size={20} />
//             Consultar por WhatsApp
//           </Link>
//         </section>
//       </div>

//       {/* Productos relacionados */}
//       {otrosAccesorios?.length > 0 && (
//         <section className="mt-12" aria-labelledby="related-products-heading">
//           <h2
//             id="related-products-heading"
//             className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white"
//           >
//             Otros accesorios que te pueden interesar
//           </h2>

//           <div
//             className={`${styles.otrosAccesoriosGrid} grid gap-4 ${
//               isMobile ? "grid-cols-2" : "grid-cols-3 md:grid-cols-4"
//             }`}
//           >
//             {otrosAccesorios.map((item, itemIndex) => {
//               const itemImageUrl =
//                 item.imagenPrincipal ||
//                 (item.imagenes?.length > 0
//                   ? typeof item.imagenes[0] === "object" && item.imagenes[0].url
//                     ? item.imagenes[0].url
//                     : item.imagenes[0]
//                   : null);

//               return (
//                 <article
//                   key={`related-${itemIndex}`}
//                   className={`${styles.relatedItemCard} bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-lg p-3 hover:shadow-lg transition-all hover:scale-105`}
//                 >
//                   <div className="relative h-32 mb-2 overflow-hidden rounded bg-white/10">
//                     <OptimizedImage
//                       src={itemImageUrl}
//                       alt={`${item.nombre} - Producto relacionado`}
//                       sizes="(max-width: 640px) 50vw, 25vw"
//                       className="object-contain"
//                       onError={handleImageError}
//                       index={`related-${itemIndex}`}
//                       hasError={imageError[`related-${itemIndex}`]}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <h3 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-white">
//                       {item.nombre || "Producto sin nombre"}
//                     </h3>

//                     <p className="font-bold text-green-600 dark:text-green-400">
//                       $
//                       {typeof item.precio === "number"
//                         ? item.precio.toLocaleString("es-CO")
//                         : item.precio}
//                     </p>

//                     <button
//                       onClick={(e) => {
//                         e.preventDefault();
//                         cambiarAccesorio(item);
//                       }}
//                       className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded flex items-center justify-center transition-colors text-sm font-medium"
//                       aria-label={`Ver detalles de ${item.nombre || "este producto"}`}
//                       type="button"
//                     >
//                       <Eye size={14} className="mr-1" />
//                       Ver detalles
//                     </button>
//                   </div>
//                 </article>
//               );
//             })}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// };

// export default AccesoriosContainer;
