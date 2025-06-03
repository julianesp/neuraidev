// // /businesses/[businessId]/page.js - Página dinámica para cualquier negocio
// "use client";
// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation";
// import BusinessPage from "../../components/BusinessPage";

// // Mapeo de archivos de datos
// const businessDataFiles = {
//   "peluqueria-bella": () => import("../../data/peluqueria-bella.json"),
//   "tienda-tech": () => import("../../data/tienda-tech.json"),
//   "boutique-moda": () => import("../../data/boutique-moda.json"),
//   "accesorios-cell": () => import("../../data/accesorios-cell.json"),
//   "supermercado-local": () => import("../../data/supermercado-local.json"),
//   "restaurante-sabor": () => import("../../data/restaurante-sabor.json"),
// };

// export default function DynamicBusinessPage() {
//   const params = useParams();
//   const businessId = params?.businessId;
//   const [businessData, setBusinessData] = useState(null);
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const loadBusinessData = async () => {
//       try {
//         if (businessId && businessDataFiles[businessId]) {
//           const dataModule = await businessDataFiles[businessId]();
//           setBusinessData(dataModule.default);
//         } else {
//           setError("Negocio no encontrado");
//         }
//       } catch (err) {
//         console.error("Error loading business data:", err);
//         setError("Error al cargar los datos del negocio");
//       } finally {
//         setIsLoaded(true);
//       }
//     };

//     loadBusinessData();
//   }, [businessId]);

//   if (!isLoaded) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-lg text-gray-600">Cargando negocio...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
//         <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
//           <h1 className="text-3xl font-bold text-white mb-4">{error}</h1>
//           <p className="text-white/80 mb-6">
//             Lo sentimos, no pudimos encontrar este negocio.
//           </p>
//           <a
//             href="/businesses"
//             className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
//           >
//             Ver todos los negocios
//           </a>
//         </div>
//       </div>
//     );
//   }

//   return <BusinessPage businessData={businessData} />;
// }

// // Función auxiliar para generar rutas estáticas (opcional)
// export function generateStaticParams() {
//   return Object.keys(businessDataFiles).map((businessId) => ({
//     businessId,
//   }));
// }

// src/app/businesses/[businessId]/page.js
// ✅ VERSIÓN CORREGIDA - Solo componente cliente

"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BusinessPage from "../../../components/BusinessPage/page";

// Importar datos estáticamente (más simple y funcional)
import peluqueria from "../../../data/businesses/peluqueria.json";
// import tiendaTechData from "../../../data/businesses/tienda-tech.json";
// import boutiqueModa from "../../../data/businesses/boutique-mode.json";
import supermercadoLocal from "../../../data/businesses/supermercado-local.json";
import Link from "next/link";

// Mapeo de datos simplificado
const businessDataMap = {
  "peluqueria-bella": peluqueria,
  //   "tienda-tech": tiendaTechData,
  //   "boutique-moda": boutiqueModa,
  //   "accesorios-cell": accesoriosCell,
  "supermercado-local": supermercadoLocal,
  //   "restaurante-sabor": restauranteSabor,
};

export default function BusinessDetailPage() {
  const params = useParams();
  const businessId = params?.businessId;
  const [businessData, setBusinessData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBusinessData = () => {
      try {
        if (businessId && businessDataMap[businessId]) {
          setBusinessData(businessDataMap[businessId]);
        } else {
          setError("Negocio no encontrado");
        }
      } catch (err) {
        console.error("Error loading business data:", err);
        setError("Error al cargar los datos del negocio");
      } finally {
        setIsLoaded(true);
      }
    };

    loadBusinessData();
  }, [businessId]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando negocio...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
          <h1 className="text-3xl font-bold text-slate-950 mb-4">{error}</h1>
          <p className="text-slate-950 mb-6">
            Lo sentimos, no pudimos encontrar este negocio.
          </p>
          <Link
            href="/businesses"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Ver todos los negocios
          </Link>
        </div>
      </div>
    );
  }

  return <BusinessPage businessData={businessData} />;
}
