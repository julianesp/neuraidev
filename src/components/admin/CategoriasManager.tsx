// src/components/admin/CategoriasManager.tsx
"use client";

import React, { useState, useEffect } from "react";

export type Categoria = {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  icono?: string;
  activa: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
};

export default function CategoriasManager() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    slug: "",
    descripcion: "",
    icono: "",
    activa: true,
    orden: 0
  });
  const [saving, setSaving] = useState(false);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categorias", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error("Error fetching categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (editingCategoria) {
      setFormData({
        nombre: editingCategoria.nombre,
        slug: editingCategoria.slug,
        descripcion: editingCategoria.descripcion || "",
        icono: editingCategoria.icono || "",
        activa: editingCategoria.activa,
        orden: editingCategoria.orden
      });
    } else {
      setFormData({
        nombre: "",
        slug: "",
        descripcion: "",
        icono: "",
        activa: true,
        orden: categorias.length
      });
    }
  }, [editingCategoria, categorias.length]);

  const generateSlug = (nombre: string) => {
    return nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked 
               : type === "number" ? Number(value) 
               : value
      };
      
      // Auto-generar slug cuando se cambia el nombre
      if (name === "nombre") {
        newData.slug = generateSlug(value);
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(
        editingCategoria ? `/api/categorias/${editingCategoria.id}` : "/api/categorias",
        {
          method: editingCategoria ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );

      if (res.ok) {
        setEditingCategoria(null);
        setShowForm(false);
        fetchCategorias();
      } else {
        const error = await res.json();
        alert(error.error || "Error guardando categoría");
      }
    } catch (error) {
      console.error("Error saving categoria:", error);
      alert("Error guardando categoría");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?")) return;
    
    try {
      const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategorias();
      } else {
        const error = await res.json();
        alert(error.error || "Error eliminando categoría");
      }
    } catch (error) {
      console.error("Error deleting categoria:", error);
      alert("Error eliminando categoría");
    }
  };

  const toggleActiva = async (categoria: Categoria) => {
    try {
      const res = await fetch(`/api/categorias/${categoria.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !categoria.activa })
      });
      
      if (res.ok) {
        fetchCategorias();
      } else {
        const error = await res.json();
        alert(error.error || "Error actualizando categoría");
      }
    } catch (error) {
      console.error("Error updating categoria:", error);
      alert("Error actualizando categoría");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando categorías...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Gestión de Categorías ({categorias.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          ➕ Nueva Categoría
        </button>
      </div>

      {(showForm || editingCategoria) && (
        <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
            </h3>
            <button
              onClick={() => {
                setEditingCategoria(null);
                setShowForm(false);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="categoria-nombre-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="categoria-nombre-input"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="categoria-slug-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  id="categoria-slug-input"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="categoria-icono-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icono (emoji o clase CSS)
                </label>
                <input
                  type="text"
                  id="categoria-icono-input"
                  name="icono"
                  value={formData.icono}
                  onChange={handleChange}
                  placeholder="📱, 💻, 🎧..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="categoria-orden-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Orden
                </label>
                <input
                  type="number"
                  id="categoria-orden-input"
                  name="orden"
                  value={formData.orden}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="categoria-descripcion-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                id="categoria-descripcion-input"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="activa"
                checked={formData.activa}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Categoría activa</span>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? "Guardando..." : editingCategoria ? "Actualizar" : "Crear"} Categoría
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {categorias.map((categoria) => (
              <tr key={categoria.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {categoria.icono && (
                      <span className="text-2xl mr-3">{categoria.icono}</span>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {categoria.nombre}
                      </div>
                      {categoria.descripcion && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {categoria.descripcion}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    {categoria.slug}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {categoria.orden}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    categoria.activa
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}>
                    {categoria.activa ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => toggleActiva(categoria)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      categoria.activa
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {categoria.activa ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => setEditingCategoria(categoria)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(categoria.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categorias.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay categorías registradas. ¡Crea la primera!
          </div>
        )}
      </div>
    </div>
  );
}