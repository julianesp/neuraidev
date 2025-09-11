// src/components/admin/TiendasManager.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export type Tienda = {
  id: string;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo?: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    productos: number;
    ventas: number;
  };
};

export default function TiendasManager() {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTienda, setEditingTienda] = useState<Tienda | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    email: "",
    logo: "",
    activa: true
  });
  const [saving, setSaving] = useState(false);

  const fetchTiendas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tiendas", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setTiendas(data);
      }
    } catch (error) {
      console.error("Error fetching tiendas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiendas();
  }, []);

  useEffect(() => {
    if (editingTienda) {
      setFormData({
        nombre: editingTienda.nombre,
        descripcion: editingTienda.descripcion || "",
        direccion: editingTienda.direccion || "",
        telefono: editingTienda.telefono || "",
        email: editingTienda.email || "",
        logo: editingTienda.logo || "",
        activa: editingTienda.activa
      });
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        direccion: "",
        telefono: "",
        email: "",
        logo: "",
        activa: true
      });
    }
  }, [editingTienda]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(
        editingTienda ? `/api/tiendas/${editingTienda.id}` : "/api/tiendas",
        {
          method: editingTienda ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );

      if (res.ok) {
        setEditingTienda(null);
        setShowForm(false);
        fetchTiendas();
      } else {
        const error = await res.json();
        alert(error.error || "Error guardando tienda");
      }
    } catch (error) {
      console.error("Error saving tienda:", error);
      alert("Error guardando tienda");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta tienda?")) return;
    
    try {
      const res = await fetch(`/api/tiendas/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTiendas();
      } else {
        const error = await res.json();
        alert(error.error || "Error eliminando tienda");
      }
    } catch (error) {
      console.error("Error deleting tienda:", error);
      alert("Error eliminando tienda");
    }
  };

  const toggleActiva = async (tienda: Tienda) => {
    try {
      const res = await fetch(`/api/tiendas/${tienda.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !tienda.activa })
      });
      
      if (res.ok) {
        fetchTiendas();
      } else {
        const error = await res.json();
        alert(error.error || "Error actualizando tienda");
      }
    } catch (error) {
      console.error("Error updating tienda:", error);
      alert("Error actualizando tienda");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando tiendas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Gestión de Tiendas ({tiendas.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          ➕ Nueva Tienda
        </button>
      </div>

      {(showForm || editingTienda) && (
        <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingTienda ? "Editar Tienda" : "Nueva Tienda"}
            </h3>
            <button
              onClick={() => {
                setEditingTienda(null);
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
                <label htmlFor="tienda-nombre-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="tienda-nombre-input"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="tienda-telefono-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="tienda-telefono-input"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="tienda-email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="tienda-email-input"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="tienda-logo-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo (URL)
                </label>
                <input
                  type="url"
                  id="tienda-logo-input"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tienda-descripcion-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                id="tienda-descripcion-input"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="tienda-direccion-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                id="tienda-direccion-input"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
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
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Tienda activa</span>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? "Guardando..." : editingTienda ? "Actualizar" : "Crear"} Tienda
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiendas.map((tienda) => (
          <div
            key={tienda.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {tienda.logo && (
                  <Image
                    src={tienda.logo}
                    alt={tienda.nombre}
                    className="h-12 w-12 rounded-lg object-cover mr-4"
                    width={48}
                    height={48}
                    priority={false}
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {tienda.nombre}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    tienda.activa
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}>
                    {tienda.activa ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
            </div>

            {tienda.descripcion && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {tienda.descripcion}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              {tienda.direccion && (
                <div className="flex items-center">
                  <span className="mr-2">📍</span>
                  {tienda.direccion}
                </div>
              )}
              {tienda.telefono && (
                <div className="flex items-center">
                  <span className="mr-2">📞</span>
                  {tienda.telefono}
                </div>
              )}
              {tienda.email && (
                <div className="flex items-center">
                  <span className="mr-2">📧</span>
                  {tienda.email}
                </div>
              )}
            </div>

            {tienda._count && (
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span>📦 {tienda._count.productos} productos</span>
                <span>💰 {tienda._count.ventas} ventas</span>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => toggleActiva(tienda)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  tienda.activa
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {tienda.activa ? "Desactivar" : "Activar"}
              </button>
              <button
                onClick={() => setEditingTienda(tienda)}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(tienda.id)}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {tiendas.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-lg font-medium mb-2">No hay tiendas registradas</h3>
          <p className="text-sm">¡Crea la primera tienda para comenzar a gestionar productos!</p>
        </div>
      )}
    </div>
  );
}