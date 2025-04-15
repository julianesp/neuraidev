// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import { obtenerAccesoriosDestacados } from "../accesoriosService";
// import Image from "next/image";
// import style from "@/styles/AccesoriosDestacados.module.scss";
// import Link from "next/link";

// /**
//  * Componente para mostrar accesorios destacados
//  * Versión con scroll horizontal para móviles
//  */
// const AccesoriosDestacados = () => {
//   // Estado para almacenar los accesorios destacados
//   const [destacados, setDestacados] = useState([]);

//   // Estado para controlar la carga
//   const [cargando, setCargando] = useState(true);

//   // Estado para manejar posibles errores
//   const [error, setError] = useState(null);

//   // Estado para controlar el índice del accesorio actual en vista móvil
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Referencia al contenedor de scroll
//   const scrollContainerRef = useRef(null);

//   // Efecto para cargar los accesorios destacados al montar el componente
//   useEffect(() => {
//     const cargarAccesorios = async () => {
//       try {
//         setCargando(true);
//         const accesoriosData = await obtenerAccesoriosDestacados();
//         setDestacados(accesoriosData);
//         setError(null);
//       } catch (err) {
//         console.error("Error al cargar accesorios destacados:", err);
//         setError("No se pudieron cargar los accesorios");
//       } finally {
//         setCargando(false);
//       }
//     };

//     cargarAccesorios();
//   }, []);

//   // Función para manejar el desplazamiento a la izquierda
//   const scrollLeft = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//       scrollToItem(currentIndex - 1);
//     }
//   };

//   // Función para manejar el desplazamiento a la derecha
//   const scrollRight = () => {
//     if (currentIndex < destacados.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//       scrollToItem(currentIndex + 1);
//     }
//   };

//   // Función para desplazarse a un elemento específico
//   const scrollToItem = (index) => {
//     if (scrollContainerRef.current) {
//       const itemWidth =
//         scrollContainerRef.current.children[0]?.offsetWidth || 0;
//       scrollContainerRef.current.scrollTo({
//         left: itemWidth * index,
//         behavior: "smooth",
//       });
//     }
//   };

//   // Renderizar mensaje de carga
//   if (cargando) {
//     return (
//       <div className="bg-yellow-50 p-1 rounded-lg text-center">
//         <h2 className="text-2xl font-bold mb-6">Accesorios Destacados</h2>
//         <div className="animate-pulse flex justify-center items-center h-48">
//           <p className="text-gray-500">Cargando accesorios...</p>
//         </div>
//       </div>
//     );
//   }

//   // Renderizar mensaje de error
//   if (error) {
//     return (
//       <div className="bg-yellow-50 p-6 rounded-lg">
//         <h2 className="text-2xl font-bold mb-6">Accesorios Destacados</h2>
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           <p>{error}</p>
//         </div>
//       </div>
//     );
//   }

//   // Si no hay accesorios destacados
//   if (destacados.length === 0) {
//     return (
//       <div className="bg-yellow-50 p-6 rounded-lg">
//         <h2 className="text-2xl font-bold mb-6">Accesorios Destacados</h2>
//         <p className="text-gray-600 text-center">
//           No hay accesorios destacados disponibles
//         </p>
//       </div>
//     );
//   }

//   // Renderizar el componente con los accesorios cargados
//   return (
//     <div className={`${style.container} bg-yellow-50 p-6 rounded-lg`}>
//       <h2 className="text-2xl font-bold mb-6">Accesorios destacados</h2>

//       {/* Navegación para móviles */}
//       <div
//         className={`flex justify-between items-center mb-1 ${style.accesories}`}
//       >
//         <button
//           onClick={scrollLeft}
//           disabled={currentIndex === 0}
//           className={`bg-yellow-500 text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
//           aria-label="Anterior accesorio"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-6 w-6"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//         </button>

//         <span className="text-sm text-gray-600">
//           {currentIndex + 1} / {destacados.length}
//         </span>

//         <button
//           onClick={scrollRight}
//           disabled={currentIndex === destacados.length - 1}
//           className={`bg-yellow-500 text-justify flex justify-center items-center text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${currentIndex === destacados.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
//           aria-label="Siguiente accesorio"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-6 w-6"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M9 5l7 7-7 7"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Contenedor con scroll horizontal */}
//       <div
//         ref={scrollContainerRef}
//         className="flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
//         style={{
//           scrollbarWidth: "none",
//           msOverflowStyle: "none",
//           WebkitOverflowScrolling: "touch",
//         }}
//       >
//         {destacados.map((accesorio, index) => (
//           <Link
//             key={accesorio.id}
//             href={`/accesorios/${accesorio.id}`}
//             className="accesorio-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0 snap-start mx-2 flex flex-col items-center"
//             style={{
//               minWidth: "calc(100% - 1rem)",
//               width: "calc(100% - 1rem)",
//               opacity: currentIndex === index ? 1 : 0.7,
//               transform: `scale(${currentIndex === index ? 1 : 0.95})`,
//             }}
//             onClick={(e) => {
//               // Prevenir navegación para permitir el manejo de scroll primero
//               e.preventDefault();
//               setCurrentIndex(index);
//               scrollToItem(index);

//               // Navegar después de un breve delay para permitir la animación
//               setTimeout(() => {
//                 window.location.href = `/accesorios/${accesorio.id}`;
//               }, 300);
//             }}
//           >
//             <div className="relative h-48 w-56">
//               <Image
//                 src={
//                   accesorio.imagenPrincipal ||
//                   (accesorio.imagenes && accesorio.imagenes.length > 0
//                     ? accesorio.imagenes[0].url
//                     : "/placeholder-accesorio.jpg")
//                 }
//                 alt={accesorio.nombre}
//                 className="object-cover h-full w-full"
//                 width={300}
//                 height={300}
//               />
//             </div>

//             {/* <div className="p-2 w-56">
//               <h3 className="font-semibold text-lg">{accesorio.nombre}</h3>
//               <p className="text-black mt-1 text-sm line-clamp-2">
//                 {accesorio.descripcion}
//               </p>
//               <div className="mt-2 flex items-center">
//                 <span className="font-bold text-lg">
//                   $
//                   {typeof accesorio.precio === "number"
//                     ? accesorio.precio
//                     : accesorio.precio}
//                 </span>
//                 {accesorio.precioAnterior && (
//                   <span className="text-gray-500 line-through ml-2 text-sm">
//                     $
//                     {typeof accesorio.precioAnterior === "number"
//                       ? accesorio.precioAnterior.toFixed(2)
//                       : accesorio.precioAnterior}
//                   </span>
//                 )}
//               </div>
//             </div> */}
//             <div className="p-2 w-56">
//               <h3 className="font-semibold text-lg">{accesorio.nombre}</h3>
//               <p className="text-black mt-1 text-sm line-clamp-2">
//                 {accesorio.descripcion}
//               </p>
//               <div className="mt-2 flex items-center">
//                 <span className="font-bold text-lg">
//                   $
//                   {typeof accesorio.precio === "number"
//                     ? accesorio.precio.toLocaleString("es-CL")
//                     : accesorio.precio}
//                 </span>
//                 {accesorio.precioAnterior && (
//                   <span className="text-gray-500 line-through ml-2 text-sm">
//                     $
//                     {typeof accesorio.precioAnterior === "number"
//                       ? accesorio.precioAnterior.toLocaleString("es-CL")
//                       : accesorio.precioAnterior}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>

//       {/* Indicadores de paginación (puntos) */}
//       <div className="flex justify-center mt-4 space-x-2">
//         {destacados.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => {
//               setCurrentIndex(index);
//               scrollToItem(index);
//             }}
//             className={`h-2 rounded-full transition-all duration-300 focus:outline-none
//               ${currentIndex === index ? "bg-yellow-500 w-4" : "bg-gray-300 w-2"}`}
//             aria-label={`Ir al accesorio ${index + 1}`}
//           ></button>
//         ))}
//       </div>

//       <div className="mt-6 text-center">
//         <p className="text-gray-600 mb-4">
//           Estos son los productos más populares
//         </p>
//         <Link
//           href="/accesorios/destacados"
//           className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
//         >
//           Ver todos los destacados
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default AccesoriosDestacados;

"use client";

import React, { useState, useRef, useEffect } from "react";
import { obtenerAccesoriosDestacados } from "../accesoriosService";
import Image from "next/image";
import style from "@/styles/AccesoriosDestacados.module.scss";
import Link from "next/link";

/**
 * Componente para mostrar accesorios destacados
 * Versión con scroll horizontal para móviles
 */
const AccesoriosDestacados = () => {
  // Estado para almacenar los accesorios destacados
  const [destacados, setDestacados] = useState([]);

  // Estado para controlar la carga
  const [cargando, setCargando] = useState(true);

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
        setCargando(true);
        const accesoriosData = await obtenerAccesoriosDestacados();
        setDestacados(accesoriosData);
        setError(null);
      } catch (err) {
        console.error("Error al cargar accesorios destacados:", err);
        setError("No se pudieron cargar los accesorios");
      } finally {
        setCargando(false);
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

  // Renderizar mensaje de carga
  if (cargando) {
    return (
      <div className="bg-yellow-50 p-1 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-6">Accesorios Destacados</h2>
        <div className="animate-pulse flex justify-center items-center h-48">
          <p className="text-gray-500">Cargando accesorios...</p>
        </div>
      </div>
    );
  }

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
    <div className={`${style.container} bg-yellow-50 p-6 rounded-lg`}>
      <h2 className="text-2xl font-bold mb-6">Accesorios destacados</h2>

      {/* Navegación para móviles */}
      <div
        className={`flex justify-between items-center mb-1 ${style.accesories}`}
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
          <Link
            key={accesorio.id}
            href={`/accesorios/${accesorio.id}`}
            className="accesorio-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0 snap-start mx-2 flex flex-col"
            style={{
              minWidth: "calc(100% - 1rem)",
              width: "calc(100% - 1rem)",
              opacity: currentIndex === index ? 1 : 0.7,
              transform: `scale(${currentIndex === index ? 1 : 0.95})`,
            }}
            onClick={(e) => {
              // Prevenir navegación para permitir el manejo de scroll primero
              e.preventDefault();
              setCurrentIndex(index);
              scrollToItem(index);

              // Navegar después de un breve delay para permitir la animación
              setTimeout(() => {
                window.location.href = `/accesorios/${accesorio.id}`;
              }, 300);
            }}
          >
            {/* Contenedor de imagen con posición relativa y tamaño fijo */}
            <div className="w-full h-48 relative">
              <Image
                src={
                  accesorio.imagenPrincipal ||
                  (accesorio.imagenes && accesorio.imagenes.length > 0
                    ? accesorio.imagenes[0].url
                    : "/placeholder-accesorio.jpg")
                }
                alt={accesorio.nombre}
                fill={true}
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 300px"
                priority
              />
            </div>

            <div className="p-4 w-full">
              <h3 className="font-semibold text-lg">{accesorio.nombre}</h3>
              <p className="text-black mt-1 text-sm line-clamp-2">
                {accesorio.descripcion}
              </p>
              <div className="mt-2 flex items-center">
                <span className="font-bold text-lg">
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
            </div>
          </Link>
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
        <p className="text-gray-600 mb-4">
          Estos son los productos más populares
        </p>
        <Link
          href="/accesorios/destacados"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Ver todos los destacados
        </Link>
      </div>
    </div>
  );
};

export default AccesoriosDestacados;
