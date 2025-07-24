"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../hooks/useAuth";
import Image from "next/image";

function AdminProductosContent() {
  const { user, logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    imagen_principal: "",
    imagenes: [],
  });

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await fetch("/api/productos");
      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      }
    } catch (error) {
      console.error("Error fetching productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/categorias");
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error("Error fetching categorias:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      precio: parseFloat(formData.precio),
      imagenes: formData.imagenes.filter((img) => img.trim() !== ""),
    };

    try {
      const url = editingProduct
        ? `/api/productos/${editingProduct.id}`
        : "/api/productos";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchProductos();
        resetForm();
        alert(editingProduct ? "Producto actualizado" : "Producto creado");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar la solicitud");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchProductos();
        alert("Producto eliminado");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar producto");
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio.toString(),
      categoria: producto.categoria,
      imagen_principal: producto.imagen_principal || "",
      imagenes: Array.isArray(producto.imagenes) ? producto.imagenes : [],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      categoria: "",
      imagen_principal: "",
      imagenes: [],
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const addImagenField = () => {
    setFormData((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, ""],
    }));
  };

  const updateImagen = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.map((img, i) => (i === index ? value : img)),
    }));
  };

  const removeImagen = (index) => {
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con información del usuario */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  Bienvenido, {user?.username}
                </h2>
                <p className="text-sm text-gray-600">
                  Administrador del sistema
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Administrar Productos
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? "Cancelar" : "Nuevo Producto"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? "Editar Producto" : "Crear Nuevo Producto"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="precio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Precio *
                  </label>
                  <input
                    id="precio"
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        precio: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="categoria"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Categoría *
                  </label>
                  <select
                    id="categoria"
                    required
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoria: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.name} value={categoria.name}>
                        {categoria.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="imagen_principal"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Imagen Principal (URL)
                  </label>
                  <input
                    id="imagen_principal"
                    type="url"
                    value={formData.imagen_principal}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        imagen_principal: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="descripcion"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      descripcion: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="imagenes_adicionales"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Imágenes Adicionales
                </label>
                {formData.imagenes.map((imagen, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={imagen}
                      onChange={(e) => updateImagen(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImagen(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImagenField}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Agregar imagen
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingProduct ? "Actualizar" : "Crear"} Producto
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Productos ({productos.length})
            </h2>
          </div>

          {productos.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay productos creados. ¡Crea tu primer producto!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productos.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {producto.imagen_principal && (
                            <Image
                              src={producto.imagen_principal}
                              alt={producto.nombre}
                              className="h-10 w-10 rounded-full object-cover mr-3"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {producto.nombre}
                            </div>
                            {producto.descripcion && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {producto.descripcion}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${producto.precio}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {producto.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(producto.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(producto.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
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
    </div>
  );
}

export default function AdminProductos() {
  return (
    <ProtectedRoute>
      <AdminProductosContent />
    </ProtectedRoute>
  );
}
