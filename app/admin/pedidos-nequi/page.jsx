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
  Eye
} from "lucide-react";
import Link from "next/link";

export default function PedidosNequiPage() {
  const { user, isLoaded } = useUser();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('pendiente');
  const [processingOrder, setProcessingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  // Cargar pedidos
  const loadPedidos = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      let query = supabase
        .from('nequi_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtro !== 'todos') {
        query = query.eq('estado', filtro);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error cargando pedidos:', error);
        return;
      }

      setPedidos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recargar al cambiar filtro
  useEffect(() => {
    if (userIsAdmin) {
      loadPedidos();
    }
  }, [filtro]);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Package className="w-8 h-8 text-purple-600" />
            Pedidos Nequi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona y confirma los pedidos realizados con pago Nequi
          </p>
        </div>

        {/* Filtros */}
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

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {pedidos.filter(p => p.estado === 'pendiente').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Confirmados</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {pedidos.filter(p => p.estado === 'confirmado').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Cancelados</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {pedidos.filter(p => p.estado === 'cancelado').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pedidos.length}
                </p>
              </div>
              <Package className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        {pedidos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No hay pedidos {filtro !== 'todos' ? filtro + 's' : ''}
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
                processing={processingOrder === pedido.id}
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
      </div>
    </div>
  );
}

// Componente de tarjeta de pedido
function PedidoCard({ pedido, onConfirmar, onCancelar, processing, onViewDetails }) {
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
                onClick={() => onConfirmar(pedido.id)}
                disabled={processing}
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
                disabled={processing}
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
