"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Settings, Bell, Shield, Palette, Globe } from "lucide-react";

export default function ConfiguracionPage() {
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
            <Settings className="mr-3" size={36} />
            Configuración
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administra las configuraciones del sitio
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Globe className="mr-3 text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configuración General
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Sitio
                </label>
                <input
                  type="text"
                  defaultValue="Neurai.dev"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción del Sitio
                </label>
                <textarea
                  rows="3"
                  defaultValue="Tienda de tecnología y accesorios en Colombia"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Blog Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Palette className="mr-3 text-purple-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configuración del Blog
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Comentarios
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Permitir comentarios en los artículos
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Compartir en Redes Sociales
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrar botones de compartir
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Bell className="mr-3 text-yellow-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Notificaciones por Email
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recibir notificaciones de nuevos comentarios
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Shield className="mr-3 text-green-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Seguridad
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-2">
                  Autenticación
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  La autenticación está gestionada por Clerk
                </p>
                <Link
                  href="https://dashboard.clerk.com"
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Ir a Dashboard de Clerk
                </Link>
              </div>
            </div>
          </div>

          {/* Coming Soon Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              🚧 En Desarrollo
            </h3>
            <p className="text-blue-800 dark:text-blue-200">
              Esta página de configuración está en desarrollo. Próximamente podrás
              personalizar más aspectos del sitio desde aquí, como:
            </p>
            <ul className="list-disc list-inside mt-2 text-blue-800 dark:text-blue-200 space-y-1">
              <li>Configuración de SEO global</li>
              <li>Integración con analytics (Google Analytics, etc.)</li>
              <li>Configuración de email y notificaciones</li>
              <li>Personalización de tema y colores</li>
              <li>Configuración de redes sociales</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
