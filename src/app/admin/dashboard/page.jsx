"use client";

import { useState, useEffect } from "react";
import { useRequireAdminAuth, useAdminAuth } from "../../../hooks/useAdminAuth";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  LogOut,
  User,
  Activity
} from "lucide-react";

export default function AdminDashboard() {
  const { isAuthenticated, loading } = useRequireAdminAuth();
  const { admin, logout } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchProducts();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        console.error("Error en stats:", data.error);
        // Usar datos dummy mientras arreglamos la API
        setStats({
          products: {
            total_products: 0,
            available_products: 0,
            sold_products: 0,
            average_price: 0,
            categories: []
          },
          recent_activity: []
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Usar datos dummy
      setStats({
        products: {
          total_products: 0,
          available_products: 0,
          sold_products: 0,
          average_price: 0,
          categories: []
        },
        recent_activity: []
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      setProductsLoading(true);
      let url = `/api/admin/productos?page=${page}&limit=10`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (selectedCategory) {
        url += `&categoria=${encodeURIComponent(selectedCategory)}`;
      }

      const response = await fetch(url, {
        credentials: "include",
      });
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products || []);
      } else {
        console.error("Error en productos:", data.error);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/productos/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        fetchProducts(currentPage);
        fetchStats(); // Actualizar estadísticas
        alert("Producto eliminado correctamente");
      } else {
        alert(data.error || "Error eliminando producto");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error eliminando producto");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // El useRequireAdminAuth ya redirige al login
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>Bienvenido, {admin?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.products?.total_products || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.products?.available_products || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.products?.sold_products || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${statsLoading ? "..." : Math.round(stats?.products?.average_price || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles y búsqueda */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">
                Gestión de Productos
              </h2>
              <button
                onClick={() => alert("Funcionalidad de crear producto en desarrollo")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </button>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las categorías</option>
                    {stats?.products?.categories?.map((cat) => (
                      <option key={cat.categoria} value={cat.categoria}>
                        {cat.categoria} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </button>
              </div>
            </form>

            {/* Lista de productos */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productsLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No se encontraron productos
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {product.imagen_principal ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={product.imagen_principal}
                                  alt={product.nombre}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.nombre}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {product.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.precio}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.vendido 
                              ? 'bg-red-100 text-red-800' 
                              : product.disponible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.vendido ? 'Vendido' : product.disponible ? 'Disponible' : 'No disponible'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => alert(`Ver producto ID: ${product.id}`)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => alert(`Editar producto ID: ${product.id}`)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        {stats?.recent_activity && stats.recent_activity.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Actividad Reciente
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.recent_activity.slice(0, 5).map((log, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      log.action === 'CREATE' ? 'bg-green-400' :
                      log.action === 'UPDATE' ? 'bg-blue-400' :
                      'bg-red-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{log.full_name}</span> {' '}
                        {log.action === 'CREATE' && 'creó un producto'}
                        {log.action === 'UPDATE' && 'actualizó un producto'}
                        {log.action === 'DELETE' && 'eliminó un producto'}
                        {log.product_id && ` (ID: ${log.product_id})`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}