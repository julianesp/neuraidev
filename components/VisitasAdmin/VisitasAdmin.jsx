"use client";

import { useEffect, useState } from "react";
import { Eye, TrendingUp, Calendar, BarChart2, Globe, MapPin, Smartphone, Monitor, Tablet } from "lucide-react";

const FLAG_URL = (code) => `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;

const DEVICE_ICON = {
  mobile: <Smartphone className="w-4 h-4" />,
  tablet: <Tablet className="w-4 h-4" />,
  desktop: <Monitor className="w-4 h-4" />,
};

function Bar({ value, max, color = "bg-blue-500" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function VisitasAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/analytics/stats")
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
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
  const maxCountry = Math.max(...(data.topCountries?.map((c) => c.visits) || [1]), 1);
  const maxCity = Math.max(...(data.topCities?.map((c) => c.visits) || [1]), 1);
  const maxPage = Math.max(...(data.topPages?.map((p) => p.visits) || [1]), 1);
  const totalDevices = data.devices?.reduce((s, d) => s + d.visits, 0) || 1;
  const hasGeoData = data.topCountries?.length > 0;

  return (
    <div className="mb-8 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Eye className="w-5 h-5 text-blue-500" /> Visitas al sitio
      </h2>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hoy</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.today.toLocaleString("es-CO")}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Este mes</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.monthTotal.toLocaleString("es-CO")}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total acumulado</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.allTimeTotal.toLocaleString("es-CO")}</p>
        </div>
      </div>

      {/* Semanas + Dispositivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Semanas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Visitas por semana
          </h3>
          <div className="space-y-3">
            {data.weeks?.map((w) => (
              <div key={w.label}>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>{w.label}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{w.visits.toLocaleString("es-CO")}</span>
                </div>
                <Bar value={w.visits} max={maxWeek} color="bg-blue-500" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-right">Total: <strong>{data.monthTotal.toLocaleString("es-CO")}</strong> visitas</p>
        </div>

        {/* Dispositivos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Dispositivos (este mes)
          </h3>
          {!hasGeoData ? (
            <p className="text-sm text-gray-400 text-center py-8">Los datos de dispositivos se recopilarán a partir de ahora</p>
          ) : (
            <div className="space-y-3">
              {data.devices?.map((d) => (
                <div key={d.device}>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span className="flex items-center gap-1.5 capitalize">
                      {DEVICE_ICON[d.device] || <Monitor className="w-4 h-4" />} {d.device}
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {d.visits} ({Math.round((d.visits / totalDevices) * 100)}%)
                    </span>
                  </div>
                  <Bar value={d.visits} max={totalDevices} color="bg-indigo-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Países + Ciudades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Países */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Top países (este mes)
          </h3>
          {!hasGeoData ? (
            <p className="text-sm text-gray-400 text-center py-8">Los datos de ubicación se recopilarán a partir de ahora</p>
          ) : (
            <div className="space-y-3">
              {data.topCountries?.map((c) => (
                <div key={c.country_code}>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      {c.country_code && c.country_code !== "XX" && (
                        <img src={FLAG_URL(c.country_code)} alt={c.country} className="w-5 h-3.5 object-cover rounded-sm" />
                      )}
                      {c.country || c.country_code}
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{c.visits.toLocaleString("es-CO")}</span>
                  </div>
                  <Bar value={c.visits} max={maxCountry} color="bg-green-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ciudades */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Top ciudades (este mes)
          </h3>
          {!hasGeoData || data.topCities?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Los datos de ciudades se recopilarán a partir de ahora</p>
          ) : (
            <div className="space-y-3">
              {data.topCities?.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{c.city}{c.country ? `, ${c.country}` : ""}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{c.visits.toLocaleString("es-CO")}</span>
                  </div>
                  <Bar value={c.visits} max={maxCity} color="bg-orange-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Páginas más visitadas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Páginas más visitadas (este mes)
        </h3>
        {!hasGeoData || data.topPages?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Los datos de páginas se recopilarán a partir de ahora</p>
        ) : (
          <div className="space-y-3">
            {data.topPages?.map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span className="font-mono truncate max-w-[70%]">{p.page}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{p.visits.toLocaleString("es-CO")}</span>
                </div>
                <Bar value={p.visits} max={maxPage} color="bg-rose-500" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acumulado mensual */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
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
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{m.visits.toLocaleString("es-CO")}</span>
                </div>
                <Bar value={m.visits} max={maxMonth} color="bg-purple-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
