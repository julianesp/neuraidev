"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Search, Calendar, DollarSign, TrendingUp, Filter, Package, User, Phone, Mail, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import Link from "next/link";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function agruparPorMes(ventas) {
  const grupos = {};
  for (const v of ventas) {
    const fecha = new Date(v.fecha_venta);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(v);
  }
  return Object.entries(grupos).sort(([a], [b]) => b.localeCompare(a));
}

function labelMes(key) {
  const [year, month] = key.split('-');
  return `${MESES[parseInt(month) - 1]} ${year}`;
}

export default function VentasPage() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [mesesAbiertos, setMesesAbiertos] = useState({});

  // Filtros
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mes, setMes] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [valorMin, setValorMin] = useState("");
  const [valorMax, setValorMax] = useState("");

  // Cargar ventas
  const cargarVentas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (mes) {
        params.append('mes', mes); // Filtrar por mes completo YYYY-MM
      }
      if (metodoPago) params.append('metodo_pago', metodoPago);

      const res = await fetch(`/api/ventas?${params.toString()}`);
      if (!res.ok) throw new Error('Error cargando ventas');

      const data = await res.json();
      let ventasData = data.ventas || [];

      // Filtros adicionales en el cliente
      if (busquedaCliente) {
        ventasData = ventasData.filter(v =>
          v.cliente_nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
          v.producto_nombre?.toLowerCase().includes(busquedaCliente.toLowerCase())
        );
      }

      if (valorMin) {
        const min = parseFloat(valorMin);
        ventasData = ventasData.filter(v => (v.precio_venta * v.cantidad) >= min);
      }

      if (valorMax) {
        const max = parseFloat(valorMax);
        ventasData = ventasData.filter(v => (v.precio_venta * v.cantidad) <= max);
      }

      setVentas(ventasData);

      // Calcular estadísticas
      const totalVentas = ventasData.length;
      const totalIngresos = ventasData.reduce((sum, v) => sum + (v.precio_venta * v.cantidad), 0);
      const totalCostos = ventasData.reduce((sum, v) => sum + (v.precio_compra * v.cantidad), 0);
      const totalGanancias = totalIngresos - totalCostos;
      const promedio = totalVentas > 0 ? totalIngresos / totalVentas : 0;

      setStats({
        totalVentas,
        totalIngresos,
        totalGanancias,
        promedio
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, [mes, metodoPago]);

  // Recargar cuando cambian los filtros del cliente
  useEffect(() => {
    if (!loading) {
      cargarVentas();
    }
  }, [busquedaCliente, valorMin, valorMax]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-green-600" />
              Registro de Ventas
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Historial completo de ventas presenciales y online
            </p>
          </div>
          <Link
            href="/dashboard/ventas/nueva"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Nueva Venta Presencial
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-8 h-8" />
              <h3 className="text-lg font-semibold">Total Ventas</h3>
            </div>
            <p className="text-3xl font-bold">{stats.totalVentas}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-8 h-8" />
              <h3 className="text-lg font-semibold">Ingresos</h3>
            </div>
            <p className="text-3xl font-bold">${stats.totalIngresos.toLocaleString('es-CO')}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8" />
              <h3 className="text-lg font-semibold">Ganancias</h3>
            </div>
            <p className="text-3xl font-bold">${stats.totalGanancias.toLocaleString('es-CO')}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8" />
              <h3 className="text-lg font-semibold">Promedio</h3>
            </div>
            <p className="text-3xl font-bold">${stats.promedio.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente o producto..."
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos los métodos de pago</option>
            <option value="nequi">Nequi</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
          <div>
            <input
              type="number"
              placeholder="Valor mínimo"
              value={valorMin}
              onChange={(e) => setValorMin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Valor máximo"
              value={valorMax}
              onChange={(e) => setValorMax(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {(busquedaCliente || mes || metodoPago || valorMin || valorMax) && (
            <button
              onClick={() => {
                setBusquedaCliente("");
                setMes("");
                setMetodoPago("");
                setValorMin("");
                setValorMax("");
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de Ventas agrupadas por mes */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando ventas...</p>
        </div>
      ) : ventas.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay ventas registradas</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Registra tu primera venta presencial o espera ventas desde el sitio web</p>
          <Link href="/dashboard/ventas/nueva" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="w-5 h-5" /> Registrar Primera Venta
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {agruparPorMes(ventas).map(([mesKey, ventasMes]) => {
            const totalIngresosMes = ventasMes.reduce((s, v) => s + (v.precio_venta * v.cantidad), 0);
            const totalGananciasMes = ventasMes.reduce((s, v) => s + ((v.precio_venta - v.precio_compra) * v.cantidad), 0);
            const abierto = mesesAbiertos[mesKey] !== false; // abierto por defecto

            return (
              <div key={mesKey} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Cabecera del mes — clickeable */}
                <button
                  type="button"
                  onClick={() => setMesesAbiertos(prev => ({ ...prev, [mesKey]: !abierto }))}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{labelMes(mesKey)}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{ventasMes.length} venta{ventasMes.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos</p>
                      <p className="text-base font-bold text-green-600 dark:text-green-400">${totalIngresosMes.toLocaleString('es-CO')}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ganancias</p>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">${totalGananciasMes.toLocaleString('es-CO')}</p>
                    </div>
                    {abierto ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>

                {/* Totales en móvil */}
                <div className="sm:hidden px-5 pb-3 flex gap-4 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500">Ingresos</p>
                    <p className="text-sm font-bold text-green-600">${totalIngresosMes.toLocaleString('es-CO')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ganancias</p>
                    <p className="text-sm font-bold text-emerald-600">${totalGananciasMes.toLocaleString('es-CO')}</p>
                  </div>
                </div>

                {/* Ventas del mes */}
                {abierto && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {ventasMes.map((venta, index) => {
                      const totalVenta = venta.precio_venta * venta.cantidad;
                      const ganancia = (venta.precio_venta - venta.precio_compra) * venta.cantidad;
                      const margen = totalVenta > 0 ? (ganancia / totalVenta) * 100 : 0;

                      return (
                        <div key={venta.id || index} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{venta.producto_nombre}</h3>
                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">x{venta.cantidad}</span>
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">{venta.metodo_pago}</span>
                                <Link href={`/dashboard/ventas/editar/${venta.id}`}
                                  className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                                  <Pencil className="w-3 h-3" /> Editar
                                </Link>
                              </div>
                              <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(venta.fecha_venta).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {venta.cliente_nombre && <span className="flex items-center gap-1"><User className="w-3 h-3" />{venta.cliente_nombre}</span>}
                                {venta.cliente_telefono && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{venta.cliente_telefono}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Precio unit.</p>
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">${venta.precio_venta.toLocaleString('es-CO')}</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2.5">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total venta</p>
                              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">${totalVenta.toLocaleString('es-CO')}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Ganancia</p>
                              <p className="text-sm font-semibold text-green-600 dark:text-green-400">${ganancia.toLocaleString('es-CO')}</p>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2.5">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Margen</p>
                              <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{margen.toFixed(1)}%</p>
                            </div>
                          </div>

                          {venta.notas && (
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded p-2">
                              <strong>Notas:</strong> {venta.notas}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
