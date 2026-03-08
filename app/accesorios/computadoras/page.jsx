import React from "react";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { loadCategoryProducts } from "@/utils/loadCategoryProducts";
import { generateCategoryMetadata } from "@/utils/categoryMetadata";

export const metadata = generateCategoryMetadata("computadoras");

// Forzar renderizado dinámico para evitar errores de prerenderizado
export const dynamic = "force-dynamic";

export default async function ComputadorasPage({ searchParams }) {
  const productos = await loadCategoryProducts("computadoras");

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
    ? `${subcategoria} para Computadoras`
    : "Accesorios para Computadoras";

  return (
    <main className="py-14 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <CategoryProductGrid
          productos={productosFiltrados}
          categorySlug="computadoras"
          categoryName={categoryName}
          subcategoria={subcategoria}
        />
      </div>
    </main>
  );
}
