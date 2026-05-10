"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Upload, Trash2, Play, Pause, X, Plus } from "lucide-react";

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatName(name) {
  // Eliminar timestamp inicial y extension
  return name.replace(/^\d+-/, "").replace(/\.[^.]+$/, "").replace(/-/g, " ");
}

export default function AudiosPage() {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [playingUrl, setPlayingUrl] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAudios();
  }, []);

  async function fetchAudios() {
    setLoading(true);
    try {
      const res = await fetch("/api/audios");
      const data = await res.json();
      if (data.audios) setAudios(data.audios);
    } catch {
      setError("Error cargando los audios");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("titulo", titulo || file.name);

    try {
      const res = await fetch("/api/audios", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error subiendo audio");
      } else {
        setShowUpload(false);
        setTitulo("");
        fileInputRef.current.value = "";
        fetchAudios();
      }
    } catch {
      setError("Error subiendo el audio");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(audio) {
    if (!confirm(`¿Eliminar "${formatName(audio.name)}"?`)) return;
    setDeleting(audio.path);
    try {
      const res = await fetch(`/api/audios?path=${encodeURIComponent(audio.path)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (playingUrl === audio.url) stopAudio();
        setAudios((prev) => prev.filter((a) => a.path !== audio.path));
      }
    } finally {
      setDeleting(null);
    }
  }

  function togglePlay(url) {
    if (playingUrl === url) {
      stopAudio();
    } else {
      setPlayingUrl(url);
    }
  }

  function stopAudio() {
    setPlayingUrl(null);
  }

  return (
    <div className="max-w-3xl mx-auto mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mic className="w-6 h-6 text-blue-600" />
            Mis Grabaciones
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Audios privados para compartir con clientes desde tu perfil
          </p>
        </div>
        <button
          onClick={() => { setShowUpload(!showUpload); setError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Subir audio
        </button>
      </div>

      {/* Formulario de subida */}
      {showUpload && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Nuevo audio</h2>
            <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Explicación del servicio de mantenimiento"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Archivo de audio
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.opus"
                required
                className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">MP3, M4A, WAV, OGG, AAC, Opus — máx. 50MB</p>
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Subiendo..." : "Subir"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de audios */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : audios.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
          <Mic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No hay grabaciones aún</p>
          <p className="text-sm text-gray-400 mt-1">Sube tu primer audio con el botón de arriba</p>
        </div>
      ) : (
        <div className="space-y-3">
          {audios.map((audio) => (
            <div
              key={audio.path}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center gap-3">
                {/* Botón play/pause */}
                <button
                  onClick={() => togglePlay(audio.url)}
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  {playingUrl === audio.url ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate capitalize">
                    {formatName(audio.name)}
                  </p>
                  {audio.size > 0 && (
                    <p className="text-xs text-gray-400">{formatSize(audio.size)}</p>
                  )}

                  {/* Reproductor (solo visible cuando está activo) */}
                  {playingUrl === audio.url && (
                    <audio
                      ref={audioRef}
                      src={audio.url}
                      autoPlay
                      controls
                      onEnded={stopAudio}
                      className="w-full mt-2 h-8"
                    />
                  )}
                </div>

                {/* Eliminar */}
                <button
                  onClick={() => handleDelete(audio)}
                  disabled={deleting === audio.path}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {audios.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-4">
          {audios.length} grabacion{audios.length !== 1 ? "es" : ""} — solo visible desde el dashboard
        </p>
      )}
    </div>
  );
}
