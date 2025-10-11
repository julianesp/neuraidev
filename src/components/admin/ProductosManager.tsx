// src/components/admin/ProductosManager.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ProductForm from "./ProductForm";

export type Producto = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioAnterior?: number;
  categoria: string;
  imagenPrincipal?: string;
  videoUrl?: string;
  destacado: boolean;
  disponible: boolean;
  stock: number;
  sku?: string;
  marca?: string;
  condicion: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  imagenes: Array<{
    id: string;
    url: string;
    alt?: string;
    orden: number;
  }>;
  tienda?: {
    id: string;
    nombre: string;
  };
};

export default function ProductosManager() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/productos?limit=100", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setProductos(data.productos || []);
      }
    } catch (error) {
      console.error("Error fetching productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?"))
      return;

    try {
      const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProductos();
      } else {
        const error = await res.json();
        alert(error.error || "Error eliminando producto");
      }
    } catch (error) {
      console.error("Error deleting producto:", error);
      alert("Error eliminando producto");
    }
  };

  const handleFormSuccess = () => {
    setEditingProduct(null);
    setShowForm(false);
    fetchProductos();
  };

  const toggleDestacado = async (producto: Producto) => {
    try {
      const res = await fetch(`/api/productos/${producto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destacado: !producto.destacado }),
      });

      if (res.ok) {
        fetchProductos();
      } else {
        const error = await res.json();
        alert(error.error || "Error actualizando producto");
      }
    } catch (error) {
      console.error("Error updating producto:", error);
      alert("Error actualizando producto");
    }
  };

  // Función para agrupar productos por categoría
  const groupProductsByCategory = () => {
    return productos.reduce(
      (acc, producto) => {
        const categoria = producto.categoria;
        if (!acc[categoria]) {
          acc[categoria] = [];
        }
        acc[categoria].push(producto);
        return acc;
      },
      {} as Record<string, Producto[]>,
    );
  };

  // Filtrar productos por búsqueda
  const filteredProducts = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.descripcion &&
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const groupedProducts = filteredProducts.reduce(
    (acc, producto) => {
      const categoria = producto.categoria;
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(producto);
      return acc;
    },
    {} as Record<string, Producto[]>,
  );

  // Función para toggle expandir categoría
  const toggleCategory = (categoria: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoria)) {
      newExpanded.delete(categoria);
    } else {
      newExpanded.add(categoria);
    }
    setExpandedCategories(newExpanded);
  };

  // Iconos para categorías
  const getCategoryIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      celulares: "📱",
      computadoras: "💻",
      libros: "📚",
      "libros-usados": "📖",
      "libros-nuevos": "📗",
      generales: "🔧",
      damas: "👗",
      belleza: "💄",
      bicicletas: "🚲",
    };
    return icons[categoria] || "📦";
  };

  // Función para obtener nombre legible de categoría
  const getCategoryDisplayName = (categoria: string) => {
    const names: Record<string, string> = {
      celulares: "Celulares y Accesorios",
      computadoras: "Computadoras y Tecnología",
      libros: "Libros",
      "libros-usados": "Libros Usados",
      "libros-nuevos": "Libros Nuevos",
      generales: "Productos Generales",
      damas: "Productos para Damas",
      belleza: "Belleza y Cuidado Personal",
      bicicletas: "Bicicletas y Accesorios",
    };
    return (
      names[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Cargando productos...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Gestión de Productos ({productos.length})
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Organizado por categorías • {Object.keys(groupedProducts).length}{" "}
            categorías
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Formulario - Solo para crear nuevo (inline) */}
      {showForm && !editingProduct ? (
        <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Nuevo Producto
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ProductForm
            producto={null}
            onSuccess={handleFormSuccess}
          />
        </div>
      ) : null}

      {/* Modal para editar producto */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Editar Producto
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingProduct.nombre}
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            {/* Contenido del modal con scroll */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6">
                <ProductForm
                  producto={editingProduct}
                  onSuccess={handleFormSuccess}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones rápidas para categorías */}
      {Object.keys(groupedProducts).length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
            Expandir:
          </span>
          <button
            onClick={() =>
              setExpandedCategories(new Set(Object.keys(groupedProducts)))
            }
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Todas las categorías
          </button>
          <button
            onClick={() => setExpandedCategories(new Set())}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Ninguna
          </button>
        </div>
      )}

      {/* Lista de productos organizados por categorías */}
      <div className="space-y-4">
        {Object.keys(groupedProducts)
          .sort((a, b) => groupedProducts[b].length - groupedProducts[a].length) // Ordenar por cantidad de productos
          .map((categoria) => (
            <div
              key={categoria}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Header de categoría */}
              <button
                onClick={() => toggleCategory(categoria)}
                className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(categoria)}</span>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getCategoryDisplayName(categoria)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {groupedProducts[categoria].length} producto
                      {groupedProducts[categoria].length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                    {
                      groupedProducts[categoria].filter((p) => p.disponible)
                        .length
                    }{" "}
                    disponibles
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      expandedCategories.has(categoria) ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Productos de la categoría */}
              {expandedCategories.has(categoria) && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {groupedProducts[categoria].map((producto) => (
                    <div
                      key={producto.id}
                      className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {producto.imagenPrincipal && (
                            <Image
                              src={producto.imagenPrincipal}
                              alt={producto.nombre}
                              className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                              width={64}
                              height={64}
                              priority={false}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {producto.nombre}
                            </h4>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                ${Number(producto.precio).toLocaleString()}
                              </span>
                              {producto.precioAnterior && (
                                <span className="text-sm text-gray-500 line-through">
                                  $
                                  {Number(
                                    producto.precioAnterior,
                                  ).toLocaleString()}
                                </span>
                              )}
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  producto.stock > 0
                                    ? producto.stock > 10
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }`}
                                style={
                                  producto.stock === 0
                                    ? {
                                        backgroundColor:
                                          "rgba(239, 68, 68, 0.1)",
                                        color: "rgba(185, 28, 28, 0.8)",
                                      }
                                    : {}
                                }
                              >
                                {producto.stock > 0
                                  ? `Cantidad: ${producto.stock}`
                                  : "Agotado"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {producto.destacado && (
                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                  ⭐ Destacado
                                </span>
                              )}
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                {producto.condicion}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => toggleDestacado(producto)}
                            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                              producto.destacado
                                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
                            }`}
                            title={
                              producto.destacado
                                ? "Quitar destacado"
                                : "Destacar"
                            }
                          >
                            ⭐
                          </button>
                          <button
                            onClick={() => setEditingProduct(producto)}
                            className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar producto"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(producto.id)}
                            className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

        {Object.keys(groupedProducts).length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm
                ? "No se encontraron productos"
                : "No hay productos registrados"}
            </h3>
            <p className="text-sm">
              {searchTerm
                ? `No hay productos que coincidan con "${searchTerm}"`
                : "¡Crea tu primer producto para empezar!"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
