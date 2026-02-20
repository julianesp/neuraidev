"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Package, AlertCircle, Plus, Search, Filter } from "lucide-react";

export default function ProductosPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-12">
          <Link
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver al panel
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center">
                <Package className="mr-3" size={36} />
                Gestión de Productos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Administra el catálogo de productos de tu tienda
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <div className="flex items-start">
            <Package size={48} className="mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Catálogo de Productos</h2>
              <p className="text-purple-100 mb-4">
                Actualmente los productos se gestionan a través de la base de datos
                de Supabase. Esta interfaz te permitirá gestionar tu catálogo
                de forma visual y sencilla.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-sm text-purple-100">Total Productos</p>
                  <p className="text-3xl font-bold mt-1">-</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-sm text-purple-100">Activos</p>
                  <p className="text-3xl font-bold mt-1">-</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-sm text-purple-100">Sin Stock</p>
                  <p className="text-3xl font-bold mt-1">-</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-sm text-purple-100">Categorías</p>
                  <p className="text-3xl font-bold mt-1">-</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Características Próximamente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Plus className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Crear Productos
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Agrega nuevos productos con imágenes, precios y descripciones
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Search className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Búsqueda y Filtros
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Encuentra productos rápidamente con búsqueda avanzada
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">📦</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Control de Inventario
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Gestiona el stock y recibe alertas de productos bajos
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 text-xl">💰</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Gestión de Precios
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Actualiza precios, crea descuentos y promociones
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                <Filter className="text-pink-600 dark:text-pink-400" size={20} />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Categorización
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Organiza productos en categorías y subcategorías
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-400 text-xl">🖼️</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Gestión de Imágenes
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Sube y organiza múltiples imágenes por producto
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                🚧 Funcionalidad en Desarrollo
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                La interfaz de gestión de productos está en desarrollo. Esta
                funcionalidad te permitirá administrar tu catálogo completo desde
                una interfaz visual e intuitiva.
              </p>
              <p className="text-blue-800 dark:text-blue-200 mt-2">
                Por ahora, los productos se gestionan directamente en Supabase.
                Puedes acceder a tu base de datos para agregar o modificar productos.
              </p>
              <div className="mt-4 space-x-4">
                <Link
                  href="https://app.supabase.com"
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Ir a Supabase →
                </Link>
                <Link
                  href="/accesorios"
                  className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  Ver Catálogo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
