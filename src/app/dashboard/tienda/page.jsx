"use client";

import { useUser } from "@clerk/nextjs";
import { Store, MapPin, Phone, Mail, Clock, Globe, Power, AlertCircle } from "lucide-react";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MiTiendaPage() {
  const { user } = useUser();
  const [storeStatus, setStoreStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // Cargar estado de la tienda
  useEffect(() => {
    fetchStoreStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStoreStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('StoreStatus')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      setStoreStatus(data);
    } catch (error) {
      console.error('Error al cargar estado:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStoreStatus = async () => {
    if (!storeStatus) return;

    setSaving(true);
    try {
      const newStatus = !storeStatus.is_open;

      const { error } = await supabase
        .from('StoreStatus')
        .update({
          is_open: newStatus,
          manual_override: true,
          override_until: null, // Override indefinido hasta cambio manual
          updated_by: user?.emailAddresses[0]?.emailAddress
        })
        .eq('id', 1);

      if (error) throw error;

      setStoreStatus({ ...storeStatus, is_open: newStatus, manual_override: true });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado de la tienda');
    } finally {
      setSaving(false);
    }
  };

  const setAutomaticSchedule = async () => {
    if (!storeStatus) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('StoreStatus')
        .update({
          manual_override: false,
          override_until: null,
          updated_by: user?.emailAddresses[0]?.emailAddress
        })
        .eq('id', 1);

      if (error) throw error;

      await fetchStoreStatus();
      alert('Horario automático activado (8:00 AM - 6:00 PM)');
    } catch (error) {
      console.error('Error al activar horario automático:', error);
      alert('Error al activar horario automático');
    } finally {
      setSaving(false);
    }
  };

  const updateSchedule = async (openTime, closeTime) => {
    if (!storeStatus) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('StoreStatus')
        .update({
          open_time: openTime,
          close_time: closeTime,
          updated_by: user?.emailAddresses[0]?.emailAddress
        })
        .eq('id', 1);

      if (error) throw error;

      await fetchStoreStatus();
    } catch (error) {
      console.error('Error al actualizar horario:', error);
      alert('Error al actualizar el horario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mi Tienda
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona la información de tu tienda online
          </p>
        </div>

        {/* Store Status Control Card */}
        {!loading && storeStatus && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Power className="w-6 h-6" />
                  Estado de la Tienda
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {storeStatus.manual_override
                    ? "Control manual activo"
                    : `Horario automático: ${storeStatus.open_time} - ${storeStatus.close_time}`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  storeStatus.is_open
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    storeStatus.is_open ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="font-semibold">
                    {storeStatus.is_open ? 'Abierta' : 'Cerrada'}
                  </span>
                </div>

                <button
                  onClick={toggleStoreStatus}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    storeStatus.is_open
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saving ? 'Guardando...' : storeStatus.is_open ? 'Cerrar Tienda' : 'Abrir Tienda'}
                </button>
              </div>
            </div>

            {storeStatus.manual_override && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      Control manual activo
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      La tienda no seguirá el horario automático hasta que desactives el control manual.
                    </p>
                    <button
                      onClick={setAutomaticSchedule}
                      disabled={saving}
                      className="mt-2 px-4 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      Volver a horario automático
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {loading ? 'Cargando...' : storeStatus?.is_open ? 'Abierta' : 'Cerrada'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Visitas este mes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Desde</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Información de la Tienda
          </h2>

          <div className="space-y-6">
            {/* Store Name */}
            <div>
              <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la Tienda
              </p>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Store className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900 dark:text-white font-medium">Neurai.dev</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </p>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">{user?.primaryEmailAddress?.emailAddress || 'No configurado'}</span>
                </div>
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </p>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">No configurado</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección
              </p>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900 dark:text-white">No configurado</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                disabled
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Editar Información (Próximamente)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
