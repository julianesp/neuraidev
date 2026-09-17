"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Trash2, Upload, Plus, Loader2, Pencil, Check, X } from "lucide-react";

export default function TrabajosPage() {
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [subiendoEn, setSubiendoEn] = useState(null); // trabajo_id en el que se está subiendo
  const [editando, setEditando] = useState(null); // trabajo_id en edición
  const [editTitulo, setEditTitulo] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const fileInputs = useRef({});

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/trabajos");
      const data = await res.json();
      setTrabajos(data.trabajos || []);
    } catch {
      setTrabajos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // ── Subir foto a un trabajo ──
  const subirFoto = async (trabajoId, file) => {
    if (!file) return;
    setSubiendoEn(trabajoId);
    try {
      // 1) Subir el archivo a R2 vía el endpoint existente.
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload-image", { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok || !upData.url) throw new Error(upData.error || "No se pudo subir la imagen");

      // 2) Registrar la foto en el trabajo.
      const res = await fetch("/api/admin/trabajos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "agregar_foto",
          trabajo_id: trabajoId,
          url: upData.url,
          storage_path: upData.path,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "No se pudo registrar la foto");
      }
      await cargar();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSubiendoEn(null);
    }
  };

  // ── Eliminar una foto ──
  const eliminarFoto = async (foto) => {
    if (!window.confirm("¿Eliminar esta foto? Esta acción no se puede deshacer.")) return;
    setActionId(foto.id);
    try {
      const res = await fetch(
        `/api/admin/trabajos?foto=${encodeURIComponent(foto.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      // Si la foto estaba en R2, borrarla también del bucket.
      if (data.storage_paths?.length) {
        for (const p of data.storage_paths) {
          fetch(`/api/upload-image?path=${encodeURIComponent(p)}`, { method: "DELETE" }).catch(() => {});
        }
      }
      setTrabajos((prev) =>
        prev.map((t) => ({
          ...t,
          fotos: t.fotos.filter((f) => f.id !== foto.id),
        }))
      );
    } finally {
      setActionId(null);
    }
  };

  // ── Crear nuevo caso ──
  const crearTrabajo = async () => {
    const titulo = nuevoTitulo.trim();
    if (!titulo) return;
    setActionId("nuevo");
    try {
      const res = await fetch("/api/admin/trabajos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "crear_trabajo", titulo }),
      });
      if (res.ok) {
        setNuevoTitulo("");
        await cargar();
      }
    } finally {
      setActionId(null);
    }
  };

  // ── Editar título/descripción ──
  const abrirEdicion = (t) => {
    setEditando(t.id);
    setEditTitulo(t.titulo);
    setEditDesc(t.descripcion || "");
  };
  const guardarEdicion = async (id) => {
    setActionId(id);
    try {
      const res = await fetch("/api/admin/trabajos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, titulo: editTitulo, descripcion: editDesc }),
      });
      if (res.ok) {
        setTrabajos((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, titulo: editTitulo, descripcion: editDesc } : t
          )
        );
        setEditando(null);
      }
    } finally {
      setActionId(null);
    }
  };

  // ── Eliminar caso completo ──
  const eliminarTrabajo = async (t) => {
    if (
      !window.confirm(
        `¿Eliminar "${t.titulo}" y sus ${t.fotos.length} fotos? Esta acción no se puede deshacer.`
      )
    )
      return;
    setActionId(t.id);
    try {
      const res = await fetch(
        `/api/admin/trabajos?trabajo=${encodeURIComponent(t.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.storage_paths?.length) {
        for (const p of data.storage_paths) {
          fetch(`/api/upload-image?path=${encodeURIComponent(p)}`, { method: "DELETE" }).catch(() => {});
        }
      }
      setTrabajos((prev) => prev.filter((x) => x.id !== t.id));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Trabajos del servicio técnico
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Gestiona las fotos que se muestran en{" "}
        <a
          href="/servicios/tecnico-sistemas"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline"
        >
          /servicios/tecnico-sistemas
        </a>
        . Puedes agregar o eliminar fotos y editar cada caso.
      </p>

      {/* Crear nuevo caso */}
      <div className="flex flex-col sm:flex-row gap-2 mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <input
          type="text"
          value={nuevoTitulo}
          onChange={(e) => setNuevoTitulo(e.target.value)}
          placeholder="Título de un nuevo caso (ej. Trabajo en computador — Caso 4)"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={crearTrabajo}
          disabled={actionId === "nuevo" || !nuevoTitulo.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-60"
        >
          <Plus className="w-4 h-4" /> Crear caso
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-10">Cargando…</p>
      ) : trabajos.length === 0 ? (
        <p className="text-center text-gray-400 py-10">
          No hay trabajos todavía. Crea el primer caso arriba.
        </p>
      ) : (
        <div className="space-y-8">
          {trabajos.map((t) => (
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
              {/* Cabecera del caso */}
              <div className="flex items-start justify-between gap-3 mb-4">
                {editando === t.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={2}
                      placeholder="Descripción"
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => guardarEdicion(t.id)}
                        disabled={actionId === t.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg"
                      >
                        <Check className="w-4 h-4" /> Guardar
                      </button>
                      <button
                        onClick={() => setEditando(null)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg"
                      >
                        <X className="w-4 h-4" /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t.titulo}
                    </h2>
                    {t.descripcion && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {t.descripcion}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {t.fotos.length} foto{t.fotos.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                {editando !== t.id && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => abrirEdicion(t)}
                      aria-label="Editar caso"
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => eliminarTrabajo(t)}
                      aria-label="Eliminar caso"
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Rejilla de fotos */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {t.fotos.map((foto) => (
                  <div
                    key={foto.id}
                    className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={foto.url}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => eliminarFoto(foto)}
                      disabled={actionId === foto.id}
                      aria-label="Eliminar foto"
                      className="absolute top-1 right-1 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity disabled:opacity-100"
                    >
                      {actionId === foto.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}

                {/* Botón para agregar foto */}
                <button
                  onClick={() => fileInputs.current[t.id]?.click()}
                  disabled={subiendoEn === t.id}
                  className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-60"
                >
                  {subiendoEn === t.id ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">Subir foto</span>
                    </>
                  )}
                </button>
                <input
                  ref={(el) => (fileInputs.current[t.id] = el)}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    subirFoto(t.id, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
