"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, Bell, Shield, Palette, Globe, Gamepad2 } from "lucide-react";

export default function ConfiguracionPage() {
  const [minecraftButtonEnabled, setMinecraftButtonEnabled] = useState(false);

  useEffect(() => {
    // Cargar el estado actual del botón de tema Minecraft
    const enabled = localStorage.getItem('minecraft_theme_button_enabled');
    setMinecraftButtonEnabled(enabled === 'true');
  }, []);

  const handleMinecraftButtonToggle = (checked) => {
    setMinecraftButtonEnabled(checked);
    localStorage.setItem('minecraft_theme_button_enabled', checked.toString());

    // Mostrar mensaje de confirmación
    if (checked) {
      alert('✅ Botón de tema Minecraft habilitado. Los usuarios ahora podrán ver el botón flotante para cambiar al tema Minecraft.');
    } else {
      alert('❌ Botón de tema Minecraft deshabilitado. El botón flotante no será visible para los usuarios.');
    }

    // Recargar la página para que el cambio tome efecto
    window.location.reload();
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-12">
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

          {/* Minecraft Theme Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Gamepad2 className="mr-3 text-purple-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tema Minecraft
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">⛏️</span>
                    Mostrar Botón de Tema Minecraft
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Activa o desactiva el botón flotante que permite a los usuarios cambiar al tema Minecraft.
                    <br />
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                      ⚠️ El tema aún está en construcción. Activa esto solo cuando esté listo para producción.
                    </span>
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={minecraftButtonEnabled}
                    onChange={(e) => handleMinecraftButtonToggle(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                </label>
              </div>

              {minecraftButtonEnabled && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    ✅ <strong>Botón activo:</strong> Los usuarios ahora pueden ver el botón flotante de tema Minecraft debajo del botón de accesibilidad.
                  </p>
                </div>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  📝 Características del Tema Minecraft:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Fuente pixelada estilo retro</li>
                  <li>Botones con texturas de bloques (piedra, diamante, esmeralda, oro)</li>
                  <li>Efectos de hover y animaciones únicas</li>
                  <li>Inputs y formularios con estilo de juego</li>
                  <li>Scrollbar personalizado</li>
                  <li>Cards y contenedores con texturas de Minecraft</li>
                </ul>
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
