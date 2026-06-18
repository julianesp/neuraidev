"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Smartphone, Monitor, Tablet, LogIn } from "lucide-react";

const DEVICE_ICON = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

const DEVICE_LABEL = {
  mobile: "Móvil",
  tablet: "Tablet",
  desktop: "Computador",
};

export default function UsuariosPage() {
  const [logins, setLogins] = useState([]);
  const [stats, setStats] = useState({
    totalLogins: 0,
    uniqueUsers: 0,
    byDevice: {},
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user-logins");
      const data = await res.json();
      setLogins(data.logins || []);
      if (data.stats) setStats(data.stats);
    } catch {
      setLogins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6" /> Accesos de usuarios
        </h1>
        <button
          onClick={load}
          className="text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Refrescar
        </button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={Users}
          label="Usuarios únicos"
          value={stats.uniqueUsers}
          color="bg-blue-600"
        />
        <StatCard
          icon={LogIn}
          label="Accesos totales"
          value={stats.totalLogins}
          color="bg-indigo-600"
        />
        <StatCard
          icon={Smartphone}
          label="Desde móvil"
          value={stats.byDevice?.mobile || 0}
          color="bg-emerald-600"
        />
        <StatCard
          icon={Monitor}
          label="Desde PC"
          value={stats.byDevice?.desktop || 0}
          color="bg-purple-600"
        />
      </div>

      {/* Tabla de accesos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500 dark:text-gray-400">Cargando...</p>
        ) : logins.length === 0 ? (
          <p className="p-6 text-gray-500 dark:text-gray-400 italic">
            Aún no hay accesos registrados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Dispositivo</th>
                  <th className="px-4 py-3 font-semibold">Navegador / SO</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {logins.map((l) => {
                  const Icon = DEVICE_ICON[l.device_type] || Monitor;
                  return (
                    <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {l.user_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={l.user_image}
                              alt={l.user_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs font-bold">
                              {(l.user_name || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {l.user_name}
                            </p>
                            {l.user_email && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {l.user_email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
                          <Icon className="w-4 h-4" />
                          {DEVICE_LABEL[l.device_type] || "Desconocido"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                        {l.browser || "—"}
                        <span className="text-gray-400"> · </span>
                        {l.os || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatDate(l.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Se registra un acceso por usuario y día. Mostrando los últimos 500 accesos.
      </p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className={`${color} w-9 h-9 rounded-lg flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
