"use client";

import { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Menu,
  Gift,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Package,
  Edit,
  Save,
  X
} from "lucide-react";
import { useSidebar } from "../layout";

export default function ClientesPage() {
  const { toggleSidebar } = useSidebar();
  const [clientes, setClientes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("last_order_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesText, setNotesText] = useState("");

  // Obtener clientes de la base de datos
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        search: searchTerm,
        sortBy,
        order: sortOrder
      });

      const response = await fetch(`/api/customers?${params}`);

      if (!response.ok) {
        throw new Error('Error al obtener los clientes');
      }

      const data = await response.json();

      if (data.success) {
        setClientes(data.customers || []);
        setStats(data.stats || {
          total: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          totalOrders: 0
        });
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchCustomers();
  }, [sortBy, sortOrder]);

  // Buscar con delay
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Abrir modal de descuento
  const openDiscountModal = (customer) => {
    setSelectedCustomer(customer);
    setShowDiscountModal(true);
  };

  // Editar notas
  const startEditingNotes = (customer) => {
    setEditingNotes(customer.id);
    setNotesText(customer.notes || '');
  };

  const saveNotes = async (customerId) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, notes: notesText })
      });

      if (!response.ok) throw new Error('Error al guardar notas');

      // Actualizar cliente en el estado
      setClientes(prev => prev.map(c =>
        c.id === customerId ? { ...c, notes: notesText } : c
      ));

      setEditingNotes(null);
    } catch (err) {
      alert('Error al guardar notas: ' + err.message);
    }
  };

  const cancelEditingNotes = () => {
    setEditingNotes(null);
    setNotesText('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Clientes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona tus clientes y crea descuentos exclusivos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Ocultar/Mostrar barra lateral"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={fetchCustomers}
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
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Clientes</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ingresos Totales</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pedidos Totales</div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalOrders}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ticket Promedio</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats.averageOrderValue)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="last_order_date">Última compra</option>
              <option value="total_spent">Total gastado</option>
              <option value="total_orders">Total pedidos</option>
              <option value="name">Nombre</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="desc">Mayor a menor</option>
              <option value="asc">Menor a mayor</option>
            </select>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Cargando clientes...
              </h3>
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay clientes aún
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Los clientes aparecerán aquí cuando completen su primera compra
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Pedidos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Gastado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Última Compra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Notas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              {cliente.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {cliente.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {cliente.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {cliente.email}
                          </div>
                          {cliente.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {cliente.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {cliente.total_orders}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(cliente.total_spent)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(cliente.last_order_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingNotes === cliente.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={notesText}
                              onChange={(e) => setNotesText(e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                              placeholder="Agregar nota..."
                            />
                            <button
                              onClick={() => saveNotes(cliente.id)}
                              className="p-1 text-green-600 hover:text-green-700"
                              title="Guardar"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditingNotes}
                              className="p-1 text-red-600 hover:text-red-700"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {cliente.notes || 'Sin notas'}
                            </div>
                            <button
                              onClick={() => startEditingNotes(cliente)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Editar notas"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openDiscountModal(cliente)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <Gift className="w-4 h-4" />
                          Crear Descuento
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

      {/* Modal de Descuento */}
      {showDiscountModal && (
        <DiscountModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDiscountModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

// Componente Modal para crear descuento
function DiscountModal({ customer, onClose }) {
  const [formData, setFormData] = useState({
    code: `CLIENTE-${customer.id}-${Math.random().toString(36).substring(7).toUpperCase()}`,
    type: 'percentage',
    value: 10,
    minPurchase: 0,
    maxUses: 1,
    validUntil: '',
    description: `Descuento exclusivo para ${customer.name}`
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customerEmail: customer.email,
          validFrom: new Date().toISOString(),
          validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear descuento');
      }

      alert(`¡Código de descuento creado exitosamente!\nCódigo: ${formData.code}`);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Crear Descuento para {customer.name}
        </h2>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Descuento
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Valor Fijo (COP)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor {formData.type === 'percentage' ? '(%)' : '(COP)'}
            </label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Compra Mínima (COP)
            </label>
            <input
              type="number"
              value={formData.minPurchase}
              onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) })}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Usos Máximos
            </label>
            <input
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Válido Hasta (Opcional)
            </label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Descuento'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
