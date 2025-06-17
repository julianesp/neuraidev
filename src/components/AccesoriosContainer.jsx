"use client";

// components/AccesoriosContainer.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle, Eye } from "lucide-react";
// import styles from "./AccesoriosContainer.module.scss";
import styles from "../styles/components/AccesoriosDestacados.module.scss";

const AccesoriosContainer = ({
  apiUrl,
  accesorio: accesorioProps,
  otrosAccesorios: otrosAccesoriosProps = [],
  telefono: telefonoProps = "+573174503604",
  onCambiarAccesorio, // Nueva prop para manejar cambio de accesorio
}) => {
  // Referencia para el scrolling
  const containerRef = useRef(null);

  const [todosAccesorios, setTodosAccesorios] = useState([]);
  const [accesorio, setAccesorio] = useState(accesorioProps);
  const [otrosAccesorios, setOtrosAccesorios] = useState(otrosAccesoriosProps);
  const [telefono, setTelefono] = useState(telefonoProps);
  const [mainSlideIndex, setMainSlideIndex] = useState(0);
  const [loading, setLoading] = useState(!accesorioProps); // Solo loading si no hay props
  const [dataLoaded, setDataLoaded] = useState(!!accesorioProps);
  const [isMobile, setIsMobile] = useState(false);
  const [imageError, setImageError] = useState({});
  const [imageRetries, setImageRetries] = useState({});

  // Efecto para actualizar datos cuando cambian las props
  useEffect(() => {
    if (accesorioProps) {
      setAccesorio(accesorioProps);
      setOtrosAccesorios(otrosAccesoriosProps);
      setMainSlideIndex(0); // Resetear índice de imagen
      setImageError({}); // Resetear errores de imagen
      setLoading(false);
      setDataLoaded(true);
    }
  }, [accesorioProps, otrosAccesoriosProps]);

  // Efecto para detectar si estamos en móvil
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  // Función para cambiar accesorio - ahora usa la prop onCambiarAccesorio
  const cambiarAccesorio = useCallback(
    async (nuevoAccesorio) => {
      if (!nuevoAccesorio) {
        console.error(
          "Error: Intento de cambiar a un accesorio nulo o indefinido",
        );
        return;
      }

      // Si tenemos la función onCambiarAccesorio (modo ruta dinámica), la usamos
      if (onCambiarAccesorio) {
        await onCambiarAccesorio(nuevoAccesorio);
        return;
      }

      // Modo legacy (sin rutas dinámicas)
      setMainSlideIndex(0);
      setImageError({});
      setAccesorio(nuevoAccesorio);

      // Actualizar otros accesorios excluyendo el actual
      if (todosAccesorios.length > 0) {
        const nuevosOtros = todosAccesorios.filter(
          (item) =>
            (item.id && nuevoAccesorio.id && item.id !== nuevoAccesorio.id) ||
            (item.nombre &&
              nuevoAccesorio.nombre &&
              item.nombre !== nuevoAccesorio.nombre),
        );
        setOtrosAccesorios(nuevosOtros);
      }

      // Hacer scroll con offset
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.top - 100,
          behavior: "smooth",
        });
      }
    },
    [onCambiarAccesorio, todosAccesorios],
  );

  // Cargar datos solo si no se han proporcionado directamente y hay una apiUrl
  useEffect(() => {
    if (dataLoaded || accesorioProps) return;

    if (!apiUrl) {
      setLoading(false);
      setDataLoaded(true);
      return;
    }

    const cargarDatos = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(apiUrl, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Error al cargar datos: ${response.status}`);
        }

        const data = await response.json();

        let accesoriosData = [];
        let accesorioInicial = null;
        let otrosAccesoriosData = [];
        let telefonoConfig = telefono;

        if (Array.isArray(data)) {
          accesoriosData = [...data];
          if (data.length > 0) {
            accesorioInicial = data[0];
            otrosAccesoriosData = data.slice(1);
          }
        } else if (data.accesorios && Array.isArray(data.accesorios)) {
          accesoriosData = [...data.accesorios];
          if (data.accesorios.length > 0) {
            accesorioInicial = data.accesorios[0];
            otrosAccesoriosData = data.accesorios.slice(1);
          }

          if (data.configuracion && data.configuracion.telefono) {
            telefonoConfig = data.configuracion.telefono;
          }
        }

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
  }, [apiUrl, accesorioProps, telefono, dataLoaded]);

  // Función para avanzar en el carrusel principal
  const nextMainSlide = (e) => {
    e.preventDefault();

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
    e.preventDefault();

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

  // Manejar errores de carga de imágenes con sistema de reintento
  const handleImageError = (index, imageSrc) => {
    console.warn(`Error cargando imagen: ${imageSrc}`);

    const currentRetries = imageRetries[index] || 0;

    if (currentRetries < 2) {
      setImageRetries((prev) => ({
        ...prev,
        [index]: currentRetries + 1,
      }));

      const timeStamp = new Date().getTime();
      const retrySrc = imageSrc.includes("?")
        ? `${imageSrc}&retry=${timeStamp}`
        : `${imageSrc}?retry=${timeStamp}`;

      setTimeout(() => {
        const img = new Image();
        img.src = retrySrc;
      }, 1000);
    } else {
      setImageError((prev) => ({
        ...prev,
        [index]: true,
      }));
    }
  };

  // Si está cargando, mostrar un spinner
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 mt-8 bg-white/30 backdrop-blur-md rounded-lg shadow-lg flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3">Cargando accesorio...</span>
      </div>
    );
  }

  // Si no hay accesorio, mostrar un mensaje
  if (!accesorio) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-white/30 backdrop-blur-md rounded-lg shadow-lg">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-xl font-bold">No se encontraron accesorios</h1>
        </div>
      </div>
    );
  }

  // URL para WhatsApp con mensaje predefinido
  const obtenerUrlActual = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const mensajeBase = `Hola, estoy interesado en el accesorio: ${accesorio.nombre || ""}`;
  const urlActual = obtenerUrlActual();
  const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeBase)}%0A%0A${encodeURIComponent("Puedes verlo aquí: ")}${encodeURIComponent(urlActual)}`;

  // Determinar si hay imágenes para mostrar
  const tieneImagenes =
    accesorio.imagenes &&
    Array.isArray(accesorio.imagenes) &&
    accesorio.imagenes.length > 0;

  // Obtener la imagen principal
  let imagenPrincipal = accesorio.imagenPrincipal || null;

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
    >
      {/* Título del accesorio */}
      <h1 className="text-3xl font-bold text-center mb-6">
        {accesorio.nombre}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Carrusel principal */}
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

            {/* Controles del carrusel principal */}
            {tieneImagenes && accesorio.imagenes.length > 1 && (
              <>
                <button
                  onClick={prevMainSlide}
                  className={`${styles.navButton} bg-black text-white dark:bg-white absolute left-2 top-1/2 transform -translate-y-1/2 border-solid border-white p-2 rounded-full shadow-md transition-all dark:text-black dark:border-white dark:border-solid`}
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
          <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.boton} mt-6 bg-green-500 text-black dark:text-white py-3 px-6 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors`}
          >
            <MessageCircle className="mr-2 text-black dark:text-white" />
            Consultar por WhatsApp
          </Link>
        </div>
      </div>

      {/* Otros accesorios */}
      {otrosAccesorios && otrosAccesorios.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Otros accesorios
          </h2>

          <div className="relative">
            <div className={styles.otrosAccesoriosGrid}>
              {otrosAccesorios.map((item, itemIndex) => {
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
                    className={`${styles.relatedItemCard} ${styles.otrosAccesoriosItem} bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-lg p-3 hover:shadow-md transition-shadow`}
                  >
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
                          priority={false}
                          loading="lazy"
                          quality={85}
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
                      className="mt-3 bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center w-full hover:bg-blue-700 transition-colors text-sm"
                      aria-label={`Ver detalles de ${item.nombre || "accesorio"}`}
                    >
                      <Eye size={16} className="mr-1" />
                      Ver
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccesoriosContainer;
