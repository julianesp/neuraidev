import React from "react";
import AccesoriosContainer from "../../../containers/AccesoriosContainer/page";

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
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
      },
    ],
    imagenPrincipal:
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
    precio: 34900,
    categoria: "damas",
  },
  {
    id: 2,
    nombre: "Disco SSD mSATA 256 GB",
    descripcion: "¡Optimiza el rendimiento de tu equipo!",
    imagenes: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
      },
    ],
    imagenPrincipal:
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
    precio: 119900,
    categoria: "computador",
  },
  {
    id: 3,
    nombre: "USB Tipo C - 2 metros",
    descripcion: "Diseñado para ofrecer durabilidad y rendimiento óptimos.",
    imagenes: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
      },
    ],
    imagenPrincipal:
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
    precio: 39900,
    categoria: "celulares",
  },
];

// Generar rutas estáticas
export function generateStaticParams() {
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

// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import AccesoriosContainer from "../../../containers/AccesoriosContainer/page";
// import Link from "next/link";

// export default function AccesorioDetallePage() {
//   const params = useParams();
//   const [accesorio, setAccesorio] = useState(null);
//   const [otrosAccesorios, setOtrosAccesorios] = useState([]);
//   const [telefono, setTelefono] = useState("+573174503604");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const cargarAccesorio = async () => {
//       try {
//         setLoading(true);

//         // Lista de archivos JSON a verificar
//         const archivosJson = [
//           "/celulares.json",
//           "/accesorios-destacados.json",
//           "/computadores.json",
//         ];

//         let accesorioEncontrado = null;
//         let todosLosAccesorios = [];
//         let telefonoConfig = telefono;

//         // Buscar en todos los archivos JSON
//         for (const archivo of archivosJson) {
//           try {
//             const response = await fetch(archivo);
//             if (response.ok) {
//               const data = await response.json();
//               const accesorios = data.accesorios || data;

//               // Buscar el accesorio por ID (convertir params.id a número)
//               const accesorioEnEsteLista = accesorios.find(
//                 (acc) => acc.id === parseInt(params.id) || acc.id === params.id,
//               );

//               if (accesorioEnEsteLista) {
//                 accesorioEncontrado = accesorioEnEsteLista;
//                 todosLosAccesorios = accesorios;

//                 // Obtener configuración si existe
//                 if (data.configuracion?.telefono) {
//                   telefonoConfig = data.configuracion.telefono;
//                 }
//                 break; // Salir del loop cuando encontremos el accesorio
//               }
//             }
//           } catch (error) {
//             console.warn(`Error cargando ${archivo}:`, error);
//             continue; // Continuar con el siguiente archivo
//           }
//         }

//         if (!accesorioEncontrado) {
//           throw new Error("Accesorio no encontrado en ningún archivo");
//         }

//         // Obtener otros accesorios (excluyendo el actual)
//         const otrosAccesoriosData = todosLosAccesorios.filter(
//           (acc) => acc.id !== accesorioEncontrado.id,
//         );

//         setAccesorio(accesorioEncontrado);
//         setOtrosAccesorios(otrosAccesoriosData);
//         setTelefono(telefonoConfig);
//       } catch (error) {
//         console.error("Error al cargar el accesorio:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     cargarAccesorio();
//   }, [params.id, telefono]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!accesorio) {
//     return (
//       <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-lg">
//         <h1 className="text-xl font-bold text-center">
//           No se encontró el accesorio
//         </h1>
//         <p className="text-center mt-4">
//           <Link
//             href="/accesorios/celulares"
//             className="text-primary hover:underline"
//           >
//             Ver todos los accesorios
//           </Link>
//         </p>
//       </div>
//     );
//   }

//   return (
//     <AccesoriosContainer
//       accesorio={accesorio}
//       otrosAccesorios={otrosAccesorios}
//       telefono={telefono}
//     />
//   );
// }

