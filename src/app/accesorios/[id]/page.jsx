// // "use client";

// // import React, { useState, useRef, useEffect } from "react";
// // // import obtenerAccesoriosDestacados from "/accesoriosDestacados.json";
// // import Image from "next/image";
// // import style from "@/styles/AccesoriosDestacados.module.scss";
// // import Link from "next/link";
// // import { getAllProductos } from "@/utils/productos";

// // const obtenerAccesoriosDestacados = "/accesoriosDestacados.json";

// // /**
// //  * Componente para mostrar accesorios destacados
// //  * Versión con scroll horizontal para móviles
// //  */
// // const AccesoriosDestacados = () => {
// //   // Estado para almacenar los accesorios destacados
// //   const [destacados, setDestacados] = useState([]);

// //   // Estado para controlar la carga
// //   const [cargando, setCargando] = useState(true);

// //   // Estado para manejar posibles errores
// //   const [error, setError] = useState(null);

// //   // Estado para controlar el índice del accesorio actual en vista móvil
// //   const [currentIndex, setCurrentIndex] = useState(0);

// //   // Referencia al contenedor de scroll
// //   const scrollContainerRef = useRef(null);

// //   // Efecto para cargar los accesorios destacados al montar el componente
// //   useEffect(() => {
// //     const cargarAccesorios = async () => {
// //       try {
// //         setCargando(true);
// //         const accesoriosData = await obtenerAccesoriosDestacados();
// //         setDestacados(accesoriosData);
// //         setError(null);
// //       } catch (err) {
// //         console.error("Error al cargar accesorios destacados:", err);
// //         setError("No se pudieron cargar los accesorios");
// //       } finally {
// //         setCargando(false);
// //       }
// //     };

// //     cargarAccesorios();
// //   }, []);

// //   // Función para manejar el desplazamiento a la izquierda
// //   const scrollLeft = () => {
// //     if (currentIndex > 0) {
// //       setCurrentIndex(currentIndex - 1);
// //       scrollToItem(currentIndex - 1);
// //     }
// //   };

// //   // Función para manejar el desplazamiento a la derecha
// //   const scrollRight = () => {
// //     if (currentIndex < destacados.length - 1) {
// //       setCurrentIndex(currentIndex + 1);
// //       scrollToItem(currentIndex + 1);
// //     }
// //   };

// //   // Función para desplazarse a un elemento específico
// //   const scrollToItem = (index) => {
// //     if (scrollContainerRef.current) {
// //       const itemWidth =
// //         scrollContainerRef.current.children[0]?.offsetWidth || 0;
// //       scrollContainerRef.current.scrollTo({
// //         left: itemWidth * index,
// //         behavior: "smooth",
// //       });
// //     }
// //   };

// //   // Renderizar mensaje de carga
// //   if (cargando) {
// //     return (
// //       <div className="bg-yellow-50 p-1 rounded-lg text-center">
// //         <h2 className="text-2xl font-bold mb-6">Accesorios Destacados</h2>
// //         <div className="animate-pulse flex justify-center items-center h-48">
// //           <p className="text-gray-500">Cargando accesorios...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Renderizar mensaje de error
// //   if (error) {
// //     return (
// //       <div className="bg-yellow-50 p-6 rounded-lg">
// //         <h2 className="text-2xl font-bold mb-6">Accesorios Destacados</h2>
// //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
// //           <p>{error}</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Si no hay accesorios destacados
// //   if (destacados.length === 0) {
// //     return (
// //       <div className="bg-yellow-50 p-6 rounded-lg">
// //         <h2 className="text-2xl font-bold mb-6">Accesorios Destacados</h2>
// //         <p className="text-gray-600 text-center">
// //           No hay accesorios destacados disponibles
// //         </p>
// //       </div>
// //     );
// //   }

// //   // Renderizar el componente con los accesorios cargados
// //   return (
// //     <div className={`${style.container} bg-yellow-50 p-6 rounded-lg`}>
// //       <h2 className="text-2xl font-bold mb-6">Accesorios destacados</h2>

// //       {/* Navegación para móviles */}
// //       <div
// //         className={`flex justify-between items-center mb-1 ${style.accesories}`}
// //       >
// //         <button
// //           onClick={scrollLeft}
// //           disabled={currentIndex === 0}
// //           className={`bg-yellow-500 text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
// //           aria-label="Anterior accesorio"
// //         >
// //           <svg
// //             xmlns="http://www.w3.org/2000/svg"
// //             className="h-6 w-6"
// //             fill="none"
// //             viewBox="0 0 24 24"
// //             stroke="currentColor"
// //           >
// //             <path
// //               strokeLinecap="round"
// //               strokeLinejoin="round"
// //               strokeWidth={2}
// //               d="M15 19l-7-7 7-7"
// //             />
// //           </svg>
// //         </button>

// //         <span className="text-sm text-gray-600">
// //           {currentIndex + 1} / {destacados.length}
// //         </span>

// //         <button
// //           onClick={scrollRight}
// //           disabled={currentIndex === destacados.length - 1}
// //           className={`bg-yellow-500 text-justify flex justify-center items-center text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${currentIndex === destacados.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
// //           aria-label="Siguiente accesorio"
// //         >
// //           <svg
// //             xmlns="http://www.w3.org/2000/svg"
// //             className="h-6 w-6"
// //             fill="none"
// //             viewBox="0 0 24 24"
// //             stroke="currentColor"
// //           >
// //             <path
// //               strokeLinecap="round"
// //               strokeLinejoin="round"
// //               strokeWidth={2}
// //               d="M9 5l7 7-7 7"
// //             />
// //           </svg>
// //         </button>
// //       </div>

// //       {/* Contenedor con scroll horizontal */}
// //       <div
// //         ref={scrollContainerRef}
// //         className="flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
// //         style={{
// //           scrollbarWidth: "none",
// //           msOverflowStyle: "none",
// //           WebkitOverflowScrolling: "touch",
// //         }}
// //       >
// //         {destacados.map((accesorio, index) => (
// //           <Link
// //             key={accesorio.id}
// //             href={`/accesorios/${accesorio.id}`}
// //             className="accesorio-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0 snap-start mx-2 flex flex-col items-center"
// //             style={{
// //               minWidth: "calc(100% - 1rem)",
// //               width: "calc(100% - 1rem)",
// //               opacity: currentIndex === index ? 1 : 0.7,
// //               transform: `scale(${currentIndex === index ? 1 : 0.95})`,
// //             }}
// //             onClick={(e) => {
// //               // Prevenir navegación para permitir el manejo de scroll primero
// //               e.preventDefault();
// //               setCurrentIndex(index);
// //               scrollToItem(index);

// //               // Navegar después de un breve delay para permitir la animación
// //               setTimeout(() => {
// //                 window.location.href = `/accesorios/${accesorio.id}`;
// //               }, 300);
// //             }}
// //           >
// //             <div className="relative h-48 w-56">
// //               <Image
// //                 src={
// //                   accesorio.imagenPrincipal ||
// //                   (accesorio.imagenes && accesorio.imagenes.length > 0
// //                     ? accesorio.imagenes[0].url
// //                     : "/placeholder-accesorio.jpg")
// //                 }
// //                 alt={accesorio.nombre}
// //                 className="object-cover h-full w-full"
// //                 layout="fill"
// //                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
// //               />
// //             </div>

// //             <div className="p-2 w-56">
// //               <h3 className="font-semibold text-lg">{accesorio.nombre}</h3>
// //               <p className="text-black mt-1 text-sm line-clamp-2">
// //                 {accesorio.descripcion}
// //               </p>
// //               <div className="mt-2 flex items-center">
// //                 <span className="font-bold text-lg">
// //                   $
// //                   {typeof accesorio.precio === "number"
// //                     ? accesorio.precio.toFixed(2)
// //                     : accesorio.precio}
// //                 </span>
// //                 {accesorio.precioAnterior && (
// //                   <span className="text-gray-500 line-through ml-2 text-sm">
// //                     $
// //                     {typeof accesorio.precioAnterior === "number"
// //                       ? accesorio.precioAnterior.toFixed(2)
// //                       : accesorio.precioAnterior}
// //                   </span>
// //                 )}
// //               </div>
// //             </div>
// //           </Link>
// //         ))}
// //       </div>

// //       {/* Indicadores de paginación (puntos) */}
// //       <div className="flex justify-center mt-4 space-x-2">
// //         {destacados.map((_, index) => (
// //           <button
// //             key={index}
// //             onClick={() => {
// //               setCurrentIndex(index);
// //               scrollToItem(index);
// //             }}
// //             className={`h-2 rounded-full transition-all duration-300 focus:outline-none
// //               ${currentIndex === index ? "bg-yellow-500 w-4" : "bg-gray-300 w-2"}`}
// //             aria-label={`Ir al accesorio ${index + 1}`}
// //           ></button>
// //         ))}
// //       </div>

// //       <div className="mt-6 text-center">
// //         <p className="text-gray-600 mb-4">
// //           Estos son los productos más populares
// //         </p>
// //         <Link
// //           href="/accesorios/destacados"
// //           className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
// //         >
// //           Ver todos los destacados
// //         </Link>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AccesoriosDestacados;

// import React from "react";
// import AccesoriosContainer from "@/containers/AccesoriosContainer";
// import { notFound } from "next/navigation";

// // Añade esta función para generar rutas estáticas
// export async function generateStaticParams() {
//   try {
//     // Importa los datos del JSON directamente
//     const accesoriosData = require("../../../../public/accesoriosDestacados.json");

//     // Determinar la estructura del JSON
//     const accesorios = accesoriosData.accesorios || accesoriosData;

//     // Verifica que accesorios sea un array
//     if (!Array.isArray(accesorios)) {
//       console.error("Los datos de accesorios no son un array");
//       return [];
//     }

//     // Registra cuántas rutas se están generando
//     console.log(
//       `Generando ${accesorios.length} rutas estáticas para accesorios`,
//     );

//     // Devuelve un array de objetos con el parámetro 'id'
//     return accesorios.map((accesorio) => ({
//       id: accesorio.id.toString(), // Convierte a string para asegurar compatibilidad
//     }));
//   } catch (error) {
//     console.error("Error al generar rutas estáticas:", error);
//     // Devuelve al menos una ruta para evitar errores de compilación
//     return [{ id: "fallback" }];
//   }
// }

// // Configura la generación de metadata
// export async function generateMetadata({ params }) {
//   const { id } = params;

//   try {
//     const accesoriosData = require("@/data/accesoriosDestacados.json");
//     const accesorios = accesoriosData.accesorios || accesoriosData;

//     const accesorio = accesorios.find((acc) => String(acc.id) === String(id));

//     if (!accesorio) {
//       return {
//         title: "Accesorio no encontrado",
//       };
//     }

//     return {
//       title: accesorio.nombre || "Detalle de accesorio",
//       description:
//         accesorio.descripcion || "Información detallada del accesorio",
//     };
//   } catch (error) {
//     return {
//       title: "Detalle de accesorio",
//     };
//   }
// }

// // Componente de página principal
// export default function AccesorioDetailPage({ params }) {
//   const { id } = params;

//   try {
//     // Carga los datos del JSON
//     const accesoriosData = require("@/data/accesoriosDestacados.json");
//     const accesorios = accesoriosData.accesorios || accesoriosData;

//     // Encuentra el accesorio específico
//     const accesorio = accesorios.find((acc) => String(acc.id) === String(id));

//     // Si no se encuentra, muestra un 404
//     if (!accesorio) {
//       return notFound();
//     }

//     // Filtra otros accesorios (todos excepto el actual)
//     const otrosAccesorios = accesorios.filter(
//       (acc) => String(acc.id) !== String(id),
//     );

//     // Configura el teléfono desde los datos o usa uno predeterminado
//     const telefono = accesoriosData.configuracion?.telefono || "+573174503604";

//     // Renderiza el componente AccesoriosContainer con los datos necesarios
//     return (
//       <AccesoriosContainer
//         accesorio={accesorio}
//         otrosAccesorios={otrosAccesorios}
//         telefono={telefono}
//       />
//     );
//   } catch (error) {
//     console.error("Error al cargar datos del accesorio:", error);
//     return (
//       <div className="container mx-auto p-4">
//         <h1 className="text-2xl font-bold text-red-500">
//           Error al cargar el accesorio
//         </h1>
//         <p>No se pudo cargar la información del accesorio solicitado.</p>
//       </div>
//     );
//   }
// }

import React from "react";
// import AccesoriosContainer from "@/components/AccesoriosContainer";
import AccesoriosContainer from "@/containers/AccesoriosContainer";
import { notFound } from "next/navigation";

// Datos estáticos para fallback (en caso de que no puedas cargar el JSON)
const datosAccesorios = [
  {
    id: 1,
    nombre: "Luces para bicicleta",
    descripcion:
      "Con batería recargable mediante USB tipo v. Cuentan con 3 modos de iluminación.",
    imagenes: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fluces_bici.jpg?alt=media&token=6dca1abb-ec2d-41ed-88a1-5fb7dc4474aa",
      },
    ],
    imagenPrincipal:
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fluces_bici.jpg?alt=media&token=6dca1abb-ec2d-41ed-88a1-5fb7dc4474aa",
    precio: 34900,
    categoria: "damas",
  },
  {
    id: 2,
    nombre: "Disco SSD mSATA 256 GB",
    descripcion: "¡Optimiza el rendimiento de tu equipo!",
    imagenes: [
      {
        url: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/ssd%20mSata/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy9zc2QgbVNhdGEvMS5qcGciLCJpYXQiOjE3NDI4NzAzNzQsImV4cCI6MTc3NDQwNjM3NH0.ufbta37bGQSK8rErZt0EBVpcRFwhOm8JnUH9cXoX5Aw",
      },
    ],
    imagenPrincipal:
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/ssd%20mSata/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy9zc2QgbVNhdGEvMS5qcGciLCJpYXQiOjE3NDI4NzAzNzQsImV4cCI6MTc3NDQwNjM3NH0.ufbta37bGQSK8rErZt0EBVpcRFwhOm8JnUH9cXoX5Aw",
    precio: 119900,
    categoria: "computador",
  },
  {
    id: 3,
    nombre: "USB Tipo C - 2 metros",
    descripcion: "Diseñado para ofrecer durabilidad y rendimiento óptimos.",
    imagenes: [
      {
        url: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/usb%20t%20c%202%20metros/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy91c2IgdCBjIDIgbWV0cm9zLzEuanBnIiwiaWF0IjoxNzQyODcxMTUwLCJleHAiOjE3NzQ0MDcxNTB9.K9vtInBmomcXdmVBzDnENR4usObHFmQ9IYCGETr0byQ",
      },
    ],
    imagenPrincipal:
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/usb%20t%20c%202%20metros/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy91c2IgdCBjIDIgbWV0cm9zLzEuanBnIiwiaWF0IjoxNzQyODcxMTUwLCJleHAiOjE3NzQ0MDcxNTB9.K9vtInBmomcXdmVBzDnENR4usObHFmQ9IYCGETr0byQ",
    precio: 39900,
    categoria: "celulares",
  },
];

// Generar rutas estáticas
export function generateStaticParams() {
  console.log("Generando 3 rutas estáticas para accesorios");

  // Usar los datos estáticos para generar rutas
  return datosAccesorios.map((accesorio) => ({
    id: accesorio.id.toString(),
  }));
}

// Componente de página
export default function AccesorioPage({ params }) {
  const { id } = params;

  // Buscar el accesorio por ID usando los datos estáticos
  const accesorio = datosAccesorios.find(
    (acc) => String(acc.id) === String(id),
  );

  if (!accesorio) {
    return notFound();
  }

  // Otros accesorios (todos excepto el actual)
  const otrosAccesorios = datosAccesorios.filter(
    (acc) => String(acc.id) !== String(id),
  );

  // Renderiza el componente AccesoriosContainer con los datos
  return (
    <AccesoriosContainer
      accesorio={accesorio}
      otrosAccesorios={otrosAccesorios}
      telefono="+573174503604"
    />
  );
}
