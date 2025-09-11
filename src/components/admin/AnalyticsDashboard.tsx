"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  stock: number;
  marca: string;
  imagenPrincipal?: string;
}

interface ProductoMasVendido {
  producto: Producto;
  cantidadVendida: number;
  ingresoTotal: number;
  gananciaEstimada: number;
}

interface ResumenVentas {
  totalVentas: number;
  ingresosBrutos: number;
  subtotal: number;
  descuentos: number;
  gananciaEstimada: number;
}

interface VentaPorCategoria {
  categoria: string;
  cantidad: number;
  ingresos: number;
}

interface TendenciaDiaria {
  fecha: string;
  ventasCount: number;
  ingresosTotales: number;
}

interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
}

interface ClienteFrecuente {
  cliente: Cliente;
  comprasCount: number;
  totalGastado: number;
}

interface AnalyticsData {
  productosMasVendidos: ProductoMasVendido[];
  resumenVentas: ResumenVentas;
  ventasPorCategoria: VentaPorCategoria[];
  productosBajoStock: Producto[];
  tendenciasDiarias: TendenciaDiaria[];
  clientesFrecuentes: ClienteFrecuente[];
  periodo: {
    desde?: string;
    hasta?: string;
  };
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fechaDesde) params.append('fechaDesde', fechaDesde);
      if (fechaHasta) params.append('fechaHasta', fechaHasta);
      
      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) throw new Error('Error al cargar analytics');
      
      const data = await response.json();
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (fechaDesde) params.append('fechaDesde', fechaDesde);
        if (fechaHasta) params.append('fechaHasta', fechaHasta);
        
        const response = await fetch(`/api/analytics?${params}`);
        if (!response.ok) throw new Error('Error al cargar analytics');
        
        const data = await response.json();
        setAnalyticsData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [fechaDesde, fechaHasta]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando analytics...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">📊 Analytics de Ventas</h2>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex gap-4 items-end">
          <div>
            <label htmlFor="fecha-desde-input" className="block text-sm font-medium text-gray-700">Desde</label>
            <input
              type="date"
              id="fecha-desde-input"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="fecha-hasta-input" className="block text-sm font-medium text-gray-700">Hasta</label>
            <input
              type="date"
              id="fecha-hasta-input"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Ventas</h3>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.resumenVentas.totalVentas}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Ingresos Brutos</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatPrice(analyticsData.resumenVentas.ingresosBrutos)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Ganancia Estimada</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatPrice(analyticsData.resumenVentas.gananciaEstimada)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Descuentos</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatPrice(analyticsData.resumenVentas.descuentos)}
          </p>
        </div>
      </div>

      {/* Productos Más Vendidos */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">🏆 Productos Más Vendidos</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Producto</th>
                <th className="text-left p-2">Categoría</th>
                <th className="text-right p-2">Cantidad Vendida</th>
                <th className="text-right p-2">Ingresos</th>
                <th className="text-right p-2">Ganancia Est.</th>
                <th className="text-right p-2">Stock Actual</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.productosMasVendidos.slice(0, 10).map((item) => (
                <tr key={item.producto.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <div className="flex items-center space-x-3">
                      {item.producto.imagenPrincipal && (
                        <Image 
                          src={item.producto.imagenPrincipal} 
                          alt={item.producto.nombre}
                          className="w-10 h-10 object-cover rounded"
                          width={40}
                          height={40}
                          priority={false}
                        />
                      )}
                      <div>
                        <div className="font-medium text-sm">{item.producto.nombre}</div>
                        <div className="text-xs text-gray-500">{item.producto.marca}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 text-sm">{item.producto.categoria}</td>
                  <td className="p-2 text-right font-medium">{item.cantidadVendida}</td>
                  <td className="p-2 text-right text-green-600">
                    {formatPrice(item.ingresoTotal)}
                  </td>
                  <td className="p-2 text-right text-blue-600">
                    {formatPrice(item.gananciaEstimada)}
                  </td>
                  <td className="p-2 text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.producto.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {item.producto.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por Categoría */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">📦 Ventas por Categoría</h3>
          <div className="space-y-3">
            {analyticsData.ventasPorCategoria.slice(0, 8).map((categoria) => (
              <div key={categoria.categoria} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{categoria.categoria}</span>
                  <span className="text-sm text-gray-500 ml-2">({categoria.cantidad} vendidos)</span>
                </div>
                <span className="text-green-600 font-medium">
                  {formatPrice(categoria.ingresos)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Productos con Bajo Stock */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">⚠️ Productos con Bajo Stock</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.productosBajoStock.map((producto) => (
              <div key={producto.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  {producto.imagenPrincipal && (
                    <Image 
                      src={producto.imagenPrincipal} 
                      alt={producto.nombre}
                      className="w-8 h-8 object-cover rounded"
                      width={32}
                      height={32}
                      priority={false}
                    />
                  )}
                  <div>
                    <div className="font-medium text-sm">{producto.nombre}</div>
                    <div className="text-xs text-gray-500">{producto.categoria}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  producto.stock === 0 
                    ? 'bg-red-100 text-red-800' 
                    : producto.stock <= 2 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {producto.stock} unidades
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clientes Frecuentes */}
      {analyticsData.clientesFrecuentes.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">👥 Clientes Más Frecuentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.clientesFrecuentes.slice(0, 6).map((cliente) => (
              <div key={cliente.cliente.id} className="p-4 border rounded-lg">
                <div className="font-medium">{cliente.cliente.nombre}</div>
                <div className="text-sm text-gray-500 mb-2">
                  {cliente.cliente.email || cliente.cliente.telefono || 'Sin contacto'}
                </div>
                <div className="flex justify-between text-sm">
                  <span>{cliente.comprasCount} compras</span>
                  <span className="text-green-600 font-medium">
                    {formatPrice(cliente.totalGastado)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}