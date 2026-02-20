"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Package, AlertCircle } from "lucide-react";

export default function OrdenesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver al panel
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center">
            <ShoppingCart className="mr-3" size={36} />
            Gestión de Órdenes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administra los pedidos de tus clientes
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <div className="flex items-start">
            <Package size={48} className="mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Sistema de Órdenes</h2>
              <p className="text-blue-100 mb-4">
                Esta sección te permitirá gestionar todas las órdenes de compra de
                tu tienda. Podrás ver el estado de los pedidos, actualizar el estado
                de envío, y comunicarte con tus clientes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-sm text-blue-100">Órdenes Totales</p>
                  <p className="text-3xl font-bold mt-1">0</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-sm text-blue-100">Pendientes</p>
                  <p className="text-3xl font-bold mt-1">0</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-sm text-blue-100">Completadas</p>
                  <p className="text-3xl font-bold mt-1">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Características Próximamente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-xl">📋</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Lista de Órdenes
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Visualiza todas las órdenes con filtros por estado, fecha y cliente
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-xl">🔄</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Actualización de Estado
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Cambia el estado de las órdenes: pendiente, enviado, entregado
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">💬</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Notificaciones
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Envía notificaciones automáticas a clientes sobre sus pedidos
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 text-xl">📊</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Reportes
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Genera reportes de ventas, productos más vendidos y más
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                🚧 Funcionalidad en Desarrollo
              </h3>
              <p className="text-yellow-800 dark:text-yellow-200">
                El sistema de gestión de órdenes está actualmente en desarrollo. Esta
                funcionalidad te permitirá administrar todos los pedidos de tu tienda
                desde un solo lugar.
              </p>
              <p className="text-yellow-800 dark:text-yellow-200 mt-2">
                Por ahora, las órdenes se gestionan a través de ePayco. Puedes revisar
                las transacciones en tu panel de ePayco.
              </p>
              <Link
                href="https://dashboard.epayco.com"
                target="_blank"
                className="inline-flex items-center mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
              >
                Ir a Dashboard de ePayco →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
