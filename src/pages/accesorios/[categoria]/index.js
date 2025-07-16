// // pages/accesorios/[categoria]/index.js
// import { useState } from "react";
// import { useRouter } from "next/router";
// import Head from "next/head";
// import Link from "next/link";
// import Image from "next/image";
// import { Eye, Grid, List } from "lucide-react";
// import {
//   generarUrlAccesorio,
//   generarTituloSEO,
// } from "../../../utils/urlHelpers";

// const CategoriaPage = ({ accesorios, categoria, error }) => {
//   const router = useRouter();
//   const [vistaGrid, setVistaGrid] = useState(true);
//   const [filtro, setFiltro] = useState("");

//   if (router.isFallback) {
//     return (
//       <div className="max-w-6xl mx-auto p-4 mt-8">
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <span className="ml-3 text-lg">Cargando accesorios...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-6xl mx-auto p-4">
//         <div className="text-center py-12">
//           <div className="text-6xl mb-4">❌</div>
//           <h1 className="text-xl font-bold">Error al cargar accesorios</h1>
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

//   // Filtrar accesorios basado en el filtro de búsqueda
//   const accesoriosFiltrados = accesorios.filter(
//     (accesorio) =>
//       accesorio.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
//       (accesorio.descripcion &&
//         accesorio.descripcion.toLowerCase().includes(filtro.toLowerCase())),
//   );

//   const tituloCategoria =
//     categoria.charAt(0).toUpperCase() + categoria.slice(1);

//   return (
//     <>
//       <Head>
//         <title>
//           {generarTituloSEO(
//             { nombre: `Accesorios para ${tituloCategoria}` },
//             categoria,
//           )}
//         </title>
//         <meta
//           name="description"
//           content={`Descubre nuestra amplia selección de accesorios para ${tituloCategoria}. Calidad garantizada y precios competitivos.`}
//         />
//         <meta
//           property="og:title"
//           content={`Accesorios para ${tituloCategoria}`}
//         />
//         <meta property="og:type" content="website" />
//         <meta
//           property="og:url"
//           content={`${process.env.NEXT_PUBLIC_BASE_URL}/accesorios/${categoria}`}
//         />
//       </Head>

//       <div className="max-w-6xl mx-auto p-4">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-center mb-4">
//             Accesorios para {tituloCategoria}
//           </h1>
//           <p className="text-center text-gray-600 dark:text-gray-400">
//             Encuentra el accesorio perfecto para tu {categoria}
//           </p>
//         </div>

//         {/* Controles */}
//         <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
//           {/* Búsqueda */}
//           <div className="flex-1 max-w-md">
//             <input
//               type="text"
//               placeholder="Buscar accesorios..."
//               value={filtro}
//               onChange={(e) => setFiltro(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
//             />
//           </div>

//           {/* Controles de vista */}
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600 dark:text-gray-400">
//               {accesoriosFiltrados.length} producto
//               {accesoriosFiltrados.length !== 1 ? "s" : ""}
//             </span>
//             <div className="flex border border-gray-300 rounded-lg overflow-hidden">
//               <button
//                 onClick={() => setVistaGrid(true)}
//                 className={`p-2 ${vistaGrid ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
//                 aria-label="Vista en cuadrícula"
//               >
//                 <Grid size={18} />
//               </button>
//               <button
//                 onClick={() => setVistaGrid(false)}
//                 className={`p-2 ${!vistaGrid ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
//                 aria-label="Vista en lista"
//               >
//                 <List size={18} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Lista/Grid de accesorios */}
//         {accesoriosFiltrados.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-6xl mb-4">🔍</div>
//             <h2 className="text-xl font-semibold mb-2">
//               No se encontraron accesorios
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400">
//               {filtro
//                 ? "Intenta con otros términos de búsqueda"
//                 : "No hay accesorios en esta categoría"}
//             </p>
//           </div>
//         ) : (
//           <div
//             className={
//               vistaGrid
//                 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
//                 : "space-y-4"
//             }
//           >
//             {accesoriosFiltrados.map((accesorio, index) => {
//               const urlAccesorio = generarUrlAccesorio(categoria, accesorio);
//               const imagenPrincipal =
//                 accesorio.imagenPrincipal ||
//                 accesorio.imagenes?.[0]?.url ||
//                 accesorio.imagenes?.[0];

//               return vistaGrid ? (
//                 // Vista Grid
//                 <div
//                   key={accesorio.id || index}
//                   className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105"
//                 >
//                   <Link href={urlAccesorio}>
//                     <div className="cursor-pointer">
//                       <div className="relative h-48 mb-3 overflow-hidden rounded bg-white/10">
//                         {imagenPrincipal ? (
//                           <Image
//                             src={imagenPrincipal}
//                             alt={accesorio.nombre}
//                             fill
//                             className="object-contain"
//                             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
//                             loading="lazy"
//                           />
//                         ) : (
//                           <div className="flex items-center justify-center h-full">
//                             <div className="text-4xl text-gray-400">📷</div>
//                           </div>
//                         )}
//                       </div>
//                       <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white">
//                         {accesorio.nombre}
//                       </h3>
//                       <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
//                         $
//                         {typeof accesorio.precio === "number"
//                           ? accesorio.precio.toLocaleString("es-CO")
//                           : accesorio.precio}
//                       </p>
//                       <div className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
//                         <Eye size={16} className="mr-2" />
//                         Ver detalles
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               ) : (
//                 // Vista Lista
//                 <div
//                   key={accesorio.id || index}
//                   className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-lg p-4 hover:shadow-lg transition-shadow"
//                 >
//                   <Link href={urlAccesorio}>
//                     <div className="cursor-pointer flex gap-4">
//                       <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded bg-white/10">
//                         {imagenPrincipal ? (
//                           <Image
//                             src={imagenPrincipal}
//                             alt={accesorio.nombre}
//                             fill
//                             className="object-contain"
//                             sizes="96px"
//                             loading="lazy"
//                           />
//                         ) : (
//                           <div className="flex items-center justify-center h-full">
//                             <div className="text-2xl text-gray-400">📷</div>
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
//                           {accesorio.nombre}
//                         </h3>
//                         <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
//                           {accesorio.descripcion?.substring(0, 150)}...
//                         </p>
//                         <div className="flex items-center justify-between">
//                           <span className="text-xl font-bold text-green-600 dark:text-green-400">
//                             $
//                             {typeof accesorio.precio === "number"
//                               ? accesorio.precio.toLocaleString("es-CO")
//                               : accesorio.precio}
//                           </span>
//                           <div className="flex items-center text-blue-600 hover:text-blue-700">
//                             <Eye size={16} className="mr-1" />
//                             Ver detalles
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export async function getServerSideProps({ params }) {
//   const { categoria } = params;

//   try {
//     const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
//     const response = await fetch(`${baseUrl}/api/accesorios/${categoria}`);

//     if (!response.ok) {
//       if (response.status === 404) {
//         return { notFound: true };
//       }
//       throw new Error(`Error ${response.status}: ${response.statusText}`);
//     }

//     const data = await response.json();
//     const accesorios = Array.isArray(data) ? data : data.accesorios || [];

//     return {
//       props: {
//         accesorios,
//         categoria,
//         error: null,
//       },
//     };
//   } catch (error) {
//     console.error("Error en getServerSideProps:", error);

//     return {
//       props: {
//         accesorios: [],
//         categoria,
//         error: error.message || "Error desconocido al cargar accesorios",
//       },
//     };
//   }
// }

// export default CategoriaPage;

// // .env.local (archivo de configuración de variables de entorno)
// // NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
// // API_BASE_URL=https://tu-api.com
// // WHATSAPP_DEFAULT_PHONE=+573174503604

// // next.config.js (configuración de Next.js para imágenes)
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     domains: [
//       "localhost",
//       "firebasestorage.googleapis.com",
//       "tu-dominio.com",
//       // Agrega aquí otros dominios de donde cargas imágenes
//     ],
//     formats: ["image/webp", "image/avif"],
//   },
//   // Configuración para rutas estáticas si usas getStaticPaths
//   experimental: {
//     // Habilitar si quieres usar ISR (Incremental Static Regeneration)
//     // incrementalCacheHandlerPath: require.resolve('./cache-handler.js'),
//   },
// };

// module.exports = nextConfig;

// pages/accesorios/[categoria]/index.js
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Eye, Grid, List } from "lucide-react";

// ✅ Funciones inline (igual que en [slug].js)
export const generarTituloSEO = (accesorio, categoria) => {
  return `${accesorio?.nombre || "Accesorio"} | Tu Tienda`;
};

export const generarUrlAccesorio = (categoria, accesorio) => {
  const slug =
    accesorio.slug ||
    accesorio.nombre
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 60);
  return `/accesorios/${categoria}/${slug}`;
};

const CategoriaPage = ({ accesorios, categoria, error }) => {
  const router = useRouter();
  const [vistaGrid, setVistaGrid] = useState(true);
  const [filtro, setFiltro] = useState("");

  if (router.isFallback) {
    return (
      <div className="max-w-6xl mx-auto p-4 mt-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg">Cargando accesorios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-xl font-bold">Error al cargar accesorios</h1>
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

  // Filtrar accesorios basado en el filtro de búsqueda
  const accesoriosFiltrados = accesorios.filter(
    (accesorio) =>
      accesorio.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      (accesorio.descripcion &&
        accesorio.descripcion.toLowerCase().includes(filtro.toLowerCase())),
  );

  const tituloCategoria =
    categoria.charAt(0).toUpperCase() + categoria.slice(1);

  return (
    <>
      <Head>
        <title>
          {generarTituloSEO(
            { nombre: `Accesorios para ${tituloCategoria}` },
            categoria,
          )}
        </title>
        <meta
          name="description"
          content={`Descubre nuestra amplia selección de accesorios para ${tituloCategoria}. Calidad garantizada y precios competitivos.`}
        />
        <meta
          property="og:title"
          content={`Accesorios para ${tituloCategoria}`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/accesorios/${categoria}`}
        />
      </Head>

      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4">
            Accesorios para {tituloCategoria}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Encuentra el accesorio perfecto para tu {categoria}
          </p>
        </div>

        {/* Controles */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar accesorios..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Controles de vista */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {accesoriosFiltrados.length} producto
              {accesoriosFiltrados.length !== 1 ? "s" : ""}
            </span>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setVistaGrid(true)}
                className={`p-2 ${vistaGrid ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                aria-label="Vista en cuadrícula"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setVistaGrid(false)}
                className={`p-2 ${!vistaGrid ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                aria-label="Vista en lista"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Lista/Grid de accesorios */}
        {accesoriosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold mb-2">
              No se encontraron accesorios
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {filtro
                ? "Intenta con otros términos de búsqueda"
                : "No hay accesorios en esta categoría"}
            </p>
          </div>
        ) : (
          <div
            className={
              vistaGrid
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {accesoriosFiltrados.map((accesorio, index) => {
              const urlAccesorio = generarUrlAccesorio(categoria, accesorio);
              const imagenPrincipal =
                accesorio.imagenPrincipal ||
                accesorio.imagenes?.[0]?.url ||
                accesorio.imagenes?.[0];

              return vistaGrid ? (
                // Vista Grid
                <div
                  key={accesorio.id || index}
                  className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105"
                >
                  <Link href={urlAccesorio}>
                    <div className="cursor-pointer">
                      <div className="relative h-48 mb-3 overflow-hidden rounded bg-white/10">
                        {imagenPrincipal ? (
                          <Image
                            src={imagenPrincipal}
                            alt={accesorio.nombre}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-4xl text-gray-400">📷</div>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white">
                        {accesorio.nombre}
                      </h3>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
                        $
                        {typeof accesorio.precio === "number"
                          ? accesorio.precio.toLocaleString("es-CO")
                          : accesorio.precio}
                      </p>
                      <div className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                        <Eye size={16} className="mr-2" />
                        Ver detalles
                      </div>
                    </div>
                  </Link>
                </div>
              ) : (
                // Vista Lista
                <div
                  key={accesorio.id || index}
                  className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <Link href={urlAccesorio}>
                    <div className="cursor-pointer flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded bg-white/10">
                        {imagenPrincipal ? (
                          <Image
                            src={imagenPrincipal}
                            alt={accesorio.nombre}
                            fill
                            className="object-contain"
                            sizes="96px"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-2xl text-gray-400">📷</div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                          {accesorio.nombre}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                          {accesorio.descripcion?.substring(0, 150)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-green-600 dark:text-green-400">
                            $
                            {typeof accesorio.precio === "number"
                              ? accesorio.precio.toLocaleString("es-CO")
                              : accesorio.precio}
                          </span>
                          <div className="flex items-center text-blue-600 hover:text-blue-700">
                            <Eye size={16} className="mr-1" />
                            Ver detalles
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export async function getServerSideProps({ params }) {
  const { categoria } = params;

  try {
    const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/accesorios/${categoria}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { notFound: true };
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const accesorios = Array.isArray(data) ? data : data.accesorios || [];

    return {
      props: {
        accesorios,
        categoria,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error en getServerSideProps:", error);

    return {
      props: {
        accesorios: [],
        categoria,
        error: error.message || "Error desconocido al cargar accesorios",
      },
    };
  }
}

export default CategoriaPage;
