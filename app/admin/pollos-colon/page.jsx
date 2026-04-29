"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Upload,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const ADMIN_EMAIL = "hesucabrera223@umariana.edu.co";

export default function AdminPollosColon() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Formulario nueva publicación
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenesFiles, setImagenesFiles] = useState([]);
  const [imagenesPreviews, setImagenesPreviews] = useState([]);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const fileInputRef = useRef(null);

  // Edición inline
  const [editandoId, setEditandoId] = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");

  // Verificar que sea el admin correcto
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    const emails = user.emailAddresses.map((e) => e.emailAddress);
    if (!emails.includes(ADMIN_EMAIL)) {
      router.replace("/");
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  async function fetchPublicaciones() {
    try {
      const res = await fetch("/api/pollos-colon");
      const data = await res.json();
      setPublicaciones(data.publicaciones || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const total = imagenesFiles.length + files.length;
    if (total > 5) {
      alert("Máximo 5 fotos por publicación");
      return;
    }
    setImagenesFiles((prev) => [...prev, ...files]);
    setImagenesPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  }

  function quitarImagen(idx) {
    setImagenesFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagenesPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function subirTodasImagenes() {
    setSubiendoImagen(true);
    try {
      const resultados = await Promise.all(
        imagenesFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload-image", { method: "POST", body: formData });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          return { url: data.url, path: data.path };
        })
      );
      return resultados;
    } finally {
      setSubiendoImagen(false);
    }
  }

  async function handleCrear(e) {
    e.preventDefault();
    if (!titulo.trim() || imagenesFiles.length === 0) return;
    setGuardando(true);
    try {
      const imagenes = await subirTodasImagenes();

      const res = await fetch("/api/pollos-colon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          imagen_url: imagenes[0].url,
          imagen_path: imagenes[0].path,
          imagenes_urls: imagenes.map((i) => i.url),
          imagenes_paths: imagenes.map((i) => i.path),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPublicaciones((prev) => [data.publicacion, ...prev]);
      setTitulo("");
      setDescripcion("");
      setImagenesFiles([]);
      setImagenesPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert("Error al crear la publicación: " + err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(pub) {
    if (!confirm(`¿Eliminar "${pub.titulo}"?`)) return;
    try {
      const params = new URLSearchParams({ id: pub.id });
      if (pub.imagen_path) params.set("imagen_path", pub.imagen_path);
      if (pub.imagenes_paths?.length) params.set("imagenes_paths", JSON.stringify(pub.imagenes_paths));
      const res = await fetch(`/api/pollos-colon?${params}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setPublicaciones((prev) => prev.filter((p) => p.id !== pub.id));
    } catch (err) {
      alert(err.message);
    }
  }

  function iniciarEdicion(pub) {
    setEditandoId(pub.id);
    setEditTitulo(pub.titulo);
    setEditDescripcion(pub.descripcion || "");
  }

  async function guardarEdicion(id) {
    try {
      const res = await fetch("/api/pollos-colon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, titulo: editTitulo, descripcion: editDescripcion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPublicaciones((prev) =>
        prev.map((p) => (p.id === id ? data.publicacion : p))
      );
      setEditandoId(null);
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="mb-8 mt-12 flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pollos Colón — Admin
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Gestiona las publicaciones de venta de pollos encubados
            </p>
          </div>
        </div>

        {/* Formulario nueva publicación */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-yellow-500" />
            Nueva publicación
          </h2>
          <form onSubmit={handleCrear} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Pollos listos para entrega - 20 unidades"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalla el peso, precio, disponibilidad, zona de entrega..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fotos * <span className="text-gray-400 font-normal">(máx. 5)</span>
              </label>
              {imagenesPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {imagenesPreviews.map((src, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-gray-700">
                      <img src={src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => quitarImagen(idx)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imagenesFiles.length < 5 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-yellow-500 transition-colors flex flex-col items-center gap-2"
                >
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {imagenesFiles.length === 0 ? "Haz clic para agregar fotos" : "Agregar más fotos"}
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <button
              type="submit"
              disabled={guardando || subiendoImagen || !titulo.trim() || imagenesFiles.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {guardando || subiendoImagen ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {subiendoImagen ? "Subiendo imagen..." : "Guardando..."}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Publicar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lista de publicaciones */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Publicaciones ({publicaciones.length})
          </h2>
          {publicaciones.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              No hay publicaciones aún. Crea la primera arriba.
            </div>
          )}
          {publicaciones.map((pub) => (
            <div
              key={pub.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="flex gap-4 p-4">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={pub.imagen_url}
                    alt={pub.titulo}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {editandoId === pub.id ? (
                    <div className="space-y-2">
                      <input
                        value={editTitulo}
                        onChange={(e) => setEditTitulo(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      <textarea
                        value={editDescripcion}
                        onChange={(e) => setEditDescripcion(e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => guardarEdicion(pub.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
                        >
                          <Check className="w-3 h-3" /> Guardar
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-xs rounded-lg transition-colors"
                        >
                          <X className="w-3 h-3" /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
                        {pub.titulo}
                      </p>
                      {pub.descripcion && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                          {pub.descripcion}
                        </p>
                      )}
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                        {new Date(pub.created_at).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </>
                  )}
                </div>
                {editandoId !== pub.id && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => iniciarEdicion(pub)}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEliminar(pub)}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
