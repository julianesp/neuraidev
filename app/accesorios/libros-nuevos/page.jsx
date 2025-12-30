import React from "react";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { loadCategoryProducts } from "@/utils/loadCategoryProducts";
import { generateCategoryMetadata } from "@/utils/categoryMetadata";

export const metadata = generateCategoryMetadata("libros-nuevos");

// Forzar renderizado dinámico para evitar errores de prerenderizado
export const dynamic = "force-dynamic";

export default async function LibrosNuevosPage() {
  const productos = await loadCategoryProducts("libros-nuevos");

  return (
    <main className="py-14 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <CategoryProductGrid
          productos={productos}
          categorySlug="libros-nuevos"
          categoryName="Libros Nuevos"
        />
      </div>
    </main>
  );
}
