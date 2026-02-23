"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/auth/roles";
import { getSupabaseBrowserClient } from "@/lib/db";
import {
  Check,
  X,
  Mail,
  Calendar,
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
  Sparkles,
  Brain
} from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";

export default function PedidosNequiPage() {
  const { user, isLoaded } = useUser();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [periodoFiltro, setPeriodoFiltro] = useState('todos'); // hoy, semana, mes, personalizado
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [processingOrder, setProcessingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [analyzingWithAi, setAnalyzingWithAi] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    totalIngresos: 0,
    pedidosConfirmados: 0,
    pedidosPendientes: 0,
    productosVendidos: 0
  });

  // Verificar permisos de admin
  useEffect(() => {
    async function checkAdmin() {
      if (isLoaded && user) {
        const adminStatus = await isAdmin(user);
        setUserIsAdmin(adminStatus);
        if (adminStatus) {
          loadPedidos();
        } else {
          setLoading(false);
        }
      } else if (isLoaded) {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [isLoaded, user]);

  // Cargar pedidos con filtros
  const loadPedidos = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      let query = supabase
        .from('nequi_orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtro por estado
      if (filtro !== 'todos') {
        query = query.eq('estado', filtro);
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
        console.error('Error cargando pedidos:', error);
        return;
      }

      setPedidos(data || []);
      calcularEstadisticas(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = (pedidosData) => {
    const confirmados = pedidosData.filter(p => p.estado === 'confirmado');
    const pendientes = pedidosData.filter(p => p.estado === 'pendiente');

    const totalIngresos = confirmados.reduce((sum, p) => sum + parseFloat(p.total_con_descuento || 0), 0);
    const productosVendidos = confirmados.reduce((sum, p) => {
      return sum + p.productos.reduce((pSum, prod) => pSum + prod.cantidad, 0);
    }, 0);

    setEstadisticas({
      totalVentas: confirmados.length,
      totalIngresos: totalIngresos,
      pedidosConfirmados: confirmados.length,
      pedidosPendientes: pendientes.length,
      productosVendidos: productosVendidos
    });
  };

  // Recargar al cambiar filtros
  useEffect(() => {
    if (userIsAdmin) {
      loadPedidos();
    }
  }, [filtro, periodoFiltro, mesSeleccionado, fechaInicio, fechaFin]);

  // Generar y descargar reporte PDF
  const descargarReportePDF = () => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFillColor(147, 51, 234);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('REPORTE DE VENTAS NEQUI', 105, 20, { align: 'center' });
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
      doc.text(`Total de ventas confirmadas: ${estadisticas.totalVentas}`, 20, y);
      y += 7;
      doc.text(`Ingresos totales: $${estadisticas.totalIngresos.toLocaleString('es-CO')}`, 20, y);
      y += 7;
      doc.text(`Productos vendidos: ${estadisticas.productosVendidos}`, 20, y);
      y += 7;
      doc.text(`Pedidos pendientes: ${estadisticas.pedidosPendientes}`, 20, y);

      y += 15;

      // Lista de pedidos confirmados
      const pedidosConfirmados = pedidos.filter(p => p.estado === 'confirmado');

      if (pedidosConfirmados.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('DETALLE DE VENTAS', 20, y);
        y += 10;

        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');

        pedidosConfirmados.forEach((pedido, index) => {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }

          doc.setFont(undefined, 'bold');
          doc.text(`${index + 1}. ${pedido.numero_factura}`, 20, y);
          y += 5;

          doc.setFont(undefined, 'normal');
          doc.text(`Fecha: ${new Date(pedido.confirmed_at || pedido.created_at).toLocaleDateString('es-CO')}`, 25, y);
          y += 5;
          doc.text(`Email: ${pedido.email}`, 25, y);
          y += 5;
          doc.text(`Total: $${parseFloat(pedido.total_con_descuento).toLocaleString('es-CO')}`, 25, y);
          y += 5;

          pedido.productos.forEach((prod) => {
            if (y > 260) {
              doc.addPage();
              y = 20;
            }
            doc.text(`- ${prod.nombre} (x${prod.cantidad})`, 30, y);
            y += 4;
          });

          y += 3;
        });
      }

      // Footer
      doc.setFillColor(109, 40, 217);
      doc.rect(0, 280, 210, 17, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Neurai.dev - Reporte generado automaticamente', 105, 290, { align: 'center' });

      // Guardar
      const nombreArchivo = `Reporte_Ventas_Nequi_${periodoTexto.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nombreArchivo);

      alert('✅ Reporte descargado exitosamente');
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
    }
  };

  // Verificar pedido con AI
  const verificarConAI = async (orderId, montoPagado = null, descripcionCliente = null) => {
    setAnalyzingWithAi(orderId);
    try {
      const response = await fetch('/api/nequi/verify-order-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          montoPagado,
          descripcionCliente
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      if (data.fallback) {
        alert('⚠️ ' + data.message);
        return;
      }

      setAiAnalysis(data);
      setShowAiModal(true);

    } catch (error) {
      console.error('Error verificando con AI:', error);
      alert('Error al verificar con AI');
    } finally {
      setAnalyzingWithAi(null);
    }
  };

  // Confirmar pedido
  const confirmarPedido = async (orderId) => {
    if (!confirm('¿Confirmar que se recibió el pago de este pedido?\nEsto descontará el stock de los productos.')) {
      return;
    }

    setProcessingOrder(orderId);
    try {
      const response = await fetch('/api/nequi/confirm-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      alert('✅ Pedido confirmado y stock descontado exitosamente');
      loadPedidos();
    } catch (error) {
      console.error('Error confirmando pedido:', error);
      alert('Error al confirmar el pedido');
    } finally {
      setProcessingOrder(null);
    }
  };

  // Cancelar pedido
  const cancelarPedido = async (orderId) => {
    const reason = prompt('¿Por qué deseas cancelar este pedido? (opcional)');
    if (reason === null) return;

    setProcessingOrder(orderId);
    try {
      const response = await fetch('/api/nequi/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      alert('Pedido cancelado');
      loadPedidos();
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      alert('Error al cancelar el pedido');
    } finally {
      setProcessingOrder(null);
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

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
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
            href="/dashboard"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
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
                <Package className="w-8 h-8 text-purple-600" />
                Ventas con Nequi
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestiona pedidos y descarga reportes de ventas
              </p>
            </div>
            <button
              onClick={descargarReportePDF}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Descargar Reporte PDF
            </button>
          </div>
        </div>

        {/* Filtros de Período */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
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
                    ? 'bg-purple-600 text-white shadow-md'
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
                className="w-full md:w-auto px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-600 focus:outline-none"
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
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-600 focus:outline-none"
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
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas del período */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
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
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Ventas Confirmadas</p>
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
              {estadisticas.pedidosPendientes}
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
            {['todos', 'pendiente', 'confirmado', 'cancelado', 'expirado'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltro(estado)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtro === estado
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
                {estado !== 'todos' && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {pedidos.filter(p => p.estado === estado).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de pedidos */}
        {pedidos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No hay pedidos {filtro !== 'todos' ? filtro + 's' : ''} en este período
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Los pedidos aparecerán aquí cuando los clientes realicen compras con Nequi
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onConfirmar={confirmarPedido}
                onCancelar={cancelarPedido}
                onVerificarAI={verificarConAI}
                processing={processingOrder === pedido.id}
                analyzingAI={analyzingWithAi === pedido.id}
                onViewDetails={() => setSelectedOrder(pedido)}
              />
            ))}
          </div>
        )}

        {/* Modal de detalles */}
        {selectedOrder && (
          <PedidoDetailsModal
            pedido={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}

        {/* Modal de análisis AI */}
        {showAiModal && aiAnalysis && (
          <AiAnalysisModal
            analysis={aiAnalysis}
            onClose={() => {
              setShowAiModal(false);
              setAiAnalysis(null);
            }}
            onConfirmar={() => {
              setShowAiModal(false);
              setAiAnalysis(null);
              confirmarPedido(aiAnalysis.order.id);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Componente de tarjeta de pedido
function PedidoCard({ pedido, onConfirmar, onCancelar, onVerificarAI, processing, analyzingAI, onViewDetails }) {
  const estadoConfig = {
    pendiente: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-300 dark:border-orange-700',
      text: 'text-orange-700 dark:text-orange-300',
      icon: <Clock className="w-5 h-5" />
    },
    confirmado: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-300 dark:border-green-700',
      text: 'text-green-700 dark:text-green-300',
      icon: <CheckCircle className="w-5 h-5" />
    },
    cancelado: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-700 dark:text-red-300',
      icon: <XCircle className="w-5 h-5" />
    },
    expirado: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      border: 'border-gray-300 dark:border-gray-700',
      text: 'text-gray-700 dark:text-gray-300',
      icon: <AlertCircle className="w-5 h-5" />
    }
  };

  const config = estadoConfig[pedido.estado] || estadoConfig.pendiente;

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-xl p-6`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Info principal */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-flex items-center gap-2 ${config.text} font-bold px-3 py-1 rounded-full border ${config.border}`}>
              {config.icon}
              {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {pedido.numero_factura}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{pedido.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(pedido.created_at).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>{pedido.productos.length}</strong> producto{pedido.productos.length > 1 ? 's' : ''}
          </div>

          <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
            ${pedido.total_con_descuento.toLocaleString('es-CO')}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 line-through">
              ${pedido.precio_original.toLocaleString('es-CO')}
            </span>
            <span className="text-sm text-green-600 dark:text-green-400 ml-2">
              (-{pedido.descuento_porcentaje}%)
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2 lg:w-48">
          <button
            onClick={onViewDetails}
            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver detalles
          </button>

          {pedido.estado === 'pendiente' && (
            <>
              <button
                onClick={() => onVerificarAI(pedido.id)}
                disabled={processing || analyzingAI}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Verificar con IA qué producto pagó el cliente"
              >
                {analyzingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Verificar con AI
                  </>
                )}
              </button>
              <button
                onClick={() => onConfirmar(pedido.id)}
                disabled={processing || analyzingAI}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmar Pago
                  </>
                )}
              </button>
              <button
                onClick={() => onCancelar(pedido.id)}
                disabled={processing || analyzingAI}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal de detalles del pedido
function PedidoDetailsModal({ pedido, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Detalles del Pedido
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Número de Factura
            </label>
            <p className="text-gray-900 dark:text-white">{pedido.numero_factura}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Email del Cliente
            </label>
            <p className="text-gray-900 dark:text-white">{pedido.email}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Estado
            </label>
            <p className="text-gray-900 dark:text-white capitalize">{pedido.estado}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Fecha de Creación
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(pedido.created_at).toLocaleString('es-CO')}
            </p>
          </div>

          {pedido.confirmed_at && (
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Fecha de Confirmación
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(pedido.confirmed_at).toLocaleString('es-CO')}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
              Productos
            </label>
            <div className="space-y-2">
              {pedido.productos.map((producto, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {producto.nombre}
                      {producto.variacion && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          ({producto.variacion})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cantidad: {producto.cantidad}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${(producto.precio * producto.cantidad).toLocaleString('es-CO')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between text-gray-700 dark:text-gray-300 mb-2">
              <span>Precio Original:</span>
              <span>${pedido.precio_original.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-green-600 dark:text-green-400 mb-2">
              <span>Descuento ({pedido.descuento_porcentaje}%):</span>
              <span>-${(pedido.precio_original - pedido.total_con_descuento).toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-purple-700 dark:text-purple-300">
              <span>Total Pagado:</span>
              <span>${pedido.total_con_descuento.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// Modal de análisis con AI
function AiAnalysisModal({ analysis, onClose, onConfirmar }) {
  if (!analysis || !analysis.aiAnalysis) return null;

  const ai = analysis.aiAnalysis;
  const order = analysis.order;

  // Determinar color según confianza
  const getConfianzaColor = (confianza) => {
    if (confianza >= 80) return 'text-green-600 dark:text-green-400';
    if (confianza >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfianzaBg = (confianza) => {
    if (confianza >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700';
    if (confianza >= 50) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700';
    return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Análisis con IA
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pedido: {order.numero_factura}
              </p>
            </div>
          </div>
        </div>

        {/* Confianza del análisis */}
        <div className={`${getConfianzaBg(ai.confianza)} border-2 rounded-xl p-4 mb-6`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-900 dark:text-white">
              Nivel de Confianza:
            </span>
            <span className={`text-2xl font-bold ${getConfianzaColor(ai.confianza)}`}>
              {ai.confianza}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                ai.confianza >= 80
                  ? 'bg-green-600'
                  : ai.confianza >= 50
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${ai.confianza}%` }}
            />
          </div>
        </div>

        {/* Coincidencia */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            {ai.coincide ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            )}
            <h3 className="font-bold text-gray-900 dark:text-white">
              {ai.coincide
                ? '✓ Los productos coinciden con el monto pagado'
                : '⚠️ Los productos NO coinciden con el monto pagado'}
            </h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Monto pagado: <strong>${analysis.montoPagado.toLocaleString('es-CO')}</strong>
            {' '}| Descuento aplicado: <strong>{analysis.descuentoAplicado}%</strong>
          </p>
        </div>

        {/* Productos identificados */}
        {ai.productosIdentificados && ai.productosIdentificados.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Productos Identificados por la IA:
            </h3>
            <div className="space-y-2">
              {ai.productosIdentificados.map((producto, index) => (
                <div
                  key={index}
                  className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {producto.nombre}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cantidad: {producto.cantidad} | Precio: ${producto.precio?.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                  {producto.razon && (
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 italic">
                      "{producto.razon}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alternativas */}
        {ai.alternativas && ai.alternativas.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              Alternativas Posibles:
            </h3>
            <div className="space-y-2">
              {ai.alternativas.map((alt, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {alt.nombre}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cant: {alt.cantidad} | ${alt.precio?.toLocaleString('es-CO')}
                    </p>
                  </div>
                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
                    {alt.probabilidad}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Análisis */}
        {ai.analisis && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
              Análisis Detallado:
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">
              {ai.analisis}
            </p>
          </div>
        )}

        {/* Recomendación */}
        {ai.recomendacion && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Recomendación:
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              {ai.recomendacion}
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          {ai.coincide && ai.confianza >= 70 && (
            <button
              onClick={onConfirmar}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Confirmar Pedido
            </button>
          )}
        </div>

        {ai.confianza < 70 && (
          <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-3">
            ⚠️ Se recomienda revisar manualmente debido a la baja confianza del análisis
          </p>
        )}
      </div>
    </div>
  );
}
