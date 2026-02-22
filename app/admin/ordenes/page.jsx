"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/auth/roles";
import { getSupabaseBrowserClient } from "@/lib/db";
import {
  ShoppingCart,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  Download,
  DollarSign,
  TrendingUp,
  Filter,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";

export default function OrdenesPage() {
  const { user, isLoaded } = useUser();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ordenes, setOrdenes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [periodoFiltro, setPeriodoFiltro] = useState('todos');
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    totalIngresos: 0,
    ordenesCompletadas: 0,
    ordenesPendientes: 0,
    productosVendidos: 0
  });

  // Verificar permisos de admin
  useEffect(() => {
    async function checkAdmin() {
      if (isLoaded && user) {
        const adminStatus = await isAdmin(user);
        setUserIsAdmin(adminStatus);
        if (adminStatus) {
          loadOrdenes();
        } else {
          setLoading(false);
        }
      } else if (isLoaded) {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [isLoaded, user]);

  // Cargar órdenes con filtros
  const loadOrdenes = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtro por estado
      if (filtroEstado !== 'todos') {
        query = query.eq('estado', filtroEstado);
      }

      // Filtro por período
      if (periodoFiltro !== 'todos') {
        const now = new Date();
        let startDate;

        switch (periodoFiltro) {
          case 'hoy':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            query = query.gte('created_at', startDate.toISOString());
            break;

          case 'semana':
            startDate = new Date(now.setDate(now.getDate() - 7));
            query = query.gte('created_at', startDate.toISOString());
            break;

          case 'mes':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            query = query.gte('created_at', startDate.toISOString());
            break;

          case 'mes-especifico':
            if (mesSeleccionado) {
              const [year, month] = mesSeleccionado.split('-');
              const start = new Date(parseInt(year), parseInt(month) - 1, 1);
              const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
              query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
            }
            break;

          case 'personalizado':
            if (fechaInicio) {
              query = query.gte('created_at', new Date(fechaInicio).toISOString());
            }
            if (fechaFin) {
              const endDate = new Date(fechaFin);
              endDate.setHours(23, 59, 59);
              query = query.lte('created_at', endDate.toISOString());
            }
            break;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error cargando órdenes:', error);
        return;
      }

      setOrdenes(data || []);
      calcularEstadisticas(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = (ordenesData) => {
    const completadas = ordenesData.filter(o => o.estado === 'completado' || o.estado_pago === 'completado');
    const pendientes = ordenesData.filter(o => o.estado === 'pendiente');

    const totalIngresos = completadas.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

    // Calcular productos vendidos desde metadata
    const productosVendidos = completadas.reduce((sum, o) => {
      const productos = o.metadata?.productos || o.productos || [];
      return sum + productos.reduce((pSum, prod) => pSum + (prod.cantidad || prod.quantity || 0), 0);
    }, 0);

    setEstadisticas({
      totalVentas: completadas.length,
      totalIngresos: totalIngresos,
      ordenesCompletadas: completadas.length,
      ordenesPendientes: pendientes.length,
      productosVendidos: productosVendidos
    });
  };

  // Recargar al cambiar filtros
  useEffect(() => {
    if (userIsAdmin) {
      loadOrdenes();
    }
  }, [filtroEstado, periodoFiltro, mesSeleccionado, fechaInicio, fechaFin, userIsAdmin]);

  // Generar y descargar reporte PDF
  const descargarReportePDF = () => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('REPORTE DE VENTAS', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Neurai.dev', 105, 30, { align: 'center' });

      let y = 50;

      // Período
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(10);
      let periodoTexto = 'Todos los tiempos';
      if (periodoFiltro === 'mes-especifico' && mesSeleccionado) {
        const [year, month] = mesSeleccionado.split('-');
        const fecha = new Date(parseInt(year), parseInt(month) - 1);
        periodoTexto = fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
      } else if (periodoFiltro !== 'todos') {
        periodoTexto = periodoFiltro.charAt(0).toUpperCase() + periodoFiltro.slice(1);
      }
      doc.text(`Periodo: ${periodoTexto}`, 20, y);
      doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 20, y + 7);

      y += 20;

      // Estadísticas
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('RESUMEN', 20, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total de ventas completadas: ${estadisticas.totalVentas}`, 20, y);
      y += 7;
      doc.text(`Ingresos totales: $${estadisticas.totalIngresos.toLocaleString('es-CO')}`, 20, y);
      y += 7;
      doc.text(`Productos vendidos: ${estadisticas.productosVendidos}`, 20, y);
      y += 7;
      doc.text(`Ordenes pendientes: ${estadisticas.ordenesPendientes}`, 20, y);

      y += 15;

      // Lista de órdenes completadas
      const ordenesCompletadas = ordenes.filter(o => o.estado === 'completado' || o.estado_pago === 'completado');

      if (ordenesCompletadas.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('DETALLE DE VENTAS', 20, y);
        y += 10;

        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');

        ordenesCompletadas.forEach((orden, index) => {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }

          doc.setFont(undefined, 'bold');
          doc.text(`${index + 1}. ${orden.numero_orden}`, 20, y);
          y += 5;

          doc.setFont(undefined, 'normal');
          doc.text(`Fecha: ${new Date(orden.fecha_pago || orden.created_at).toLocaleDateString('es-CO')}`, 25, y);
          y += 5;
          doc.text(`Cliente: ${orden.customer_name}`, 25, y);
          y += 5;
          doc.text(`Email: ${orden.customer_email}`, 25, y);
          y += 5;
          doc.text(`Total: $${parseFloat(orden.total).toLocaleString('es-CO')}`, 25, y);
          y += 5;
          doc.text(`Metodo: ${orden.metodo_pago || 'N/A'}`, 25, y);
          y += 5;

          const productos = orden.metadata?.productos || orden.productos || [];
          productos.forEach((prod) => {
            if (y > 260) {
              doc.addPage();
              y = 20;
            }
            const nombre = prod.name || prod.nombre || 'Producto';
            const cantidad = prod.quantity || prod.cantidad || 1;
            doc.text(`- ${nombre} (x${cantidad})`, 30, y);
            y += 4;
          });

          y += 3;
        });
      }

      // Footer
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 280, 210, 17, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Neurai.dev - Reporte generado automaticamente', 105, 290, { align: 'center' });

      // Guardar
      const nombreArchivo = `Reporte_Ventas_${periodoTexto.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nombreArchivo);

      alert('Reporte descargado exitosamente');
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
    }
  };

  // Generar opciones de meses (últimos 12 meses)
  const generarOpcionesMeses = () => {
    const opciones = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const valor = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const texto = fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
      opciones.push({ valor, texto });
    }

    return opciones;
  };

  // Formatear estado
  const getEstadoBadge = (orden) => {
    const estado = orden.estado_pago || orden.estado;

    if (estado === 'completado' || estado === 'pagado') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
        <CheckCircle className="w-4 h-4" />
        Completado
      </span>;
    } else if (estado === 'pendiente') {
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 rounded-full text-sm font-medium flex items-center gap-1">
        <Clock className="w-4 h-4" />
        Pendiente
      </span>;
    } else if (estado === 'cancelado' || estado === 'rechazado') {
      return <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-full text-sm font-medium flex items-center gap-1">
        <XCircle className="w-4 h-4" />
        Cancelado
      </span>;
    } else {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
        {estado}
      </span>;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!userIsAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tienes permisos para acceder a esta página
          </p>
          <Link
            href="/admin"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Volver al Dashboard
          </Link>
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
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                Gestión de Órdenes
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Administra todas las ventas y pedidos
              </p>
            </div>
            <button
              onClick={descargarReportePDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Descargar Reporte PDF
            </button>
          </div>
        </div>

        {/* Filtros de Período */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Filtrar por Período
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {['todos', 'hoy', 'semana', 'mes', 'mes-especifico', 'personalizado'].map((periodo) => (
              <button
                key={periodo}
                onClick={() => setPeriodoFiltro(periodo)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  periodoFiltro === periodo
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {periodo === 'todos' && 'Todo el historial'}
                {periodo === 'hoy' && 'Hoy'}
                {periodo === 'semana' && 'Esta semana'}
                {periodo === 'mes' && 'Este mes'}
                {periodo === 'mes-especifico' && 'Mes específico'}
                {periodo === 'personalizado' && 'Rango personalizado'}
              </button>
            ))}
          </div>

          {/* Selector de mes específico */}
          {periodoFiltro === 'mes-especifico' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selecciona el mes:
              </label>
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="w-full md:w-auto px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none"
              >
                <option value="">Selecciona un mes...</option>
                {generarOpcionesMeses().map(({ valor, texto }) => (
                  <option key={valor} value={valor}>
                    {texto.charAt(0).toUpperCase() + texto.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rango personalizado */}
          {periodoFiltro === 'personalizado' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha inicial:
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha final:
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas del período */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8" />
            </div>
            <p className="text-sm opacity-90 mb-1">Ingresos Totales</p>
            <p className="text-3xl font-bold">
              ${estadisticas.totalIngresos.toLocaleString('es-CO')}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Ventas Completadas</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">
              {estadisticas.totalVentas}
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
              {estadisticas.ordenesPendientes}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Productos Vendidos</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {estadisticas.productosVendidos}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Ticket Promedio</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
              ${estadisticas.totalVentas > 0 ? Math.round(estadisticas.totalIngresos / estadisticas.totalVentas).toLocaleString('es-CO') : '0'}
            </p>
          </div>
        </div>

        {/* Filtros por Estado */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['todos', 'pendiente', 'completado', 'cancelado'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtroEstado === estado
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {estado === 'todos' && `Todos (${ordenes.length})`}
                {estado === 'pendiente' && `Pendientes (${ordenes.filter(o => o.estado === 'pendiente').length})`}
                {estado === 'completado' && `Completados (${ordenes.filter(o => o.estado === 'completado' || o.estado_pago === 'completado').length})`}
                {estado === 'cancelado' && `Cancelados (${ordenes.filter(o => o.estado === 'cancelado').length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Órdenes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {ordenes.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No hay órdenes para el período seleccionado
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {ordenes.map((orden) => (
                    <tr key={orden.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {orden.numero_orden}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {orden.id.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {orden.customer_name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {orden.customer_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(orden.created_at).toLocaleDateString('es-CO')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(orden.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${parseFloat(orden.total || 0).toLocaleString('es-CO')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <CreditCard className="w-4 h-4" />
                          {orden.metodo_pago || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEstadoBadge(orden)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedOrder(orden)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalles de la Orden
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Información de la orden */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Información General</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Número de orden:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.numero_orden}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Estado:</span>
                      <div className="mt-1">{getEstadoBadge(selectedOrder)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Fecha de creación:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedOrder.created_at).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Método de pago:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.metodo_pago || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Información del cliente */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Información del Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">Nombre:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{selectedOrder.customer_email}</p>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900 dark:text-white">{selectedOrder.customer_phone}</p>
                      </div>
                    )}
                    {selectedOrder.direccion_envio && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900 dark:text-white">{selectedOrder.direccion_envio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Productos */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Productos</h3>
                  <div className="space-y-3">
                    {(selectedOrder.metadata?.productos || selectedOrder.productos || []).map((producto, index) => (
                      <div key={index} className="flex justify-between items-center text-sm border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {producto.name || producto.nombre}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            Cantidad: {producto.quantity || producto.cantidad || 1}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${parseFloat(producto.price || producto.precio || 0).toLocaleString('es-CO')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totales */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Resumen de Pago</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                      <span className="text-gray-900 dark:text-white">${parseFloat(selectedOrder.subtotal || 0).toLocaleString('es-CO')}</span>
                    </div>
                    {selectedOrder.descuentos > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Descuentos:</span>
                        <span className="text-green-600">-${parseFloat(selectedOrder.descuentos).toLocaleString('es-CO')}</span>
                      </div>
                    )}
                    {selectedOrder.impuestos > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Impuestos:</span>
                        <span className="text-gray-900 dark:text-white">${parseFloat(selectedOrder.impuestos).toLocaleString('es-CO')}</span>
                      </div>
                    )}
                    {selectedOrder.costo_envio > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Envío:</span>
                        <span className="text-gray-900 dark:text-white">${parseFloat(selectedOrder.costo_envio).toLocaleString('es-CO')}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                      <span className="font-bold text-gray-900 dark:text-white text-lg">${parseFloat(selectedOrder.total).toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
