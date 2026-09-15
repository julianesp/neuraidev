"use client";

import { useState, useEffect } from "react";
import { Users, Search, RefreshCw, Menu, TrendingUp, ShoppingBag, Repeat } from "lucide-react";
import { useSidebar } from "../layout";

export default function CompradoresPage() {
  const { toggleSidebar } = useSidebar();
  const [compradores, setCompradores] = useState([]);
  const [stats, setStats] = useState({
    total_compradores: 0,
    total_ordenes: 0,
    ingresos_totales: 0,
    recurrentes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCompradores = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard/compradores");
      if (!res.ok) throw new Error("Error al obtener compradores");
      const data = await res.json();
      setCompradores(data.compradores || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Error fetching compradores:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompradores();
  }, []);

  const formatCurrency = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(n || 0);

  const formatDate = (d) => {
    if (!d) return "—";
    return new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(d));
  };

  const filtrados = compradores.filter((c) => {
    const t = searchTerm.toLowerCase();
    return (
      !t ||
      c.nombre?.toLowerCase().includes(t) ||
      c.email?.toLowerCase().includes(t) ||
      c.telefono?.includes(t)
    );
  });

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Users className="text-blue-600 dark:text-blue-400" size={26} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compradores</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Quienes han comprado de verdad, derivado de las órdenes pagadas.
            </p>
          </div>
        </div>
        <button
          onClick={fetchCompradores}
          className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          title="Actualizar"
          aria-label="Actualizar"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Users size={18} />} label="Compradores" value={stats.total_compradores} />
        <StatCard icon={<ShoppingBag size={18} />} label="Órdenes pagadas" value={stats.total_ordenes} />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Ingresos totales"
          value={formatCurrency(stats.ingresos_totales)}
        />
        <StatCard icon={<Repeat size={18} />} label="Recurrentes" value={stats.recurrentes} />
      </div>

      {/* Búsqueda */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono…"
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>
        ) : loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3" />
            Cargando compradores…
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? "Sin resultados para tu búsqueda." : "Aún no hay compradores registrados."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <Th>Comprador</Th>
                  <Th>Contacto</Th>
                  <Th className="text-center">Compras</Th>
                  <Th className="text-center">Artículos</Th>
                  <Th className="text-right">Total gastado</Th>
                  <Th>Última compra</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtrados.map((c, i) => (
                  <tr key={c.email || c.nombre + i} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{c.nombre}</div>
                      {c.ciudad && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{c.ciudad}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.email && (
                        <div className="text-gray-700 dark:text-gray-300">{c.email}</div>
                      )}
                      {c.telefono && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{c.telefono}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.total_compras > 1
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {c.total_compras}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                      {c.total_articulos}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(c.total_gastado)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {formatDate(c.ultima_compra)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}
