"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Search, Calendar, Download, Filter, DollarSign, Users } from "lucide-react";
import FormularioFactura from "@/components/dashboard/facturas/FormularioFactura";
import VistaFactura from "@/components/dashboard/facturas/VistaFactura";

export default function FacturasPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [facturaPreview, setFacturaPreview] = useState(null);
  const [facturaEditando, setFacturaEditando] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [mes, setMes] = useState("");
  const [valorMin, setValorMin] = useState("");
  const [valorMax, setValorMax] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  // Cargar facturas
  const cargarFacturas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (busqueda) params.append('busqueda', busqueda);
      if (mes) params.append('mes', mes);
      if (valorMin) params.append('valor_min', valorMin);
      if (valorMax) params.append('valor_max', valorMax);
      if (metodoPago) params.append('metodo_pago', metodoPago);

      // Agregar timestamp para evitar caché
      params.append('_t', Date.now().toString());

      console.log('🔍 Cargando facturas con filtros:', {
        busqueda,
        mes,
        valorMin,
        valorMax,
        metodoPago,
        url: `/api/facturas?${params.toString()}`
      });

      const res = await fetch(`/api/facturas?${params.toString()}`, {
        cache: 'no-store', // Forzar sin caché
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error HTTP:', res.status, errorText);
        throw new Error('Error cargando facturas');
      }

      const data = await res.json();
      console.log('✅ Facturas recibidas:', data.facturas?.length || 0);
      console.log('📊 Stats:', data.stats);

      if (data.facturas) {
        console.log('📋 Primera factura:', data.facturas[0]);
      }

      setFacturas(data.facturas || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('❌ Error cargando facturas:', error);
      alert('Error al cargar facturas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFacturas();
  }, [busqueda, mes, valorMin, valorMax, metodoPago]);

  const handleGuardarFactura = async (factura) => {
    try {
      // Determinar si es creación o actualización
      const isUpdate = !!factura.id;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch('/api/facturas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: factura.id, // Solo se usa en PUT
          numeroFactura: factura.numeroFactura,
          cliente: factura.cliente,
          clienteId: factura.clienteId,
          miContacto: factura.miContacto,
          servicios: factura.servicios,
          productos: factura.productos,
          total: factura.total,
          descuentoPorcentaje: factura.descuentoPorcentaje || 0,
          descuentoMonto: factura.descuentoMonto || 0,
          metodoPago: factura.metodoPago,
          notas: factura.notas,
          fecha: factura.fecha
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error guardando factura');
      }

      const data = await res.json();

      // Mostrar mensaje de éxito
      alert(data.mensaje || (isUpdate ? 'Factura actualizada exitosamente' : 'Factura creada exitosamente'));

      setFacturaPreview(data.factura);
      setFacturaEditando(null);
      setMostrarFormulario(false);

      // Recargar facturas
      cargarFacturas();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la factura: ' + error.message);
    }
  };

  const handleNuevaFactura = () => {
    setFacturaPreview(null);
    setFacturaEditando(null);
    setMostrarFormulario(true);
  };

  const handleVerFactura = (factura) => {
    setFacturaPreview(factura);
    setMostrarFormulario(false);
  };

  const handleEditarFactura = (factura) => {
    setFacturaEditando(factura);
    setFacturaPreview(null);
    setMostrarFormulario(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Facturación
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Genera facturas profesionales para servicios y productos
            </p>
          </div>
          <button
            onClick={handleNuevaFactura}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      {mostrarFormulario ? (
        <FormularioFactura
          facturaInicial={facturaEditando}
          onGuardar={handleGuardarFactura}
          onCancelar={() => {
            setMostrarFormulario(false);
            setFacturaEditando(null);
          }}
        />
      ) : facturaPreview ? (
        <VistaFactura
          factura={facturaPreview}
          onVolver={() => setFacturaPreview(null)}
          onEditar={() => handleEditarFactura(facturaPreview)}
        />
      ) : (
        <>
          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-8 h-8" />
                  <h3 className="text-lg font-semibold">Total Facturas</h3>
                </div>
                <p className="text-3xl font-bold">{stats.total_facturas}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-8 h-8" />
                  <h3 className="text-lg font-semibold">Suma Total</h3>
                </div>
                <p className="text-3xl font-bold">${stats.suma_total.toLocaleString('es-CO')}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-8 h-8" />
                  <h3 className="text-lg font-semibold">Promedio</h3>
                </div>
                <p className="text-3xl font-bold">${stats.promedio.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          )}

          {/* Búsqueda y Filtros */}
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
                  placeholder="Buscar por cliente o número..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="month"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  placeholder="Mes"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos los métodos de pago</option>
                <option value="efectivo">Efectivo</option>
                <option value="nequi">Nequi</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
              <div>
                <input
                  type="number"
                  placeholder="Valor mínimo"
                  value={valorMin}
                  onChange={(e) => setValorMin(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Valor máximo"
                  value={valorMax}
                  onChange={(e) => setValorMax(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              {(busqueda || mes || metodoPago || valorMin || valorMax) && (
                <button
                  onClick={() => {
                    setBusqueda("");
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

          {/* Lista de Facturas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {loading ? 'Cargando...' : `Facturas (${facturas.length})`}
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Cargando facturas...</p>
              </div>
            ) : facturas.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay facturas aún
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Crea tu primera factura haciendo clic en "Nueva Factura"
                </p>
                <button
                  onClick={handleNuevaFactura}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Crear Primera Factura
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {facturas.map((factura, index) => {
                  const servicios = typeof factura.servicios === 'string'
                    ? JSON.parse(factura.servicios)
                    : factura.servicios || [];
                  const productos = typeof factura.productos === 'string'
                    ? JSON.parse(factura.productos)
                    : factura.productos || [];

                  return (
                    <div
                      key={factura.id || index}
                      onClick={() => handleVerFactura({
                        ...factura,
                        numeroFactura: factura.numero_factura,
                        cliente: {
                          nombre: factura.cliente_nombre,
                          identificacion: factura.cliente_identificacion,
                          telefono: factura.cliente_telefono,
                          email: factura.cliente_email,
                          direccion: factura.cliente_direccion
                        },
                        miContacto: {
                          telefono: factura.mi_telefono,
                          email: factura.mi_email
                        },
                        servicios,
                        productos,
                        metodoPago: factura.metodo_pago
                      })}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm font-semibold text-blue-600">
                              {factura.numero_factura}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(factura.fecha).toLocaleDateString('es-CO')}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
                              {factura.metodo_pago}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {factura.cliente_nombre}
                          </h3>
                          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                            {servicios.length > 0 && (
                              <span>{servicios.length} servicio(s)</span>
                            )}
                            {productos.length > 0 && (
                              <span>{productos.length} producto(s)</span>
                            )}
                            {factura.descuento_porcentaje > 0 && (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                -{factura.descuento_porcentaje}% descuento
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${parseFloat(factura.total).toLocaleString('es-CO')}
                          </div>
                          {factura.descuento_monto > 0 && (
                            <div className="text-sm text-gray-500 line-through">
                              ${parseFloat(factura.subtotal).toLocaleString('es-CO')}
                            </div>
                          )}
                          <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            Descargar PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
