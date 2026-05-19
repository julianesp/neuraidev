"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Save,
  GripVertical,
  Eye,
  EyeOff,
  Menu,
} from "lucide-react";
import { useSidebar } from "../layout";
import Swal from "sweetalert2";

const EMPTY_FORM = {
  titulo: "",
  descripcion: "",
  imagen_url: "",
  link: "",
  boton_texto: "Ver más",
  orden: 99,
  activo: true,
};

export default function CarruselPage() {
  const { toggleSidebar } = useSidebar();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/carousel?all=true");
      if (!res.ok) throw new Error("Error al obtener los slides");
      const data = await res.json();
      if (data.success) setSlides(data.slides || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSlide(null);
    setFormData(EMPTY_FORM);
    setPreviewUrl("");
    setShowModal(true);
  };

  const openEditModal = (slide) => {
    setEditingSlide(slide);
    setFormData({
      titulo: slide.titulo,
      descripcion: slide.descripcion ?? "",
      imagen_url: slide.imagen_url,
      link: slide.link ?? "",
      boton_texto: slide.boton_texto ?? "Ver más",
      orden: slide.orden ?? 99,
      activo: slide.activo === 1 || slide.activo === true,
    });
    setPreviewUrl(slide.imagen_url);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        ...(editingSlide && { id: editingSlide.id }),
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        imagen_url: formData.imagen_url,
        link: formData.link || null,
        boton_texto: formData.boton_texto || "Ver más",
        orden: parseInt(formData.orden) || 99,
        activo: formData.activo,
      };

      const method = editingSlide ? "PATCH" : "POST";
      const res = await fetch("/api/carousel", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el slide");
      }

      await fetchSlides();
      setShowModal(false);

      Swal.fire({
        title: "Guardado",
        text: editingSlide ? "Slide actualizado correctamente" : "Slide creado correctamente",
        icon: "success",
        confirmButtonColor: "#2563eb",
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", confirmButtonColor: "#dc2626" });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar slide?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/carousel?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      await fetchSlides();
      Swal.fire({ title: "Eliminado", icon: "success", timer: 1500, timerProgressBar: true, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", confirmButtonColor: "#dc2626" });
    }
  };

  const toggleActivo = async (slide) => {
    try {
      const res = await fetch("/api/carousel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slide.id, activo: !(slide.activo === 1 || slide.activo === true) }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      await fetchSlides();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", confirmButtonColor: "#dc2626" });
    }
  };

  const isActivo = (slide) => slide.activo === 1 || slide.activo === true;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-6 pt-8 md:pt-0">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Carrusel de Presentación
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestiona las imágenes y slides del carrusel principal
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={toggleSidebar}
                className="hidden md:block p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={fetchSlides}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Slide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
          <strong>Nota:</strong> Si no hay slides guardados en la base de datos, el carrusel muestra los slides por defecto.
          Las imágenes deben estar en el bucket R2 (<code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">pub-c0883d14d3e84a69bf84546fa108aa0b.r2.dev</code>).
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        )}

        {/* Slides list */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Cargando slides...</p>
            </div>
          ) : slides.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay slides configurados
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                El carrusel usa los slides por defecto. Crea slides para personalizarlo.
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Slide
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {slides.map((slide) => (
                <div key={slide.id} className="p-4 flex gap-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-28 h-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                    {slide.imagen_url ? (
                      <Image
                        src={slide.imagen_url}
                        alt={slide.titulo}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-mono">
                        #{slide.orden ?? "—"}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isActivo(slide)
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}>
                        {isActivo(slide) ? "Activo" : "Oculto"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{slide.titulo}</h3>
                    {slide.descripcion && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{slide.descripcion}</p>
                    )}
                    {slide.link && (
                      <p className="text-xs text-blue-500 truncate mt-0.5">{slide.link}</p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActivo(slide)}
                      title={isActivo(slide) ? "Ocultar" : "Mostrar"}
                      className={`p-2 rounded-lg transition-colors ${
                        isActivo(slide)
                          ? "text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
                          : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {isActivo(slide) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(slide)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SlideFormModal
          formData={formData}
          setFormData={setFormData}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          isEditing={!!editingSlide}
        />
      )}
    </div>
  );
}

function SlideFormModal({ formData, setFormData, previewUrl, setPreviewUrl, onSubmit, onClose, isEditing }) {
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, imagen_url: url });
    setPreviewUrl(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? "Editar Slide" : "Nuevo Slide"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Preview */}
            {previewUrl && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL de la imagen *
              </label>
              <input
                type="url"
                value={formData.imagen_url}
                onChange={handleImageUrlChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://pub-c0883d14d3e84a69bf84546fa108aa0b.r2.dev/imagen.png"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Sube la imagen al bucket R2 y pega la URL aquí
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción breve
              </label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Texto que aparece debajo del título"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enlace (opcional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="/accesorios/celulares"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Texto del botón
                </label>
                <input
                  type="text"
                  value={formData.boton_texto}
                  onChange={(e) => setFormData({ ...formData, boton_texto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ver más"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Orden
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 = primero</p>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mostrar en el carrusel
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {isEditing ? "Guardar Cambios" : "Crear Slide"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
