"use client";

import React from "react";
import Link from "next/link";
import ProductoCascada from "@/components/ProductoCascada";

export default function CategoryProductGrid({ productos, categorySlug, categoryName }) {

  if (!productos || productos.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-inner">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-gray-600 dark:text-gray-300 text-xl font-light">
            No hay productos disponibles
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Vuelve más tarde para ver nuestras novedades
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header de la categoría */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {categoryName}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explora nuestra selección de productos en esta categoría
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Inicio
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              <Link href="/accesorios" className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 md:ml-2">
                Accesorios
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">{categoryName}</span>
            </div>
          </li>
        </ol>
      </nav>

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
