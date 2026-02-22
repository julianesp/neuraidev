"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/auth/roles";
import { getSupabaseBrowserClient } from "@/lib/db";
import {
  Users,
  Mail,
  Bell,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

export default function SuscriptoresPage() {
  const { user, isLoaded } = useUser();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suscriptores, setSuscriptores] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    confirmados: 0,
    notificarTodos: 0,
  });

  useEffect(() => {
    async function checkAdmin() {
      if (isLoaded && user) {
        const adminStatus = await isAdmin(user);
        setUserIsAdmin(adminStatus);
        if (adminStatus) {
          loadSuscriptores();
        } else {
          setLoading(false);
        }
      } else if (isLoaded) {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [isLoaded, user]);

  const loadSuscriptores = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      let query = supabase
        .from('product_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtroActivo === 'activos') {
        query = query.eq('activo', true);
      } else if (filtroActivo === 'confirmados') {
        query = query.eq('confirmado', true);
      } else if (filtroActivo === 'inactivos') {
        query = query.eq('activo', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error cargando suscriptores:', error);
        return;
      }

      setSuscriptores(data || []);

      // Calcular estadísticas
      setStats({
        total: data.length,
        activos: data.filter(s => s.activo).length,
        confirmados: data.filter(s => s.confirmado).length,
        notificarTodos: data.filter(s => s.notificar_todos).length,
      });

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userIsAdmin) {
      loadSuscriptores();
    }
  }, [filtroActivo, userIsAdmin]);

  const descargarCSV = () => {
    const headers = ['Email', 'Nombre', 'Activo', 'Confirmado', 'Notificar Todos', 'Categorías', 'Fecha Registro'];
    const rows = suscriptores.map(s => [
      s.email,
      s.nombre || '',
      s.activo ? 'Sí' : 'No',
      s.confirmado ? 'Sí' : 'No',
      s.notificar_todos ? 'Sí' : 'No',
      s.categorias_interes?.join(', ') || '',
      new Date(s.created_at).toLocaleDateString('es-CO'),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `suscriptores_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!userIsAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Acceso Denegado</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Users className="w-8 h-8 text-purple-600" />
                Suscriptores de Notificaciones
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Usuarios suscritos a notificaciones de productos
              </p>
            </div>
            <button
              onClick={descargarCSV}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Suscriptores</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Activos</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.activos}</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Confirmados</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.confirmados}</p>
          </div>

          <div className="bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-8 h-8 text-pink-600" />
            </div>
            <p className="text-sm text-pink-600 dark:text-pink-400 mb-1">Todos los Productos</p>
            <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{stats.notificarTodos}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['todos', 'activos', 'confirmados', 'inactivos'].map((filtro) => (
              <button
                key={filtro}
                onClick={() => setFiltroActivo(filtro)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtroActivo === filtro
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filtro === 'todos' && 'Todos'}
                {filtro === 'activos' && 'Activos'}
                {filtro === 'confirmados' && 'Confirmados'}
                {filtro === 'inactivos' && 'Inactivos'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Suscriptores */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {suscriptores.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No hay suscriptores para mostrar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Preferencias
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Fecha Registro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {suscriptores.map((suscriptor) => (
                    <tr key={suscriptor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {suscriptor.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {suscriptor.nombre || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {suscriptor.activo ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium">
                              Activo
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium">
                              Inactivo
                            </span>
                          )}
                          {suscriptor.confirmado && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-medium">
                              Confirmado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {suscriptor.notificar_todos ? (
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            Todos los productos
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">
                            {suscriptor.categorias_interes?.join(', ') || 'Sin categorías'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(suscriptor.created_at).toLocaleDateString('es-CO')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Link de vuelta */}
        <div className="mt-8">
          <Link
            href="/admin"
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
          >
            ← Volver al Panel Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
