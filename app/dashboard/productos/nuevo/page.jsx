"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { crearProducto } from "@/lib/supabase/productos";
import ImageUploader from "@/components/ImageUploader";
import VideoUploader from "@/components/VideoUploader";

export default function NuevoProductoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    precio_oferta: "",
    categoria: "celulares",
    marca: "",
    stock: 0,
    sku: "",
    disponible: true,
    destacado: false,
    vista_horizontal: false,
    garantia: 1,
    estado: "nuevo",
    imagen_principal: "",
    imagenes: [""],
    video_url: "",
    video_type: "direct",
    payment_link: "",
  });

  const categorias = [
    "celulares",
    "computadoras",
    "damas",
    "libros-nuevos",
    "libros-usados",
    "generales",
  ];

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
    setLoading(true);

    try {
      // Limpiar y preparar datos para la tabla products de Supabase
      const metadata = {};
      if (formData.payment_link.trim()) {
        metadata.payment_link = formData.payment_link.trim();
      }

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
        vista_horizontal: formData.vista_horizontal,
        imagen_principal: formData.imagen_principal || null,
        imagenes: Array.isArray(formData.imagenes)
          ? formData.imagenes.filter((img) => img && img.trim() !== "")
          : [],
        video_url: formData.video_url || null,
        video_type: formData.video_type || null,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
      };

      // Usar API route en lugar de llamada directa a Supabase
      const response = await fetch("/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productoData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error creando producto");
      }

      await response.json();

      alert("Producto creado exitosamente");
      router.push("/dashboard/productos");
    } catch (error) {
      console.error("Error creando producto:", error);
      alert("Error creando producto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
              Nuevo Producto
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Agrega un nuevo producto al catálogo
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
              <div className="space-y-4">
                <ImageUploader
                  value={formData.imagen_principal}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, imagen_principal: url }))
                  }
                  label="Imagen Principal"
                />

                <ImageUploader
                  value={formData.imagenes.filter((img) => img)}
                  onChange={(urls) =>
                    setFormData((prev) => ({ ...prev, imagenes: urls }))
                  }
                  label="Imágenes Adicionales"
                  multiple
                />
              </div>
            </div>

            {/* Video del Producto */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Video del Producto
              </h2>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                      ✨ El video se mostrará como primer elemento en la galería
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      Puedes subir un video directamente (MP4) o pegar un enlace de YouTube/Vimeo.
                      El video aparecerá automáticamente en la presentación del producto.
                    </p>
                  </div>
                </div>
              </div>

              <VideoUploader
                value={formData.video_url}
                onChange={(url, type) =>
                  setFormData((prev) => ({
                    ...prev,
                    video_url: url,
                    video_type: type,
                  }))
                }
                label="Video de Presentación"
              />
            </div>

            {/* Payment Link Nequi/Wompi */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Pago con Nequi Negocios
              </h2>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-800 dark:text-purple-300 mb-2">
                  💡 <strong>Configura el enlace de pago de Nequi/Wompi</strong>
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-400">
                  Crea un enlace de pago en tu panel de Wompi/Nequi Negocios y pégalo aquí.
                  Los clientes podrán pagar con Nequi directamente desde el carrito.
                </p>
              </div>
              <div>
                <label
                  htmlFor="payment_link"
                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                >
                  Payment Link (Nequi/Wompi)
                </label>
                <input
                  id="payment_link"
                  type="url"
                  name="payment_link"
                  placeholder="https://checkout.nequi.wompi.co/l/..."
                  value={formData.payment_link}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                {formData.payment_link && (
                  <a
                    href={formData.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400 mt-1 inline-block"
                  >
                    🔗 Probar enlace →
                  </a>
                )}
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

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="vista_horizontal"
                    checked={formData.vista_horizontal}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Vista Horizontal (ocupa 2 columnas)
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
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Producto
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
