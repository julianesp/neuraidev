"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Trash2,
  Upload,
  Plus,
  Loader2,
  Pencil,
  Check,
  X,
  Star,
} from "lucide-react";

// Sube un archivo a R2 vía el endpoint existente. Devuelve { url, path }.
async function subirArchivoR2(file) {
  const fd = new FormData();
  fd.append("file", file);
  const up = await fetch("/api/upload-image", { method: "POST", body: fd });
  const data = await up.json();
  if (!up.ok || !data.url) throw new Error(data.error || "No se pudo subir la imagen");
  return { url: data.url, path: data.path };
}

// Borra rutas de R2 (best-effort, sin bloquear).
function limpiarR2(paths) {
  for (const p of paths || []) {
    fetch(`/api/upload-image?path=${encodeURIComponent(p)}`, { method: "DELETE" }).catch(() => {});
  }
}

export default function ColonDashboardPage() {
  const [config, setConfig] = useState({});
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Config
  const [subiendoConfig, setSubiendoConfig] = useState(null); // 'banner' | 'perfil' | null
  const [editTitulo, setEditTitulo] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const bannerInput = useRef(null);
  const perfilInput = useRef(null);

  // Eventos
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [creando, setCreando] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [subiendoEn, setSubiendoEn] = useState(null); // evento_id (galería) | `portada-${id}`
  const [editandoEvento, setEditandoEvento] = useState(null);
  const [evTitulo, setEvTitulo] = useState("");
  const [evDesc, setEvDesc] = useState("");
  const [evFecha, setEvFecha] = useState("");
  const fotoInputs = useRef({});
  const portadaInputs = useRef({});

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/colon");
      const data = await res.json();
      setConfig(data.config || {});
      setEditTitulo(data.config?.titulo || "");
      setEditDesc(data.config?.descripcion || "");
      setEventos(data.eventos || []);
    } catch {
      setConfig({});
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // ── Config: banner / perfil ──
  const cambiarImagenConfig = async (tipo, file) => {
    if (!file) return;
    setSubiendoConfig(tipo);
    try {
      const { url, path } = await subirArchivoR2(file);
      const payload = { tipo: "config" };
      if (tipo === "banner") {
        payload.banner_url = url;
        payload.banner_path = path;
      } else {
        payload.perfil_url = url;
        payload.perfil_path = path;
      }
      const res = await fetch("/api/admin/colon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      limpiarR2(data.storage_paths);
      setConfig((c) => ({
        ...c,
        [`${tipo}_url`]: url,
        [`${tipo}_path`]: path,
      }));
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSubiendoConfig(null);
    }
  };

  const guardarTextosConfig = async () => {
    setGuardandoConfig(true);
    try {
      const res = await fetch("/api/admin/colon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "config",
          titulo: editTitulo,
          descripcion: editDesc,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "No se pudo guardar");
      }
      setConfig((c) => ({ ...c, titulo: editTitulo, descripcion: editDesc }));
    } catch (err) {
      window.alert(err.message);
    } finally {
      setGuardandoConfig(false);
    }
  };

  // ── Eventos: crear ──
  const crearEvento = async () => {
    const titulo = nuevoTitulo.trim();
    if (!titulo) return;
    setCreando(true);
    try {
      const res = await fetch("/api/admin/colon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "crear_evento", titulo }),
      });
      if (res.ok) {
        setNuevoTitulo("");
        await cargar();
      }
    } finally {
      setCreando(false);
    }
  };

  // ── Eventos: portada ──
  const cambiarPortada = async (eventoId, file) => {
    if (!file) return;
    setSubiendoEn(`portada-${eventoId}`);
    try {
      const { url, path } = await subirArchivoR2(file);
      const res = await fetch("/api/admin/colon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "evento",
          id: eventoId,
          portada_url: url,
          portada_path: path,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar la portada");
      limpiarR2(data.storage_paths);
      setEventos((prev) =>
        prev.map((e) =>
          e.id === eventoId ? { ...e, portada_url: url, portada_path: path } : e
        )
      );
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSubiendoEn(null);
    }
  };

  // ── Eventos: editar textos ──
  const abrirEdicionEvento = (e) => {
    setEditandoEvento(e.id);
    setEvTitulo(e.titulo);
    setEvDesc(e.descripcion || "");
    setEvFecha(e.fecha_evento || "");
  };
  const guardarEvento = async (id) => {
    setActionId(id);
    try {
      const res = await fetch("/api/admin/colon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "evento",
          id,
          titulo: evTitulo,
          descripcion: evDesc,
          fecha_evento: evFecha,
        }),
      });
      if (res.ok) {
        setEventos((prev) =>
          prev.map((e) =>
            e.id === id
              ? { ...e, titulo: evTitulo, descripcion: evDesc, fecha_evento: evFecha }
              : e
          )
        );
        setEditandoEvento(null);
      }
    } finally {
      setActionId(null);
    }
  };

  // ── Eventos: destacado ──
  const toggleDestacado = async (e) => {
    const nuevo = e.destacado ? 0 : 1;
    setActionId(e.id);
    try {
      const res = await fetch("/api/admin/colon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "evento", id: e.id, destacado: nuevo }),
      });
      if (res.ok) {
        setEventos((prev) =>
          prev.map((x) => (x.id === e.id ? { ...x, destacado: nuevo } : x))
        );
      }
    } finally {
      setActionId(null);
    }
  };

  // ── Eventos: galería ──
  const agregarFotoGaleria = async (eventoId, file) => {
    if (!file) return;
    setSubiendoEn(eventoId);
    try {
      const { url, path } = await subirArchivoR2(file);
      const res = await fetch("/api/admin/colon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "agregar_foto",
          evento_id: eventoId,
          url,
          storage_path: path,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "No se pudo agregar la foto");
      }
      await cargar();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSubiendoEn(null);
    }
  };

  const eliminarFoto = async (foto) => {
    if (!window.confirm("¿Eliminar esta foto?")) return;
    setActionId(foto.id);
    try {
      const res = await fetch(
        `/api/admin/colon?foto=${encodeURIComponent(foto.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      limpiarR2(data.storage_paths);
      setEventos((prev) =>
        prev.map((e) => ({
          ...e,
          fotos: (e.fotos || []).filter((f) => f.id !== foto.id),
        }))
      );
    } finally {
      setActionId(null);
    }
  };

  const eliminarEvento = async (e) => {
    if (!window.confirm(`¿Eliminar el evento "${e.titulo}" y todas sus fotos?`)) return;
    setActionId(e.id);
    try {
      const res = await fetch(
        `/api/admin/colon?evento=${encodeURIComponent(e.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      limpiarR2(data.storage_paths);
      setEventos((prev) => prev.filter((x) => x.id !== e.id));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Página de Colón
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Gestiona la imagen de fondo, la foto de perfil y los eventos que se
        muestran en{" "}
        <a
          href="/colon"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline"
        >
          /colon
        </a>
        .
      </p>

      {loading ? (
        <p className="text-center text-gray-400 py-10">Cargando…</p>
      ) : (
        <>
          {/* ── Configuración: banner + perfil ── */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Cabecera
            </h2>

            {/* Banner */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagen de fondo (banner)
              </label>
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                {config.banner_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={config.banner_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => bannerInput.current?.click()}
                  disabled={subiendoConfig === "banner"}
                  className="absolute bottom-2 right-2 inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow disabled:opacity-60"
                >
                  {subiendoConfig === "banner" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Cambiar
                </button>
              </div>
              <input
                ref={bannerInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  cambiarImagenConfig("banner", e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Perfil */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Foto de perfil (centrada)
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-28 h-28 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 shrink-0">
                  {config.perfil_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={config.perfil_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                      🏞️
                    </div>
                  )}
                </div>
                <button
                  onClick={() => perfilInput.current?.click()}
                  disabled={subiendoConfig === "perfil"}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
                >
                  {subiendoConfig === "perfil" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Cambiar foto
                </button>
              </div>
              <input
                ref={perfilInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  cambiarImagenConfig("perfil", e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Título + descripción */}
            <div className="grid gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
              <button
                onClick={guardarTextosConfig}
                disabled={guardandoConfig}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-60 w-fit"
              >
                {guardandoConfig ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Guardar textos
              </button>
            </div>
          </div>

          {/* ── Eventos ── */}
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Eventos
          </h2>

          {/* Crear evento */}
          <div className="flex flex-col sm:flex-row gap-2 mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <input
              type="text"
              value={nuevoTitulo}
              onChange={(e) => setNuevoTitulo(e.target.value)}
              placeholder="Título de un nuevo evento (ej. Fiestas patronales 2026)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={crearEvento}
              disabled={creando || !nuevoTitulo.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-60"
            >
              <Plus className="w-4 h-4" /> Crear evento
            </button>
          </div>

          {eventos.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              No hay eventos todavía. Crea el primero arriba.
            </p>
          ) : (
            <div className="space-y-8">
              {eventos.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5"
                >
                  {/* Cabecera del evento */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {editandoEvento === ev.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={evTitulo}
                          onChange={(e) => setEvTitulo(e.target.value)}
                          placeholder="Título"
                          className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="text"
                          value={evFecha}
                          onChange={(e) => setEvFecha(e.target.value)}
                          placeholder="Fecha (ej. 15 de octubre de 2026)"
                          className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                        <textarea
                          value={evDesc}
                          onChange={(e) => setEvDesc(e.target.value)}
                          rows={3}
                          placeholder="Descripción del evento"
                          className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => guardarEvento(ev.id)}
                            disabled={actionId === ev.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          >
                            <Check className="w-4 h-4" /> Guardar
                          </button>
                          <button
                            onClick={() => setEditandoEvento(null)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg"
                          >
                            <X className="w-4 h-4" /> Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {ev.titulo}
                        </h3>
                        {ev.fecha_evento && (
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">
                            {ev.fecha_evento}
                          </p>
                        )}
                        {ev.descripcion && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {ev.descripcion}
                          </p>
                        )}
                      </div>
                    )}

                    {editandoEvento !== ev.id && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleDestacado(ev)}
                          aria-label="Marcar como destacado"
                          title={
                            ev.destacado
                              ? "Destacado (ocupa celda grande)"
                              : "Marcar como destacado"
                          }
                          className={
                            ev.destacado
                              ? "text-yellow-500"
                              : "text-gray-300 hover:text-yellow-500"
                          }
                        >
                          <Star
                            className="w-5 h-5"
                            fill={ev.destacado ? "currentColor" : "none"}
                          />
                        </button>
                        <button
                          onClick={() => abrirEdicionEvento(ev)}
                          aria-label="Editar evento"
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarEvento(ev)}
                          aria-label="Eliminar evento"
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Portada */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Portada (imagen del grid)
                    </p>
                    <div className="relative w-full sm:w-64 h-36 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      {ev.portada_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ev.portada_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        onClick={() => portadaInputs.current[ev.id]?.click()}
                        disabled={subiendoEn === `portada-${ev.id}`}
                        className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow disabled:opacity-60"
                      >
                        {subiendoEn === `portada-${ev.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        Cambiar
                      </button>
                    </div>
                    <input
                      ref={(el) => (portadaInputs.current[ev.id] = el)}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        cambiarPortada(ev.id, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </div>

                  {/* Galería del evento */}
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Galería (fotos del detalle)
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {(ev.fotos || []).map((foto) => (
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

                    <button
                      onClick={() => fotoInputs.current[ev.id]?.click()}
                      disabled={subiendoEn === ev.id}
                      className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-60"
                    >
                      {subiendoEn === ev.id ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6" />
                          <span className="text-xs">Subir foto</span>
                        </>
                      )}
                    </button>
                    <input
                      ref={(el) => (fotoInputs.current[ev.id] = el)}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        agregarFotoGaleria(ev.id, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
