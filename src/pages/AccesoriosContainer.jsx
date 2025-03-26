// // pages/accesorios.js
// import React, { useState, useEffect } from "react";
// import Head from "next/head";
// import AccesoriosGridContainer from "../components/AccesoriosGridContainer";
// import { Search, Filter, ArrowUp } from "lucide-react";

// export default function AccesoriosPage() {
//   // Estado para los datos de accesorios
//   const [accesoriosData, setAccesoriosData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showScrollTop, setShowScrollTop] = useState(false);

//   // Control de scroll para el botón de volver arriba
//   useEffect(() => {
//     const handleScroll = () => {
//       setShowScrollTop(window.scrollY > 300);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   useEffect(() => {
//     // Simulando carga de datos
//     const cargarDatos = () => {
//       try {
//         // Datos de ejemplo
//         const datos = [
//           {
//             id: 1,
//             images: [
//               "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fteclado_genius.jpg?alt=media&token=5a9ecc50-db16-4d9a-b00c-a01de3c506b3",
//               "",
//             ],
//             title: "Teclado Genius básico",
//             description: "Teclado Genius básico con conexión USB",
//             price: "39.500",
//           },
//           {
//             id: 2,
//             images: [
//               "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F1.jpg?alt=media&token=191dc074-94cd-4ac1-89de-62070679a96e",
//               "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F2.jpg?alt=media&token=dd5ebf3c-578d-4010-a256-650df448dc2b",
//               "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F3.jpg?alt=media&token=82806339-47f0-44f6-8be5-cef6f138c8f6",
//             ],
//             title: "Cámara Genius",
//             description:
//               "Ideal para videollamadas o tareas simples. Es compatible con computadoras a través de USB.",
//             price: "84.900",
//           },
//           {
//             id: 3,
//             images: [
//               "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fram%20ddr3l%2F1.jpg?alt=media&token=6a358cee-9ebf-4255-8acf-e93fbff3ad25",
//               "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fram%20ddr3l%2F2.jpg?alt=media&token=af3ae254-2d27-478b-9b1e-8f0bde678ab1",
//             ],
//             title: "Memoria RAM DDR3L",
//             description:
//               "Una memoria RAM DDR3L es un módulo de memoria de bajo consumo (1.35V) diseñado para mejorar la eficiencia.",
//             price: "44.900",
//           },
//           {
//             id: 4,
//             images:
//               "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//             title: "Bombillo USB",
//             description: "Bombillo USB para iluminar tu teclado",
//             price: "9.900",
//           },
//           {
//             id: 5,
//             images:
//               "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//             title: "Bombillo USB Premium",
//             description:
//               "Bombillo USB para iluminar tu teclado con luz ajustable",
//             price: "15.900",
//           },
//           {
//             id: 6,
//             images:
//               "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fluces_bici.jpg?alt=media&token=6dca1abb-ec2d-41ed-88a1-5fb7dc4474aa",
//             title: "Luces bicicleta",
//             description:
//               "Luces delatera y trasera para bicicleta con batería recargable",
//             price: "34.900",
//           },
//         ];

//         setAccesoriosData(datos);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error al cargar los datos:", error);
//         setLoading(false);
//       }
//     };

//     // Simulamos un pequeño retraso para simular carga desde un servidor
//     setTimeout(cargarDatos, 800);
//   }, []);

//   // Indicador de carga
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
//           <p className="mt-6 text-gray-700 text-lg font-medium">
//             Cargando accesorios...
//           </p>
//           <p className="text-gray-500 mt-2">
//             Estamos preparando los mejores productos para ti
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Head>
//         <title>Accesorios Tecnológicos - Tu Tienda Online</title>
//         <meta
//           name="description"
//           content="Descubre nuestra amplia gama de accesorios tecnológicos de alta calidad"
//         />
//       </Head>

//       {/* Hero banner */}
//       <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-12">
//         <div className="container mx-auto px-4">
//           <h1 className="text-4xl font-bold mb-4">Accesorios Tecnológicos</h1>
//           <p className="text-xl opacity-90 max-w-2xl">
//             Descubre nuestra colección de accesorios para mejorar tu experiencia
//             tecnológica
//           </p>

//           {/* Barra de búsqueda */}
//           <div className="mt-8 max-w-xl bg-white rounded-full shadow-lg flex items-center p-1">
//             <input
//               type="text"
//               placeholder="¿Qué estás buscando?"
//               className="flex-grow py-3 px-5 bg-transparent focus:outline-none text-gray-800"
//             />
//             <button className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
//               <Search size={20} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Filtros y categorías */}
//       <div className="border-b border-gray-200 bg-white shadow-sm">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div className="flex items-center space-x-4">
//               <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
//                 <Filter size={18} />
//                 <span>Filtros</span>
//               </button>

//               <div className="hidden md:flex items-center space-x-6 text-sm">
//                 <a
//                   href="#"
//                   className="text-gray-600 hover:text-blue-600 transition-colors"
//                 >
//                   Todos
//                 </a>
//                 <a
//                   href="#"
//                   className="text-gray-600 hover:text-blue-600 transition-colors"
//                 >
//                   Computación
//                 </a>
//                 <a
//                   href="#"
//                   className="text-gray-600 hover:text-blue-600 transition-colors"
//                 >
//                   Audio
//                 </a>
//                 <a
//                   href="#"
//                   className="text-gray-600 hover:text-blue-600 transition-colors"
//                 >
//                   Iluminación
//                 </a>
//                 <a
//                   href="#"
//                   className="text-gray-600 hover:text-blue-600 transition-colors"
//                 >
//                   Componentes
//                 </a>
//               </div>
//             </div>

//             <div className="flex items-center space-x-3">
//               <span className="text-sm text-gray-500">Ordenar por:</span>
//               <select className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//                 <option>Relevancia</option>
//                 <option>Precio: Menor a mayor</option>
//                 <option>Precio: Mayor a menor</option>
//                 <option>Más recientes</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       <main>
//         <AccesoriosGridContainer
//           accesorios={Array.isArray(accesoriosData) ? accesoriosData : []}
//         />
//       </main>

//       {/* Footer */}
//       <footer className="bg-gray-800 text-gray-200 py-10 mt-16">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div>
//               <h3 className="text-xl font-bold mb-4">Nuestra Tienda</h3>
//               <p className="text-gray-400">
//                 Ofrecemos los mejores accesorios tecnológicos con garantía y
//                 soporte técnico.
//               </p>
//             </div>
//             <div>
//               <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
//               <ul className="space-y-2">
//                 <li>
//                   <a
//                     href="#"
//                     className="text-gray-400 hover:text-white transition-colors"
//                   >
//                     Inicio
//                   </a>
//                 </li>
//                 <li>
//                   <a
//                     href="#"
//                     className="text-gray-400 hover:text-white transition-colors"
//                   >
//                     Accesorios
//                   </a>
//                 </li>
//                 <li>
//                   <a
//                     href="#"
//                     className="text-gray-400 hover:text-white transition-colors"
//                   >
//                     Contacto
//                   </a>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h3 className="text-xl font-bold mb-4">Contacto</h3>
//               <p className="text-gray-400">
//                 Calle Principal #123
//                 <br />
//                 Ciudad, País
//                 <br />
//                 info@tienda.com
//                 <br />
//                 +1 234 567 890
//               </p>
//             </div>
//           </div>
//           <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
//             <p>
//               © {new Date().getFullYear()} Tu Tienda Online. Todos los derechos
//               reservados.
//             </p>
//           </div>
//         </div>
//       </footer>

//       {/* Botón de volver arriba */}
//       {showScrollTop && (
//         <button
//           onClick={scrollToTop}
//           className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
//           aria-label="Volver arriba"
//         >
//           <ArrowUp size={24} />
//         </button>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AccesoriosContainer from "./AccesoriosContainer";
// Importamos los datos directamente - asumiendo que el JSON está en /public
// En producción, normalmente obtendrías estos datos de una API

// Este componente se usa para mostrar una página individual de un accesorio
export default function AccesorioPage() {
  const params = useParams();
  const [accesorio, setAccesorio] = useState(null);
  const [otrosAccesorios, setOtrosAccesorios] = useState([]);
  const [telefono, setTelefono] = useState("1234567890");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para cargar los datos
    const cargarDatos = async () => {
      try {
        // En un caso real, esto sería una llamada a una API
        const response = await fetch("/accesorios.json");
        const data = await response.json();

        // Obtener el ID del accesorio de la URL
        const accesorioId = params.id;

        if (!accesorioId || !data.accesorios) {
          throw new Error("Accesorio no encontrado");
        }

        // Encontrar el accesorio específico
        const accesorioEncontrado = data.accesorios.find(
          (acc) => acc.id === accesorioId,
        );

        if (!accesorioEncontrado) {
          throw new Error("Accesorio no encontrado");
        }

        // Obtener otros accesorios (excluyendo el actual)
        const accesoriosRelacionados = data.accesorios
          .filter((acc) => acc.id !== accesorioId)
          // Opcional: Puedes filtrar para mostrar primero los de la misma categoría
          .sort((a, b) =>
            a.categoria === accesorioEncontrado.categoria ? -1 : 1,
          )
          .slice(0, 8); // Limitamos a 8 accesorios relacionados

        // Asignar datos
        setAccesorio(accesorioEncontrado);
        setOtrosAccesorios(accesoriosRelacionados);

        // Obtener el teléfono de la configuración
        if (data.configuracion && data.configuracion.telefono) {
          setTelefono(data.configuracion.telefono);
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        // Aquí podrías mostrar un mensaje de error al usuario
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!accesorio) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h1 className="text-xl font-bold text-center">
          No se encontró el accesorio
        </h1>
        <p className="text-center mt-4">
          <a href="/accesorios" className="text-primary hover:underline">
            Ver todos los accesorios
          </a>
        </p>
      </div>
    );
  }

  return (
    <AccesoriosContainer
      accesorio={accesorio}
      otrosAccesorios={otrosAccesorios}
      telefono={telefono}
    />
  );
}
