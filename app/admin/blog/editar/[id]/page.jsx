"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";

const BlogEditor = dynamic(() => import("@/components/BlogEditor/BlogEditor"), {
  ssr: false,
  loading: () => <div className="p-4 text-center">Cargando editor...</div>,
});

const CATEGORIES = [
  "Guías de Compra",
  "Tutoriales",
  "Hardware",
  "Desarrollo Web",
  "Noticias",
  "Celulares",
  "Computadores",
  "Accesorios",
  "Software",
];

export default function EditarArticulo() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([{ url: "", source: "" }]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Noticias",
    author: "Equipo Neurai.dev",
    read_time: "",
    image_url: "",
    published: false,
    featured: false,
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/posts/${postId}`);
      const data = await response.json();

      if (response.ok) {
        setFormData({
          ...data.post,
          read_time: data.post.read_time || "",
        });
        // Cargar imágenes guardadas
        const rawUrl = data.post.image_url || "";
        try {
          const parsed = JSON.parse(rawUrl);
          if (Array.isArray(parsed)) {
            setImages(parsed);
          } else {
            setImages([{ url: rawUrl, source: "" }]);
          }
        } catch {
          setImages([{ url: rawUrl, source: "" }]);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el artículo",
      });
      router.push("/admin/blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, publish = null) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!formData.title || !formData.slug || !formData.excerpt || !formData.content) {
        await Swal.fire({
          icon: "error",
          title: "Campos requeridos",
          text: "Por favor completa todos los campos requeridos",
        });
        setSaving(false);
        return;
      }

      const buildImageUrl = () => {
        const valid = images.filter((img) => img.url.trim());
        if (valid.length === 0) return "";
        if (valid.length === 1 && !valid[0].source.trim()) return valid[0].url;
        return JSON.stringify(valid);
      };

      const updateData = {
        ...formData,
        image_url: buildImageUrl(),
        read_time: formData.read_time ? parseInt(formData.read_time) : null,
      };

      // Si se especifica el estado de publicación, actualizarlo
      if (publish !== null) {
        updateData.published = publish;
      }

      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el artículo");
      }

      await Swal.fire({
        icon: "success",
        title: "Guardado",
        text: "El artículo ha sido actualizado",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/admin/blog");
    } catch (error) {
      console.error("Error:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error al guardar el artículo",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar artículo?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/blog/posts/${postId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "El artículo ha sido eliminado",
            timer: 2000,
            showConfirmButton: false,
          });
          router.push("/admin/blog");
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el artículo",
        });
      }
    }
  };

  const addImage = () => setImages([...images, { url: "", source: "" }]);

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated.length > 0 ? updated : [{ url: "", source: "" }]);
  };

  const updateImage = (index, field, value) => {
    const updated = images.map((img, i) =>
      i === index ? { ...img, [field]: value } : img
    );
    setImages(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando artículo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver al panel
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Editar Artículo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {formData.title}
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center"
            >
              <Trash2 size={18} className="mr-2" />
              Eliminar
            </button>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
          {/* [El resto del formulario es igual al de nuevo/page.jsx] */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Información Básica
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tiempo de lectura (minutos)
                  </label>
                  <input
                    type="number"
                    value={formData.read_time}
                    onChange={(e) =>
                      setFormData({ ...formData, read_time: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Extracto *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imágenes
                </label>
                <div className="space-y-3">
                  {images.map((img, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Imagen {index + 1}
                        </span>
                        {images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={img.url}
                        onChange={(e) => updateImage(index, "url", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      <input
                        type="url"
                        value={img.source}
                        onChange={(e) => updateImage(index, "source", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="Fuente (URL del sitio original, opcional)"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addImage}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
                >
                  + Agregar otra URL de imagen
                </button>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Artículo destacado
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Contenido del Artículo *
            </h2>
            <BlogEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold flex items-center disabled:opacity-50"
            >
              <Save size={20} className="mr-2" />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
            {!formData.published && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center disabled:opacity-50"
              >
                <Eye size={20} className="mr-2" />
                {saving ? "Publicando..." : "Publicar Ahora"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
