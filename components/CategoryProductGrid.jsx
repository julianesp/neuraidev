"use client";

import React from "react";
import Link from "next/link";
import ProductoCascada from "@/components/ProductoCascada/page";

export default function CategoryProductGrid({
  productos,
  categorySlug,
  categoryName,
  subcategoria,
}) {
  if (!productos || productos.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-inner">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-gray-600 dark:text-gray-300 text-xl font-light">
            No hay productos disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-4">
      {/* Header de la categoría */}
      {/* <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {categoryName}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explora nuestra selección de productos en esta categoría
        </p>
      </div> */}


      {/* Vista en cascada */}
      <ProductoCascada productos={productos} categorySlug={categorySlug} />

      {/* CTA final */}
      <div className="mt-12 text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ¿No encontraste lo que buscabas?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Explora toda nuestra colección de accesorios y productos
          </p>
          <Link
            href="/accesorios"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors font-medium"
          >
            Ver todas las categorías
          </Link>
        </div>
      </div>
    </div>
  );
}
