"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, Columns, Eye, ShoppingCart } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/FavoriteButton";
import ProductoCascada from "@/components/ProductoCascada";
import { generateProductSlug, buildProductUrl } from "@/utils/slugify";

export default function CategoryProductGrid({ productos, categorySlug, categoryName }) {
  const [viewMode, setViewMode] = useState("grid");

  // Cargar preferencia guardada del localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("productViewMode");
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Guardar preferencia cuando cambie
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("productViewMode", mode);
  };

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

      {/* Toggle de vista */}
      <div className="flex justify-end items-center mb-6">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex gap-1">
          <button
            onClick={() => handleViewModeChange("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            }`}
            title="Vista en cuadrícula"
          >
            <LayoutGrid size={18} />
            <span className="hidden sm:inline">Cuadrícula</span>
          </button>
          <button
            onClick={() => handleViewModeChange("cascade")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              viewMode === "cascade"
                ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            }`}
            title="Vista en cascada"
          >
            <Columns size={18} />
            <span className="hidden sm:inline">Cascada</span>
          </button>
        </div>
      </div>

      {/* Renderizar vista según la selección */}
      {viewMode === "cascade" ? (
        <ProductoCascada productos={productos} categorySlug={categorySlug} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col"
            >
              {/* Imagen del producto con botón de favoritos */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                <Link href={buildProductUrl(categorySlug, generateProductSlug(producto), producto)}>
                  <Image
                    src={
                      producto.imagenPrincipal ||
                      (producto.imagenes && producto.imagenes.length > 0
                        ? typeof producto.imagenes[0] === "object" ? producto.imagenes[0].url : producto.imagenes[0]
                        : "/imageshttps://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen")
                    }
                    alt={producto.nombre || producto.title}
                    fill={true}
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    loading="lazy"
                    quality={85}
                  />
                </Link>

                {/* Botón de favoritos en la esquina superior derecha */}
                <div className="absolute top-2 right-2 z-10">
                  <FavoriteButton producto={producto} size="medium" />
                </div>

                {/* Badge de stock si está bajo */}
                {producto.stock && producto.stock <= 5 && producto.stock > 0 && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ¡Últimas {producto.stock}!
                  </div>
                )}

                {/* Badge de sin stock */}
                {producto.stock === 0 && (
                  <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Sin stock
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className="p-4 flex flex-col flex-grow">
                <Link href={buildProductUrl(categorySlug, generateProductSlug(producto), producto)}>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-900 dark:text-white cursor-pointer">
                    {producto.nombre || producto.title}
                  </h3>
                </Link>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {producto.descripcion || producto.description}
                </p>

                {/* Precio */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-xl text-green-600">
                    $
                    {typeof producto.precio === "number"
                      ? producto.precio.toLocaleString("es-CO")
                      : producto.precio}
                  </span>
                </div>

                {/* Botón de agregar al carrito */}
                <div className="mt-auto">
                  <AddToCartButton producto={producto} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
