"use client";

import { useEffect, useState } from "react";
import { Eye, TrendingUp, Calendar, BarChart2 } from "lucide-react";

export default function VisitasAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/analytics/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Error al cargar estadísticas"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Eye className="w-5 h-5" /> Visitas al sitio
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
        No se pudieron cargar las visitas: {error}
      </div>
    );
  }

  const maxWeek = Math.max(...(data.weeks?.map((w) => w.visits) || [1]), 1);
  const maxMonth = Math.max(...(data.monthly?.map((m) => m.visits) || [1]), 1);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Eye className="w-5 h-5 text-blue-500" /> Visitas al sitio
      </h2>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hoy</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data.today.toLocaleString("es-CO")}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Este mes</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {data.monthTotal.toLocaleString("es-CO")}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total acumulado</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {data.allTimeTotal.toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {/* Semanas del mes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Visitas por semana (mes actual)
        </h3>
        <div className="space-y-3">
          {data.weeks?.map((w) => (
            <div key={w.label}>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>{w.label}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {w.visits.toLocaleString("es-CO")} visitas
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${maxWeek > 0 ? (w.visits / maxWeek) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-right">
          Total mes: <strong>{data.monthTotal.toLocaleString("es-CO")}</strong> visitas
        </p>
      </div>

      {/* Acumulado mensual */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4" /> Acumulado mensual
        </h3>
        {data.monthly?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Aún no hay datos mensuales</p>
        ) : (
          <div className="space-y-3">
            {data.monthly?.map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>{m.label}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {m.visits.toLocaleString("es-CO")} visitas
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${maxMonth > 0 ? (m.visits / maxMonth) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
