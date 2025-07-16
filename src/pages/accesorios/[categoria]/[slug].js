// // pages/accesorios/[categoria]/[slug].js
// // Página dinámica para mostrar accesorio individual

// import { useRouter } from "next/router";
// import { useState, useEffect } from "react";
// import Head from "next/head";
// import AccesoriosContainer from "../../../components/AccesoriosContainer";

// // ✅ ADD inline functions:
// const generarTituloSEO = (accesorio, categoria) => {
//   if (!accesorio) return "Accesorios | Tu Tienda";
//   const nombre = accesorio.nombre || "Accesorio";
//   const cat = categoria
//     ? categoria.charAt(0).toUpperCase() + categoria.slice(1)
//     : "Accesorios";
//   return `${nombre} - ${cat} | Tu Tienda`;
// };

// const generarDescripcionSEO = (accesorio) => {
//   if (!accesorio) return "Descubre nuestros accesorios de alta calidad.";
//   let desc = accesorio.descripcion || "";
//   if (desc.length > 160) desc = desc.substring(0, 157) + "...";
//   if (!desc || desc.length < 20)
//     desc = `${accesorio.nombre || "Accesorio"} de alta calidad.`;
//   return desc;
// };

// const AccesorioPage = ({ accesorio, otrosAccesorios, categoria, error }) => {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);

//   if (router.isFallback) {
//     return (
//       <div className="max-w-6xl mx-auto p-4 mt-8 bg-white/30 backdrop-blur-md rounded-lg shadow-lg">
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//           <span className="ml-3 text-lg">Cargando accesorio...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-6xl mx-auto p-4 bg-white/30 backdrop-blur-md rounded-lg shadow-lg">
//         <div className="text-center py-12">
//           <div className="text-6xl mb-4">❌</div>
//           <h1 className="text-xl font-bold">Error al cargar el accesorio</h1>
//           <p className="text-gray-600 mt-2">{error}</p>
//           <button
//             onClick={() => router.back()}
//             className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Volver atrás
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Función para cambiar accesorio y actualizar URL
//   const handleCambiarAccesorio = async (nuevoAccesorio) => {
//     if (!nuevoAccesorio || !nuevoAccesorio.slug) {
//       console.error("Accesorio inválido:", nuevoAccesorio);
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // Crear la nueva URL usando el slug
//       const nuevaUrl = `/accesorios/${categoria}/${nuevoAccesorio.slug}`;

//       // Actualizar la URL en el navegador
//       await router.push(nuevaUrl, undefined, {
//         shallow: false,
//         scroll: false,
//       });
//     } catch (error) {
//       console.error("Error al cambiar accesorio:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <Head>
//         <title>{generarTituloSEO(accesorio, categoria)}</title>
//         <meta name="description" content={generarDescripcionSEO(accesorio)} />
//         <meta property="og:title" content={accesorio?.nombre || "Accesorio"} />
//         <meta
//           property="og:description"
//           content={generarDescripcionSEO(accesorio)}
//         />
//         <meta property="og:type" content="product" />
//         <meta
//           property="og:url"
//           content={`${process.env.NEXT_PUBLIC_BASE_URL}/accesorios/${categoria}/${accesorio?.slug}`}
//         />
//         {accesorio?.imagenPrincipal && (
//           <meta property="og:image" content={accesorio.imagenPrincipal} />
//         )}
//         <link
//           rel="canonical"
//           href={`${process.env.NEXT_PUBLIC_BASE_URL}/accesorios/${categoria}/${accesorio?.slug}`}
//         />
//       </Head>

//       {isLoading && (
//         <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
//             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//             <span>Cargando...</span>
//           </div>
//         </div>
//       )}

//       <AccesoriosContainer
//         accesorio={accesorio}
//         otrosAccesorios={otrosAccesorios}
//         onCambiarAccesorio={handleCambiarAccesorio}
//       />
//     </>
//   );
// };

// export async function getServerSideProps({ params, req }) {
//   const { categoria, slug } = params;

//   try {
//     const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";

//     // Obtener accesorio específico por slug
//     const accesorioResponse = await fetch(
//       `${baseUrl}/api/accesorios/${categoria}/${slug}`,
//     );

//     if (!accesorioResponse.ok) {
//       if (accesorioResponse.status === 404) {
//         return { notFound: true };
//       }
//       throw new Error(
//         `Error ${accesorioResponse.status}: ${accesorioResponse.statusText}`,
//       );
//     }

//     const accesorioData = await accesorioResponse.json();

//     // Obtener otros accesorios de la misma categoría (excluir el actual por slug)
//     const otrosResponse = await fetch(
//       `${baseUrl}/api/accesorios/${categoria}?exclude=${slug}`,
//     );
//     let otrosAccesorios = [];

//     if (otrosResponse.ok) {
//       const otrosData = await otrosResponse.json();
//       otrosAccesorios = otrosData.accesorios || [];
//     }

//     return {
//       props: {
//         accesorio: accesorioData,
//         otrosAccesorios,
//         categoria,
//         error: null,
//       },
//     };
//   } catch (error) {
//     console.error("Error en getServerSideProps:", error);

//     return {
//       props: {
//         accesorio: null,
//         otrosAccesorios: [],
//         categoria,
//         error: error.message || "Error desconocido al cargar el accesorio",
//       },
//     };
//   }
// }

// export default AccesorioPage;

// src/utils/urlHelpers.js
// src/pages/accesorios/categoria/[slug].js
// export const generarTituloSEO = (accesorio, categoria) => {
//   return `${accesorio?.nombre || "Accesorio"} | Tu Tienda`;
// };

// export const generarDescripcionSEO = (accesorio) => {
//   return accesorio?.descripcion?.substring(0, 160) || "Accesorio de calidad";
// };

// src/pages/accesorios/[categoria]/[slug].js
import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";
import AccesoriosContainer from "../../../components/AccesoriosContainer";

// ✅ Funciones helper inline
export const generarTituloSEO = (accesorio, categoria) => {
  return `${accesorio?.nombre || "Accesorio"} | Tu Tienda`;
};

export const generarDescripcionSEO = (accesorio) => {
  return accesorio?.descripcion?.substring(0, 160) || "Accesorio de calidad";
};

// ✅ COMPONENTE PRINCIPAL (esto es lo que faltaba)
const AccesorioPage = ({ accesorio, otrosAccesorios, categoria, error }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (router.isFallback) {
    return (
      <div className="max-w-6xl mx-auto p-4 mt-8 bg-white/30 backdrop-blur-md rounded-lg shadow-lg">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Cargando accesorio...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-white/30 backdrop-blur-md rounded-lg shadow-lg">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-xl font-bold">Error al cargar el accesorio</h1>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  // Función para cambiar accesorio y actualizar URL
  const handleCambiarAccesorio = async (nuevoAccesorio) => {
    if (!nuevoAccesorio || !nuevoAccesorio.slug) {
      console.error("Accesorio inválido:", nuevoAccesorio);
      return;
    }

    setIsLoading(true);

    try {
      // Crear la nueva URL usando el slug
      const nuevaUrl = `/accesorios/${categoria}/${nuevoAccesorio.slug}`;

      // Actualizar la URL en el navegador
      await router.push(nuevaUrl, undefined, {
        shallow: false,
        scroll: false,
      });
    } catch (error) {
      console.error("Error al cambiar accesorio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{generarTituloSEO(accesorio, categoria)}</title>
        <meta name="description" content={generarDescripcionSEO(accesorio)} />
        <meta property="og:title" content={accesorio?.nombre || "Accesorio"} />
        <meta
          property="og:description"
          content={generarDescripcionSEO(accesorio)}
        />
        <meta property="og:type" content="product" />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/accesorios/${categoria}/${accesorio?.slug}`}
        />
        {accesorio?.imagenPrincipal && (
          <meta property="og:image" content={accesorio.imagenPrincipal} />
        )}
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_BASE_URL}/accesorios/${categoria}/${accesorio?.slug}`}
        />
      </Head>

      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Cargando...</span>
          </div>
        </div>
      )}

      <AccesoriosContainer
        accesorio={accesorio}
        otrosAccesorios={otrosAccesorios}
        onCambiarAccesorio={handleCambiarAccesorio}
      />
    </>
  );
};

// ✅ OBTENER DATOS DEL SERVIDOR
export async function getServerSideProps({ params }) {
  const { categoria, slug } = params;

  try {
    const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";

    // Obtener accesorio específico por slug
    const accesorioResponse = await fetch(
      `${baseUrl}/api/accesorios/${categoria}/${slug}`,
    );

    if (!accesorioResponse.ok) {
      if (accesorioResponse.status === 404) {
        return { notFound: true };
      }
      throw new Error(
        `Error ${accesorioResponse.status}: ${accesorioResponse.statusText}`,
      );
    }

    const accesorioData = await accesorioResponse.json();

    // Obtener otros accesorios de la misma categoría (excluir el actual por slug)
    const otrosResponse = await fetch(
      `${baseUrl}/api/accesorios/${categoria}?exclude=${slug}`,
    );
    let otrosAccesorios = [];

    if (otrosResponse.ok) {
      const otrosData = await otrosResponse.json();
      otrosAccesorios = otrosData.accesorios || [];
    }

    return {
      props: {
        accesorio: accesorioData,
        otrosAccesorios,
        categoria,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error en getServerSideProps:", error);

    return {
      props: {
        accesorio: null,
        otrosAccesorios: [],
        categoria,
        error: error.message || "Error desconocido al cargar el accesorio",
      },
    };
  }
}

// ✅ EXPORTACIÓN POR DEFECTO (esto es lo más importante)
export default AccesorioPage;
