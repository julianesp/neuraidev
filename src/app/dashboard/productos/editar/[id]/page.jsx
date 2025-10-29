"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload } from "lucide-react";
import {
  obtenerProductoPorId,
  actualizarProducto,
} from "../../../../../lib/supabase/productos";

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    precio_oferta: "",
    categoria: "celulares",
    marca: "",
    stock: 0,
    sku: "",
    activo: true,
    disponible: true,
    destacado: false,
    garantia: 1,
    estado: "nuevo",
    imagen_principal: "",
    imagenes: [""],
  });

  const categorias = [
    "celulares",
    "computadoras",
    "damas",
    "libros-nuevos",
    "libros-usados",
    "generales",
  ];

  const cargarProducto = useCallback(async () => {
    try {
      setLoading(true);
      const producto = await obtenerProductoPorId(params.id);

      if (!producto) {
        alert("Producto no encontrado");
        router.push("/dashboard/productos");
        return;
      }

      setFormData({
        nombre: producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio || "",
        precio_oferta: producto.precio_oferta || "",
        categoria: producto.categoria || "celulares",
        marca: producto.marca || "",
        stock: producto.stock || 0,
        sku: producto.sku || "",
        activo: true,
        disponible: producto.disponible ?? true,
        destacado: producto.destacado ?? false,
        garantia: producto.garantia || 1,
        estado: "nuevo", // Campo de solo UI, no se guarda en DB
        imagen_principal: producto.imagen_principal || "",
        imagenes: [""], // Simplificado por ahora
      });
    } catch (error) {
      console.error("Error cargando producto:", error);
      alert("Error cargando producto: " + error.message);
      router.push("/dashboard/productos");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    cargarProducto();
  }, [cargarProducto]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImagenChange = (index, value) => {
    const nuevasImagenes = [...formData.imagenes];
    nuevasImagenes[index] = value;
    setFormData((prev) => ({ ...prev, imagenes: nuevasImagenes }));
  };

  const agregarImagenCampo = () => {
    setFormData((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, ""],
    }));
  };

  const eliminarImagenCampo = (index) => {
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Limpiar y preparar datos para la tabla products de Supabase
      const productoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio) || 0,
        categoria: formData.categoria,
        marca: formData.marca || null,
        stock: parseInt(formData.stock) || 0,
        sku: formData.sku || null,
        disponible: formData.disponible,
        destacado: formData.destacado,
        // Nota: solo incluir campos que existan en la tabla 'products'
        // Si necesitas más campos, agrégalos a la tabla primero
      };

      // Usar API route en lugar de llamada directa a Supabase
      const response = await fetch(`/api/productos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productoData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error actualizando producto');
      }

      await response.json();

      // Forzar recarga completa eliminando caché
      window.location.href = "/dashboard/productos";
    } catch (error) {
      console.error("Error actualizando producto:", error);
      alert("Error actualizando producto: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Editar Producto
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Modifica la información del producto
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="space-y-6">
            {/* Información básica */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Información Básica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Nombre del producto *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="descripcion"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    rows={4}
                    value={formData.descripcion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="categoria"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Categoría *
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    required
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="marca"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Marca
                  </label>
                  <input
                    id="marca"
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sku"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    SKU
                  </label>
                  <input
                    id="sku"
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="estado"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Estado
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="usado">Usado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Precios e inventario */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Precios e Inventario
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="precio"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Precio *
                  </label>
                  <input
                    id="precio"
                    type="number"
                    name="precio"
                    required
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="precio_oferta"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Precio en Oferta
                  </label>
                  <input
                    id="precio_oferta"
                    type="number"
                    name="precio_oferta"
                    min="0"
                    step="0.01"
                    value={formData.precio_oferta}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Stock
                  </label>
                  <input
                    id="stock"
                    type="number"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="garantia"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Garantía (meses)
                  </label>
                  <input
                    id="garantia"
                    type="number"
                    name="garantia"
                    min="0"
                    value={formData.garantia}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Imágenes
              </h2>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="imagen_principal"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    URL de Imagen Principal
                  </label>
                  <input
                    id="imagen_principal"
                    type="url"
                    name="imagen_principal"
                    value={formData.imagen_principal}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {formData.imagen_principal && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.imagen_principal}
                        alt="Vista previa"
                        className="w-32 h-32 object-cover rounded border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                {formData.imagenes.map((img, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={img}
                      onChange={(e) =>
                        handleImagenChange(index, e.target.value)
                      }
                      placeholder={`URL de imagen ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => eliminarImagenCampo(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={agregarImagenCampo}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Upload className="w-4 h-4" />
                  Agregar otra imagen
                </button>
              </div>
            </div>

            {/* Estados */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Estados
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Activo
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="disponible"
                    checked={formData.disponible}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Disponible
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Destacado
                  </span>
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Actualizar Producto
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
