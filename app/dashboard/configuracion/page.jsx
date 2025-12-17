"use client";

import { useUser } from "@clerk/nextjs";
import { Settings, User, Bell, Shield, Palette, Database } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";

export default function ConfiguracionPage() {
  const { user } = useUser();
  const toast = useToast();
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyStock, setNotifyStock] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar preferencias al montar el componente
  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();

      if (response.ok) {
        setNotifyOrders(data.notify_new_orders ?? true);
        setNotifyStock(data.notify_low_stock ?? true);
      }
    } catch (error) {
      console.error('Error cargando preferencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });

      const data = await response.json();

      if (response.ok) {
        toast?.success('Preferencias actualizadas');
      } else {
        toast?.error(data.error || 'Error al actualizar preferencias');
        // Revertir el cambio
        if (key === 'notify_new_orders') setNotifyOrders(!value);
        if (key === 'notify_low_stock') setNotifyStock(!value);
      }
    } catch (error) {
      console.error('Error actualizando preferencias:', error);
      toast?.error('Error al actualizar preferencias');
      // Revertir el cambio
      if (key === 'notify_new_orders') setNotifyOrders(!value);
      if (key === 'notify_low_stock') setNotifyStock(!value);
    } finally {
      setSaving(false);
    }
  };

  const handleOrdersToggle = () => {
    const newValue = !notifyOrders;
    setNotifyOrders(newValue);
    updatePreference('notify_new_orders', newValue);
  };

  const handleStockToggle = () => {
    const newValue = !notifyStock;
    setNotifyStock(newValue);
    updatePreference('notify_low_stock', newValue);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configuración
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las preferencias de tu cuenta y tienda
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Perfil
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={user?.fullName || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={user?.primaryEmailAddress?.emailAddress || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Para editar tu perfil, usa el menú de usuario en la esquina superior derecha.
              </p>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Notificaciones
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Nuevos pedidos</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recibe notificaciones de nuevos pedidos</p>
                </div>
                <label htmlFor="notify-orders" className="relative inline-flex items-center cursor-pointer">
                  <span className="sr-only">Activar notificaciones de nuevos pedidos</span>
                  <input
                    id="notify-orders"
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifyOrders}
                    onChange={handleOrdersToggle}
                    disabled={loading || saving}
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${(loading || saving) ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Stock bajo</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alertas cuando el stock sea menor a 5 unidades</p>
                </div>
                <label htmlFor="notify-stock" className="relative inline-flex items-center cursor-pointer">
                  <span className="sr-only">Activar alertas de stock bajo</span>
                  <input
                    id="notify-stock"
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifyStock}
                    onChange={handleStockToggle}
                    disabled={loading || saving}
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${(loading || saving) ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                </label>
              </div>
              {loading && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cargando preferencias...
                </p>
              )}
              {saving && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Guardando...
                </p>
              )}
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Apariencia
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tema
                </label>
                <select
                  id="theme-select"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white opacity-50"
                >
                  <option>Sistema</option>
                  <option>Claro</option>
                  <option>Oscuro</option>
                </select>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Usa el botón de modo oscuro/claro en la parte superior para cambiar el tema.
              </p>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Seguridad
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-2">Autenticación</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Tu cuenta está protegida por Clerk Authentication
                </p>
                <button
                  disabled
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cambiar contraseña (Próximamente)
                </button>
              </div>
            </div>
          </div>

          {/* Database */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Base de Datos
              </h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Estado:</strong> Conectado a Supabase
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
