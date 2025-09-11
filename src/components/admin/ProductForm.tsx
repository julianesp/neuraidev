// src/components/admin/ProductForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Producto } from "./ProductosManager";

interface ProductFormProps {
  producto?: Producto | null;
  onSuccess?: () => void;
}

export default function ProductForm({ producto, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    precioAnterior: 0,
    categoria: "",
    imagenPrincipal: "",
    videoUrl: "",
    destacado: false,
    disponible: true,
    stock: 0,
    sku: "",
    marca: "",
    condicion: "nuevo" as "nuevo" | "usado" | "reacondicionado",
    tags: [] as string[],
    tiendaId: "",
    imagenes: [] as Array<{ url: string; alt: string; orden: number }>,
    createdAt: "",
    updatedAt: ""
  });

  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [imageInput, setImageInput] = useState({ url: "", alt: "" });

  // Función para formatear fecha para input datetime-local
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        precio: Number(producto.precio),
        precioAnterior: Number(producto.precioAnterior || 0),
        categoria: producto.categoria,
        imagenPrincipal: producto.imagenPrincipal || "",
        videoUrl: producto.videoUrl || "",
        destacado: producto.destacado,
        disponible: producto.disponible,
        stock: producto.stock,
        sku: producto.sku || "",
        marca: producto.marca || "",
        condicion: producto.condicion as "nuevo" | "usado" | "reacondicionado",
        tags: producto.tags,
        tiendaId: producto.tienda?.id || "",
        imagenes: producto.imagenes.map(img => ({
          url: img.url,
          alt: img.alt || "",
          orden: img.orden
        })),
        createdAt: formatDateForInput(producto.createdAt),
        updatedAt: formatDateForInput(producto.updatedAt)
      });
    }
  }, [producto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked 
             : type === "number" ? Number(value) 
             : value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    if (imageInput.url.trim()) {
      setFormData(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, {
          url: imageInput.url.trim(),
          alt: imageInput.alt.trim(),
          orden: prev.imagenes.length
        }]
      }));
      setImageInput({ url: "", alt: "" });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        precio: Number(formData.precio),
        precioAnterior: formData.precioAnterior > 0 ? Number(formData.precioAnterior) : undefined,
        stock: Number(formData.stock),
        tiendaId: formData.tiendaId || undefined,
        imagenPrincipal: formData.imagenPrincipal.trim() || undefined,
        videoUrl: formData.videoUrl.trim() || undefined,
        createdAt: formData.createdAt ? new Date(formData.createdAt).toISOString() : undefined,
        updatedAt: formData.updatedAt ? new Date(formData.updatedAt).toISOString() : undefined
      };

      const res = await fetch(
        producto ? `/api/productos/${producto.id}` : "/api/productos",
        {
          method: producto ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (res.ok) {
        onSuccess?.();
      } else {
        const error = await res.json();
        alert(error.error || "Error guardando producto");
      }
    } catch (error) {
      console.error("Error saving producto:", error);
      alert("Error guardando producto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="producto-nombre-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre del producto *
          </label>
          <input
            type="text"
            id="producto-nombre-input"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="producto-sku-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SKU
          </label>
          <input
            type="text"
            id="producto-sku-input"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="producto-precio-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Precio *
          </label>
          <input
            type="number"
            id="producto-precio-input"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="producto-precio-anterior-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Precio anterior
          </label>
          <input
            type="number"
            id="producto-precio-anterior-input"
            name="precioAnterior"
            value={formData.precioAnterior}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="producto-categoria-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoría *
          </label>
          <input
            type="text"
            id="producto-categoria-input"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            placeholder="ej: celulares, laptops, accesorios"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="producto-marca-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Marca
          </label>
          <input
            type="text"
            id="producto-marca-input"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="producto-stock-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stock
          </label>
          <input
            type="number"
            id="producto-stock-input"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="producto-condicion-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Condición
          </label>
          <select
            id="producto-condicion-input"
            name="condicion"
            value={formData.condicion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
            <option value="reacondicionado">Reacondicionado</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="producto-descripcion-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción
        </label>
        <textarea
          id="producto-descripcion-input"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="producto-imagen-principal-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Imagen principal
        </label>
        <input
          type="url"
          id="producto-imagen-principal-input"
          name="imagenPrincipal"
          value={formData.imagenPrincipal}
          onChange={handleChange}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="producto-video-url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Video URL
        </label>
        <input
          type="url"
          id="producto-video-url-input"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="https://ejemplo.com/video.mp4"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="producto-tag-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Etiquetas
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            id="producto-tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Agregar etiqueta"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Agregar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Imágenes adicionales */}
      <div>
        <label htmlFor="producto-imagen-adicional-url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Imágenes adicionales
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            id="producto-imagen-adicional-url-input"
            value={imageInput.url}
            onChange={(e) => setImageInput(prev => ({ ...prev, url: e.target.value }))}
            placeholder="URL de la imagen"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            id="producto-imagen-adicional-alt-input"
            value={imageInput.alt}
            onChange={(e) => setImageInput(prev => ({ ...prev, alt: e.target.value }))}
            placeholder="Texto alternativo"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="button"
            onClick={addImage}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Agregar
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.imagenes.map((img, index) => (
            <div key={index} className="relative border rounded-lg p-2">
              <Image 
                src={img.url} 
                alt={img.alt} 
                className="w-full h-24 object-cover rounded" 
                width={200}
                height={96}
                priority={false}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{img.alt || "Sin descripción"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campos de fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
        <div>
          <label htmlFor="producto-created-at-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de creación
          </label>
          <input
            type="datetime-local"
            id="producto-created-at-input"
            name="createdAt"
            value={formData.createdAt}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Esta fecha determina si el producto aparece en &quot;Productos Recientes&quot; (últimos 30 días)
          </p>
        </div>

        <div>
          <label htmlFor="producto-updated-at-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Última modificación
          </label>
          <input
            type="datetime-local"
            id="producto-updated-at-input"
            name="updatedAt"
            value={formData.updatedAt}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Fecha de la última actualización del producto
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="disponible"
            checked={formData.disponible}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Disponible</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            name="destacado"
            checked={formData.destacado}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Producto destacado</span>
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saving ? "Guardando..." : producto ? "Actualizar" : "Crear"} Producto
        </button>
      </div>
    </form>
  );
}