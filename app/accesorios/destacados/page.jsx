"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts } from "@/lib/productService";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/FavoriteButton";
import Advertisement from "@/components/Advertisement";
import { LayoutGrid, Columns } from "lucide-react";
import ProductoCascada from "@/components/ProductoCascada";

export default function AccesoriosDestacadosPage() {
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" o "cascade"

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

  // Anuncios de negocios locales
  const ads = [
    {
      businessName: "Tienda Local",
      description:
        "Abarrotes y productos básicos para tu hogar. Servicio a domicilio disponible.",
      imageUrl:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
      businessId: "tienda-local",
    },
    {
      businessName: "Panadería El Trigal",
      description:
        "Pan fresco todos los días. Especialistas en productos artesanales.",
      imageUrl:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
      businessId: "panaderia-el-trigal",
    },
    {
      businessName: "Ferretería Martínez",
      description:
        "Todo para construcción y reparaciones. Más de 20 años de experiencia.",
      imageUrl:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
      businessId: "ferreteria-martinez",
    },
    {
      businessName: "¿Tienes un negocio?",
      description:
        "Solicita tu espacio publicitario aquí y llega a más clientes en tu zona.",
      imageUrl:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
      linkUrl:
        "https://wa.me/573174503604?text=Hola,%20me%20interesa%20solicitar%20un%20espacio%20publicitario%20para%20mi%20negocio%20en%20NeuraIdev",
    },
  ];

  useEffect(() => {
    const cargarAccesorios = async () => {
      try {
        setLoading(true);

        // Cargar productos destacados desde Supabase
        const productosDestacados = await getFeaturedProducts(20);

        if (!productosDestacados || productosDestacados.length === 0) {
          console.warn('[AccesoriosDestacados] No se encontraron productos destacados');
        }

        setAccesorios(productosDestacados);
        setError(null);
      } catch (err) {
        console.error("Error al cargar accesorios destacados:", err);
        setError("No se pudieron cargar los accesorios destacados");
      } finally {
        setLoading(false);
      }
    };

    cargarAccesorios();
  }, []);

  if (loading) {
    return (
      <main className="py-14 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando accesorios destacados...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-14 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-14 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                🌟 Accesorios Destacados
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Descubre nuestra selección especial de productos destacados con la mejor calidad y precios increíbles
              </p>
            </div>

            {/* Breadcrumb */}
            <nav className="flex mb-8" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-600">
                    Inicio
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <Link href="/accesorios" className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-600 md:ml-2">
                      Accesorios
                    </Link>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">Destacados</span>
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

            {/* Grid de productos */}
            {accesorios.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">No hay accesorios destacados disponibles</p>
              </div>
            ) : viewMode === "cascade" ? (
              <ProductoCascada productos={accesorios} categorySlug="destacados" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {accesorios.map((accesorio) => (
                  <div
                    key={accesorio.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col"
                  >
                    {/* Imagen del producto con botón de favoritos */}
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                      <Link href={`/accesorios/${accesorio.categoria}/${accesorio.id}`}>
                        <Image
                          src={
                            accesorio.imagenPrincipal ||
                            (accesorio.imagenes && accesorio.imagenes.length > 0
                              ? accesorio.imagenes[0].url
                              : "/imageshttps://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen")
                          }
                          alt={accesorio.nombre}
                          fill={true}
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          loading="lazy"
                          quality={85}
                        />
                      </Link>

                      {/* Botón de favoritos en la esquina superior derecha */}
                      <div className="absolute top-2 right-2 z-10">
                        <FavoriteButton producto={accesorio} size="medium" />
                      </div>

                      {/* Badge de stock si está bajo */}
                      {accesorio.stock && accesorio.stock <= 5 && accesorio.stock > 0 && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          ¡Últimas {accesorio.stock}!
                        </div>
                      )}

                      {/* Badge de sin stock */}
                      {accesorio.stock === 0 && (
                        <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Sin stock
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="p-4 flex flex-col flex-grow">
                      <Link href={`/accesorios/${accesorio.categoria}/${accesorio.id}`}>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-yellow-600 transition-colors text-gray-900 dark:text-white cursor-pointer">
                          {accesorio.nombre}
                        </h3>
                      </Link>

                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                        {accesorio.descripcion}
                      </p>

                      {/* Categoría */}
                      <div className="mb-3">
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          {accesorio.categoria}
                        </span>
                      </div>

                      {/* Precio */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-xl text-green-600">
                          $
                          {typeof accesorio.precio === "number"
                            ? accesorio.precio.toLocaleString("es-CL")
                            : accesorio.precio}
                        </span>
                      </div>

                      {/* Botón de agregar al carrito */}
                      <div className="mt-auto">
                        <AddToCartButton producto={accesorio} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA final */}
            <div className="mt-12 text-center">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  ¿No encontraste lo que buscabas?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Explora toda nuestra colección de accesorios y productos
                </p>
                <Link
                  href="/accesorios"
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-md transition-colors font-medium"
                >
                  Ver todos los accesorios
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar - Advertisement */}
          <aside className="lg:w-80 flex-shrink-0">
            <Advertisement ads={ads} />
          </aside>
        </div>
      </div>
    </main>
  );
}
