"use client";

// components/AccesoriosContainer.jsx
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle, Eye } from "lucide-react";

// Componente principal simplificado
const AccesoriosContainer = ({
  apiUrl,
  accesorio: accesorioProps,
  otrosAccesorios: otrosAccesoriosProps = [],
  telefono: telefonoProps = "+573174503604", // Teléfono por defecto para WhatsApp
}) => {
  const [todosAccesorios, setTodosAccesorios] = useState([]);
  const [accesorio, setAccesorio] = useState(null);
  const [otrosAccesorios, setOtrosAccesorios] = useState([]);
  const [telefono, setTelefono] = useState(telefonoProps);
  const [mainSlideIndex, setMainSlideIndex] = useState(0);
  const [relatedSlideIndex, setRelatedSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // Bandera para evitar cargas múltiples

  // Función para cambiar el accesorio activo (definida fuera del useEffect)
  const cambiarAccesorio = useCallback(
    (nuevoAccesorio) => {
      console.log("Cambiando a accesorio:", nuevoAccesorio);

      if (!nuevoAccesorio) {
        console.error(
          "Error: Intento de cambiar a un accesorio nulo o indefinido",
        );
        return;
      }

      // Resetear el índice del slide principal
      setMainSlideIndex(0);

      // Establecer el nuevo accesorio principal
      setAccesorio(nuevoAccesorio);

      // Actualizar otros accesorios (todos excepto el seleccionado)
      const nuevosOtros = todosAccesorios.filter((a) => {
        // Si ambos tienen ID, comparar por ID
        if (a.id !== undefined && nuevoAccesorio.id !== undefined) {
          return a.id !== nuevoAccesorio.id;
        }
        // Comparación más segura si no hay ID - comparar por nombre
        if (a.nombre && nuevoAccesorio.nombre) {
          return a.nombre !== nuevoAccesorio.nombre;
        }
        // Último recurso - comparar objetos completos
        return a !== nuevoAccesorio;
      });

      console.log("Nuevos otros accesorios:", nuevosOtros);
      setOtrosAccesorios(nuevosOtros);
    },
    [todosAccesorios],
  );

  // Cargar datos solo si no se han proporcionado directamente y hay una apiUrl
  useEffect(() => {
    // Evitar cargar múltiples veces
    if (dataLoaded) return;

    // Caso 1: Tenemos datos como props
    if (accesorioProps) {
      console.log("Usando datos de props");
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
      console.log("No hay URL de API, terminando carga");
      setLoading(false);
      setDataLoaded(true);
      return;
    }

    const cargarDatos = async () => {
      console.log("Iniciando carga desde API:", apiUrl);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Error al cargar datos: ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos cargados:", data);

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

        console.log("Accesorio principal establecido:", accesorioInicial);
        console.log("Otros accesorios establecidos:", otrosAccesoriosData);
        console.log("Todos los accesorios guardados:", accesoriosData);
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
  const nextMainSlide = () => {
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
  const prevMainSlide = () => {
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
  const nextRelatedSlide = () => {
    if (!otrosAccesorios || otrosAccesorios.length <= 4) return;

    const totalSlides = Math.ceil(otrosAccesorios.length / 4);
    setRelatedSlideIndex((prevIndex) =>
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1,
    );
  };

  // Función para retroceder en el carrusel de productos relacionados
  const prevRelatedSlide = () => {
    if (!otrosAccesorios || otrosAccesorios.length <= 4) return;

    const totalSlides = Math.ceil(otrosAccesorios.length / 4);
    setRelatedSlideIndex((prevIndex) =>
      prevIndex === 0 ? totalSlides - 1 : prevIndex + 1,
    );
  };

  // Si está cargando, mostrar un spinner
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-lg flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay accesorio, mostrar un mensaje
  if (!accesorio) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h1 className="text-xl font-bold text-center">
          No se encontraron accesorios
        </h1>
      </div>
    );
  }

  // URL para WhatsApp con mensaje predefinido
  const whatsappUrl = `https://wa.me/${telefono}?text=Hola, estoy interesado en el accesorio: ${accesorio.nombre || ""}`;

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
    <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      {/* Título del accesorio */}
      <h1 className="text-3xl font-bold text-center mb-6">
        {accesorio.nombre}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Carrusel principal */}
        <div className="relative h-96">
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
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === mainSlideIndex ? "opacity-100" : "opacity-0"}`}
                  >
                    <Image
                      src={imagenUrl}
                      alt={`${accesorio.nombre} - Imagen ${index + 1}`}
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg"
                    />
                  </div>
                );
              })
            ) : imagenPrincipal ? (
              <div className="absolute inset-0">
                <Image
                  src={imagenPrincipal}
                  alt={accesorio.nombre}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                <p className="text-gray-500">No hay imágenes disponibles</p>
              </div>
            )}

            {/* Controles del carrusel principal - solo si hay múltiples imágenes */}
            {tieneImagenes && accesorio.imagenes.length > 1 && (
              <>
                <button
                  onClick={prevMainSlide}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full shadow-md hover:bg-opacity-75 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextMainSlide}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full shadow-md hover:bg-opacity-75 transition-all"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Indicadores de posición */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {accesorio.imagenes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setMainSlideIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === mainSlideIndex ? "bg-primary" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Descripción y detalles */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-3">Descripción</h2>
            <p className="text-gray-600 mb-4">
              {accesorio.descripcion || "Sin descripción disponible"}
            </p>

            {/* Características */}
            {accesorio.caracteristicas &&
              accesorio.caracteristicas.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Características</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {accesorio.caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="text-gray-600">
                        {caracteristica}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Precio */}
            <div className="mt-4">
              <span className="text-2xl font-bold text-primary">
                $
                {typeof accesorio.precio === "number"
                  ? accesorio.precio.toLocaleString("es-CO")
                  : accesorio.precio}
              </span>
              {accesorio.precioAnterior && (
                <span className="ml-2 text-gray-400 line-through">
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
            className="mt-6 bg-green-500 text-black py-3 px-6 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="mr-2 text-black" />
            Consultar por WhatsApp
          </Link>
        </div>
      </div>

      {/* Carrusel de productos relacionados - solo si hay más de 0 */}
      {otrosAccesorios && otrosAccesorios.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Otros accesorios
          </h2>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${relatedSlideIndex * 100}%)`,
                }}
              >
                {/* Agrupamos los accesorios en conjuntos de 4 */}
                {Array.from({
                  length: Math.ceil(otrosAccesorios.length / 4),
                }).map((_, slideIndex) => (
                  <div
                    key={slideIndex}
                    className="min-w-full grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {otrosAccesorios
                      .slice(slideIndex * 4, slideIndex * 4 + 4)
                      .map((item, itemIndex) => {
                        // Obtener URL de imagen de manera segura
                        const itemImageUrl =
                          item.imagenPrincipal ||
                          (item.imagenes && item.imagenes.length > 0
                            ? typeof item.imagenes[0] === "object" &&
                              item.imagenes[0].url
                              ? item.imagenes[0].url
                              : item.imagenes[0]
                            : "/placeholder-accesorio.jpg");

                        return (
                          <div
                            key={itemIndex}
                            className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow"
                          >
                            <div className="relative h-40 mb-2 overflow-hidden rounded">
                              <Image
                                src={itemImageUrl}
                                alt={item.nombre || ""}
                                // width={100}
                                // height={100}
                                layout="fill"
                                objectFit="cover"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="font-medium text-sm truncate">
                              {item.nombre || ""}
                            </h3>
                            <p className="text-primary font-bold mt-1">
                              $
                              {typeof item.precio === "number"
                                ? item.precio.toLocaleString("es-CO")
                                : item.precio}
                            </p>

                            {/* Botón Ver */}
                            <button
                              onClick={() => {
                                console.log("Clic en Ver para:", item);
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
                ))}
              </div>
            </div>

            {/* Controles del carrusel de relacionados - solo si hay más de 4 */}
            {otrosAccesorios.length > 4 && (
              <>
                <button
                  onClick={prevRelatedSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextRelatedSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Información de depuración - Eliminar en producción */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
          <details>
            <summary className="cursor-pointer font-semibold">
              Información de depuración
            </summary>
            <div className="mt-2">
              <p>Total accesorios: {todosAccesorios.length}</p>
              <p>Accesorio actual ID: {accesorio?.id}</p>
              <p>Accesorio actual nombre: {accesorio?.nombre}</p>
              <p>Otros accesorios: {otrosAccesorios.length}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default AccesoriosContainer;
