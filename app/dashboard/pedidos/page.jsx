"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Package, Truck, CheckCircle, XCircle, Search, Filter, RefreshCw, Menu, Trash2, CheckCheck } from "lucide-react";
import { useSidebar } from "../layout";

export default function PedidosPage() {
  const { toggleSidebar } = useSidebar();
  const [filtroEstado, setFiltroEstado] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    completados: 0,
    cancelados: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [checkingPayments, setCheckingPayments] = useState(false);
  const [forcingUpdate, setForcingUpdate] = useState(false);

  // Obtener pedidos de la base de datos
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/orders');

      if (!response.ok) {
        throw new Error('Error al obtener los pedidos');
      }

      const data = await response.json();

      if (data.success) {
        setPedidos(data.orders || []);
        setStats(data.stats || {
          total: 0,
          pendientes: 0,
          enProceso: 0,
          completados: 0,
          cancelados: 0
        });
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchEstado = !filtroEstado || pedido.estado === filtroEstado;
    const matchSearch = !searchTerm ||
      pedido.numero_orden?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(pedidosFiltrados.map(p => p.id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Handle individual selection
  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;

    const confirmed = confirm(`¿Estás seguro de eliminar ${selectedOrders.length} pedido(s)?`);
    if (!confirmed) return;

    try {
      setDeleting(true);
      const response = await fetch('/api/dashboard/orders/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderIds: selectedOrders }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar los pedidos');
      }

      // Reload orders
      await fetchOrders();
      setSelectedOrders([]);
    } catch (err) {
      console.error('Error deleting orders:', err);
      alert('Error al eliminar los pedidos: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Check pending payments
  const handleCheckPendingPayments = async () => {
    try {
      setCheckingPayments(true);
      const response = await fetch('/api/dashboard/check-pending-payments');

      if (!response.ok) {
        throw new Error('Error al verificar pagos pendientes');
      }

      const data = await response.json();

      if (data.success) {
        alert(
          `Verificación completada:\n` +
          `- Pedidos verificados: ${data.checked}\n` +
          `- Pedidos actualizados: ${data.updated}\n` +
          `- Aprobados: ${data.approved || 0}\n` +
          `- Rechazados: ${data.declined || 0}\n` +
          `${data.errors.length > 0 ? `\n⚠️ Errores: ${data.errors.length}` : ''}`
        );

        // Reload orders if any were updated
        if (data.updated > 0) {
          await fetchOrders();
        }
      }
    } catch (err) {
      console.error('Error checking payments:', err);
      alert('Error al verificar pagos: ' + err.message);
    } finally {
      setCheckingPayments(false);
    }
  };

  // Force update old pending orders
  const handleForceUpdateOrders = async () => {
    if (!confirm('¿Estás seguro de marcar como completados todos los pedidos pendientes antiguos (más de 1 hora)?')) {
      return;
    }

    try {
      setForcingUpdate(true);
      const response = await fetch('/api/dashboard/force-update-orders');

      if (!response.ok) {
        throw new Error('Error al forzar actualización');
      }

      const data = await response.json();

      if (data.success) {
        alert(
          `✅ Actualización completada:\n` +
          `- Pedidos actualizados: ${data.updated}\n` +
          `${data.errors.length > 0 ? `\n⚠️ Errores: ${data.errors.length}` : ''}\n\n` +
          `Detalles:\n${data.details.map(d => `- ${d.numero_orden}: ${d.customer_name} ($${d.total.toLocaleString('es-CO')})`).join('\n')}`
        );

        // Reload orders
        if (data.updated > 0) {
          await fetchOrders();
        }
      }
    } catch (err) {
      console.error('Error forcing update:', err);
      alert('Error al forzar actualización: ' + err.message);
    } finally {
      setForcingUpdate(false);
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener badge de estado
  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'en_proceso': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'proceso': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'completado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <style jsx>{`
        input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 1rem;
          height: 1rem;
          border: 2px solid #d1d5db;
          border-radius: 0.25rem;
          background-color: white;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }

        input[type="checkbox"]:hover {
          border-color: #2563eb;
        }

        input[type="checkbox"]:checked {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          left: 0.25rem;
          top: 0.05rem;
          width: 0.35rem;
          height: 0.6rem;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .dark input[type="checkbox"] {
          background-color: #374151;
          border-color: #4b5563;
        }

        .dark input[type="checkbox"]:checked {
          background-color: #2563eb;
          border-color: #2563eb;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pedidos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona y rastrea todos los pedidos de tu tienda
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCheckPendingPayments}
              disabled={checkingPayments || forcingUpdate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
              title="Verificar estados de pago pendientes en Wompi/ePayco"
            >
              {checkingPayments ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCheck className="w-5 h-5" />
                  Verificar Pagos
                </>
              )}
            </button>
            <button
              onClick={handleForceUpdateOrders}
              disabled={forcingUpdate || checkingPayments}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
              title="Forzar actualización de pedidos pendientes antiguos (>1 hora)"
            >
              {forcingUpdate ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Aprobar Antiguos
                </>
              )}
            </button>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Ocultar/Mostrar barra lateral"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            {selectedOrders.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar ({selectedOrders.length})
              </button>
            )}
            {stats.pendientes > 0 && (
              <button
                onClick={handleCheckPendingPayments}
                disabled={checkingPayments}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-lg transition-colors"
                title="Verificar estado de pagos pendientes en Wompi"
              >
                <CheckCheck className={`w-4 h-4 ${checkingPayments ? 'animate-spin' : ''}`} />
                Verificar Pagos ({stats.pendientes})
              </button>
            )}
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Pedidos</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Package className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pendientes</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">En Proceso</div>
                <div className="text-2xl font-bold text-purple-600">{stats.enProceso}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completados</div>
                <div className="text-2xl font-bold text-green-600">{stats.completados}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <XCircle className="w-5 h-5" />
              <p>Error: {error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ID, cliente, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="proceso">En Proceso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Cargando pedidos...
              </h3>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {pedidos.length === 0 ? 'No hay pedidos aún' : 'No se encontraron pedidos'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {pedidos.length === 0
                  ? 'Los pedidos aparecerán aquí cuando los clientes realicen compras'
                  : 'Prueba con otros filtros de búsqueda'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === pedidosFiltrados.length && pedidosFiltrados.length > 0}
                        onChange={handleSelectAll}
                        title="Seleccionar todos"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Productos Comprados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {pedidosFiltrados.map((pedido) => {
                    const items = pedido.metadata?.productos || pedido.productos || [];
                    const itemCount = items.reduce((sum, item) => sum + (item.quantity || item.cantidad || 1), 0);

                    return (
                      <tr key={pedido.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(pedido.id)}
                            onChange={() => handleSelectOrder(pedido.id)}
                            title="Seleccionar pedido"
                          />
                        </td>
                        {/* Datos del Cliente */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {pedido.customer_name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            CC/NIT: {pedido.customer_phone || 'N/A'}
                          </div>
                        </td>
                        {/* Contacto */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            📧 {pedido.customer_email || 'N/A'}
                          </div>
                          {pedido.customer_phone && (
                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                              📱 {pedido.customer_phone}
                            </div>
                          )}
                          {pedido.customer_address && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              📍 {pedido.customer_address}
                            </div>
                          )}
                        </td>
                        {/* Productos */}
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {items.length > 0 ? (
                              <ul className="text-sm space-y-1">
                                {items.map((item, idx) => (
                                  <li key={idx} className="text-gray-900 dark:text-white">
                                    • {item.name || item.nombre} <span className="text-gray-500">x{item.quantity || item.cantidad || 1}</span>
                                    {item.price && (
                                      <span className="text-xs text-gray-500 ml-2">
                                        (${parseInt(item.price).toLocaleString('es-CO')})
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-sm text-gray-500">Sin productos</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            ${pedido.total?.toLocaleString('es-CO') || '0'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(pedido.estado)}`}>
                            {pedido.estado?.charAt(0).toUpperCase() + pedido.estado?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(pedido.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
