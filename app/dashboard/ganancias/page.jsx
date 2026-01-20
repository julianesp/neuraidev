"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function GananciasPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [periodo, setPeriodo] = useState('hoy');
  const [resumen, setResumen] = useState(null);
  const [productosTop, setProductosTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar resumen de ganancias
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function cargarDatos() {
      try {
        setLoading(true);
        setError(null);

        // Cargar resumen
        const resResumen = await fetch(`/api/ganancias/resumen?periodo=${periodo}`);
        if (!resResumen.ok) throw new Error('Error cargando resumen');
        const dataResumen = await resResumen.json();
        setResumen(dataResumen);

        // Cargar productos top
        const resProductos = await fetch('/api/ganancias/productos?ordenar=ganancia&limit=5');
        if (!resProductos.ok) throw new Error('Error cargando productos');
        const dataProductos = await resProductos.json();
        setProductosTop(dataProductos.productos || []);

      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [periodo, isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return <div className="p-6">Cargando...</div>;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            💰 Dashboard de Ganancias
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitorea tus ventas y ganancias en tiempo real
          </p>
        </div>

        {/* Selector de período */}
        <div className="mb-6 flex gap-2">
          {['hoy', 'semana', 'mes', 'todo'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                periodo === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-300">Error: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando datos...</p>
          </div>
        ) : resumen ? (
          <>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Ventas */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Ventas
                  </h3>
                  <span className="text-2xl">🛍️</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {resumen.total_ventas}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {resumen.unidades_vendidas} unidades
                </p>
              </div>

              {/* Ingresos Brutos */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ingresos Brutos
                  </h3>
                  <span className="text-2xl">💵</span>
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(resumen.ingresos_brutos)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Total vendido
                </p>
              </div>

              {/* Ganancia Neta */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-green-100">
                    Ganancia Neta
                  </h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-3xl font-bold">
                  {formatCurrency(resumen.ganancia_neta)}
                </p>
                <p className="text-sm text-green-100 mt-1">
                  Tu ganancia real
                </p>
              </div>

              {/* Margen Promedio */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Margen Promedio
                  </h3>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {formatPercent(resumen.margen_promedio)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  De ganancia
                </p>
              </div>
            </div>

            {/* Métodos de pago */}
            {Object.keys(resumen.metodos_pago || {}).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  💳 Métodos de Pago
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(resumen.metodos_pago).map(([metodo, stats]) => (
                    <div key={metodo} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize mb-1">
                        {metodo}
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.monto)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {stats.cantidad} ventas
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Productos más rentables */}
            {productosTop.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  🏆 Productos Más Rentables
                </h2>
                <div className="space-y-4">
                  {productosTop.map((producto, index) => (
                    <div
                      key={producto.producto_id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {producto.producto_nombre}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {producto.unidades_vendidas} unidades vendidas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(producto.ganancia_total)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Margen: {formatPercent(producto.margen_promedio)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/dashboard/ventas/nueva"
                className="block p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Registrar Venta</h3>
                    <p className="text-blue-100">Nueva venta rápida</p>
                  </div>
                  <span className="text-4xl">🛒</span>
                </div>
              </Link>

              <Link
                href="/dashboard/ventas"
                className="block p-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Ver Historial</h3>
                    <p className="text-purple-100">Todas las ventas</p>
                  </div>
                  <span className="text-4xl">📜</span>
                </div>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No hay datos de ventas aún
            </p>
            <Link
              href="/dashboard/ventas/nueva"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Registrar primera venta
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
