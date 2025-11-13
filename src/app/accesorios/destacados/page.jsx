"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AccesoriosDestacadosPage() {
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarAccesorios = async () => {
      try {
        setLoading(true);
        const response = await fetch("/accesoriosDestacados.json");
        
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setAccesorios(data.accesorios || []);
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
      <div className="max-w-6xl mx-auto px-4">
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

        {/* Grid de productos */}
        {accesorios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No hay accesorios destacados disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {accesorios.map((accesorio) => (
              <div
                key={accesorio.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Imagen del producto */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={
                      accesorio.imagenPrincipal ||
                      (accesorio.imagenes && accesorio.imagenes.length > 0
                        ? accesorio.imagenes[0].url
                        : "/images/placeholder.png")
                    }
                    alt={accesorio.nombre}
                    fill={true}
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    loading="lazy"
                    quality={85}
                  />
                </div>

                {/* Información del producto */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors text-gray-900 dark:text-white">
                    {accesorio.nombre}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
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

                  {/* Botón de contacto */}
                  <a
                    href={`https://wa.me/573174503604?text=Hola,%20estoy%20interesad@%20en%20este%20accesorio:%20${encodeURIComponent(accesorio.nombre)}%20-%20$${accesorio.precio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium inline-flex items-center justify-center"
                  >
                    📱 Contactar por WhatsApp
                  </a>
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
              Explora toda nuestra colección de accesorios o contáctanos directamente
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/accesorios"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-md transition-colors font-medium"
              >
                Ver todos los accesorios
              </Link>
              <a
                href="https://wa.me/573174503604?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20sus%20productos"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md transition-colors font-medium"
              >
                📱 Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
