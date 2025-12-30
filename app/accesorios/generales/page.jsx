import React from "react";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { loadCategoryProducts } from "@/utils/loadCategoryProducts";
import { generateCategoryMetadata } from "@/utils/categoryMetadata";

export const metadata = generateCategoryMetadata("generales");

// Forzar renderizado dinámico para evitar errores de prerenderizado
export const dynamic = "force-dynamic";

export default async function GeneralesPage() {
  try {
    const productos = await loadCategoryProducts("generales");

    return (
      <main className="py-14 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <CategoryProductGrid
            productos={productos}
            categorySlug="generales"
            categoryName="Accesorios Generales"
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error("[GeneralesPage] Error:", error);
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
