// components/admin/AdminDashboard.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  Star,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import { useStats } from "../../hooks/useStats";
import { useAnunciosApi } from "../../hooks/useAnunciosApi";

const AdminDashboard = () => {
  const { stats, loading: statsLoading, refresh: refreshStats } = useStats();
  const {
    anuncios,
    loading: anunciosLoading,
    loadAnuncios,
  } = useAnunciosApi({ limit: 5 });

  const [timeFilter, setTimeFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Actualizar datos
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshStats(), loadAnuncios()]);
    } finally {
      setRefreshing(false);
    }
  };

  // Componente de tarjeta de estadística
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "blue",
    trend,
    subtitle,
  }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp
                className={`w-4 h-4 mr-1 ${trend > 0 ? "text-green-500" : "text-red-500"}`}
              />
              <span
                className={`text-sm ${trend > 0 ? "text-green-500" : "text-red-500"}`}
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  // Componente de anuncio reciente
  const RecentAnuncioCard = ({ anuncio }) => (
    <div className="flex items-center p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        {anuncio.featured ? (
          <Star className="w-6 h-6 text-yellow-500" />
        ) : (
          <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
        )}
      </div>
      <div className="ml-4 flex-1">
        <h4 className="text-sm font-semibold text-gray-900">
          {anuncio.business_name}
        </h4>
        <p className="text-sm text-gray-500 truncate">{anuncio.description}</p>
        <div className="flex items-center mt-1 space-x-4">
          <span className="text-xs text-gray-400">
            {new Date(anuncio.created_at).toLocaleDateString()}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              anuncio.active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {anuncio.active ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Eye className="w-4 h-4" />
        <span>{anuncio.views_count || 0}</span>
        <MousePointer className="w-4 h-4 ml-2" />
        <span>{anuncio.clicks_count || 0}</span>
      </div>
    </div>
  );

  if (statsLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen de actividad de anuncios</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Anuncios"
          value={stats?.total_anuncios}
          icon={BarChart3}
          color="blue"
          subtitle="Todos los anuncios"
        />
        <StatCard
          title="Anuncios Activos"
          value={stats?.anuncios_activos}
          icon={Users}
          color="green"
          subtitle="Publicados actualmente"
        />
        <StatCard
          title="Anuncios Destacados"
          value={stats?.anuncios_destacados}
          icon={Star}
          color="yellow"
          subtitle="Con prioridad"
        />
        <StatCard
          title="Total Vistas"
          value={stats?.total_vistas}
          icon={Eye}
          color="purple"
          subtitle="Impresiones totales"
        />
      </div>

      {/* Gráficos y métricas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución por categorías */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Categorías
          </h3>
          <div className="space-y-3">
            {stats?.categorias_count &&
              Object.entries(stats.categorias_count).map(
                ([category, count]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 capitalize">
                      {category}
                    </span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{
                            width: `${(count / stats.anuncios_activos) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {count}
                      </span>
                    </div>
                  </div>
                ),
              )}
          </div>
        </div>

        {/* Métricas de rendimiento */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Métricas de Rendimiento
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Total Vistas</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {stats?.total_vistas || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MousePointer className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Total Clicks</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {stats?.total_clicks || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-sm text-gray-600">CTR Promedio</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {stats?.total_vistas
                  ? ((stats.total_clicks / stats.total_vistas) * 100).toFixed(
                      2,
                    ) + "%"
                  : "0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <Link
              href="/admin/anuncios/crear"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Crear Anuncio
            </Link>
            <Link
              href="/admin/anuncios"
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center font-medium"
            >
              <Filter className="w-4 h-4 mr-2" />
              Gestionar Anuncios
            </Link>
            <button className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center font-medium">
              <Download className="w-4 h-4 mr-2" />
              Exportar Datos
            </button>
          </div>
        </div>
      </div>

      {/* Anuncios recientes y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anuncios recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Anuncios Recientes
              </h3>
              <Link
                href="/admin/anuncios"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todos
              </Link>
            </div>
          </div>
          <div className="p-6">
            {anunciosLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : anuncios.length > 0 ? (
              <div className="space-y-4">
                {anuncios.slice(0, 5).map((anuncio) => (
                  <RecentAnuncioCard key={anuncio.id} anuncio={anuncio} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-xl mb-2">📝</div>
                <p className="text-gray-500">No hay anuncios recientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertas y notificaciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Alertas y Notificaciones
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.anuncios_inactivos > 0 && (
                <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Anuncios Inactivos
                    </p>
                    <p className="text-sm text-yellow-700">
                      Tienes {stats.anuncios_inactivos} anuncios inactivos que
                      podrían necesitar atención.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Rendimiento General
                  </p>
                  <p className="text-sm text-blue-700">
                    Tus anuncios han recibido {stats?.total_vistas || 0} vistas
                    en total.
                  </p>
                </div>
              </div>

              <div className="flex items-start p-3 bg-green-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Sistema Actualizado
                  </p>
                  <p className="text-sm text-green-700">
                    Todas las funcionalidades están operando normalmente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
