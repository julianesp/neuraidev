"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

const CATEGORIAS = [
  "celulares", "computadoras", "damas", "belleza",
  "libros-nuevos", "libros-usados", "generales", "otros",
];

export default function TiendaNuevoProductoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    precio_oferta: "",
    categoria: "generales",
    marca: "",
    stock: 1,
    disponible: true,
    destacado: false,
    imagen_principal: "",
    imagenes: [],
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.precio) {
      alert("Nombre y precio son obligatorios");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          precio: parseFloat(form.precio) || 0,
          precio_oferta: form.precio_oferta ? parseFloat(form.precio_oferta) : null,
          categoria: form.categoria,
          marca: form.marca || null,
          stock: parseInt(form.stock) || 0,
          disponible: form.disponible,
          destacado: form.destacado,
          imagen_principal: form.imagen_principal || null,
          imagenes: form.imagenes.filter(Boolean),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error creando producto");
      }
      router.push("/tienda/productos");
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Producto</h1>
          <p className="text-gray-500 text-sm">Quedará activo y visible de inmediato</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Información básica</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del producto <span className="text-red-500">*</span>
            </label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required
              placeholder="Ej: Camiseta talla M azul"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4}
              placeholder="Describe tu producto con detalles relevantes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio <span className="text-red-500">*</span>
              </label>
              <input name="precio" value={form.precio} onChange={handleChange} type="number" min="0" step="0.01" required
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio oferta</label>
              <input name="precio_oferta" value={form.precio_oferta} onChange={handleChange} type="number" min="0" step="0.01"
                placeholder="Opcional"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input name="stock" value={form.stock} onChange={handleChange} type="number" min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <input name="marca" value={form.marca} onChange={handleChange} placeholder="Opcional"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Imágenes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Imagen principal</h2>
          <ImageUploader
            value={form.imagen_principal}
            onChange={(url) => setForm((prev) => ({ ...prev, imagen_principal: url }))}
          />
        </div>

        {/* Opciones */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Opciones</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="disponible" checked={form.disponible} onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-gray-700">Disponible para venta (activo de inmediato)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="destacado" checked={form.destacado} onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-gray-700">Marcar como destacado</span>
          </label>
        </div>

        {/* Botón */}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors">
          {loading
            ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            : <><Save className="w-4 h-4" /> Publicar producto</>}
        </button>
      </form>
    </div>
  );
}
