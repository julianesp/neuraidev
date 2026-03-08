import React from "react";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { loadCategoryProducts } from "@/utils/loadCategoryProducts";
import { generateCategoryMetadata } from "@/utils/categoryMetadata";

export const metadata = generateCategoryMetadata("celulares");

// Forzar renderizado dinámico para evitar errores de prerenderizado
export const dynamic = "force-dynamic";

// Este componente será la página que muestra todos los accesorios de celulares
export default async function AccesoriosCelularesPage({ searchParams }) {
  try {
    const productos = await loadCategoryProducts("celulares");

    // Unwrap searchParams Promise (Next.js 15+)
    const params = await searchParams;
    const subcategoria = params?.subcategoria;

    // Filtrar productos por subcategoría si existe
    const productosFiltrados = subcategoria
      ? productos.filter((producto) => {
          const subcatLower = subcategoria.toLowerCase();
          const nombreProducto = (producto.nombre || '').toLowerCase();
          const titleProducto = (producto.title || '').toLowerCase();

          // Eliminar 's' o 'es' del final para búsqueda flexible (plural/singular)
          const subcatSingular = subcatLower.replace(/es$/, '').replace(/s$/, '');

          // Verificar en el nombre del producto (buscar coincidencia parcial)
          const nombreIncluye = nombreProducto.includes(subcatLower) ||
                               nombreProducto.includes(subcatSingular) ||
                               titleProducto.includes(subcatLower) ||
                               titleProducto.includes(subcatSingular);

          // Verificar en metadata si existe
          const metadataIncluye = producto.metadata?.subcategoria?.toLowerCase() === subcatLower ||
                                 producto.metadata?.tipo?.toLowerCase().includes(subcatLower) ||
                                 producto.metadata?.tipo?.toLowerCase().includes(subcatSingular);

          return nombreIncluye || metadataIncluye;
        })
      : productos;

    const categoryName = subcategoria
      ? `${subcategoria} para Celulares`
      : "Accesorios para Celulares";

    return (
      <main className="py-14 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <CategoryProductGrid
            productos={productosFiltrados}
            categorySlug="celulares"
            categoryName={categoryName}
            subcategoria={subcategoria}
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error("[AccesoriosCelularesPage] Error cargando productos:", error);
    return (
      <main className="py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error al cargar productos</p>
            <p>{error.message}</p>
          </div>
        </div>
      </main>
    );
  }
}
