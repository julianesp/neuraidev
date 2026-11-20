"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Loader2,
  Plus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import {
  apiLugares,
  borrarLugarMedia,
  fechaLegible,
  subirArchivosLugar,
  textoEstado,
} from "@/app/colon/subirMedia";

/**
 * Lugares de Colón (parque, termales, iglesia…): nombre, descripción, orden,
 * fotos y vídeos. Es lo que se ve en la sección «Lugares de Colón» de /colon.
 */
export default function LugaresAdmin() {
  const [lugares, setLugares] = useState([]);
  const [media, setMedia] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevo, setNuevo] = useState("");
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const r = await fetch("/api/colon", { cache: "no-store" });
      const d = await r.json();
      setLugares(Array.isArray(d.lugares) ? d.lugares : []);
      setMedia(Array.isArray(d.media) ? d.media : []);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Llegar desde /colon con #lugares.
  useEffect(() => {
    if (!cargando && window.location.hash === "#lugares") {
      document.getElementById("lugares")?.scrollIntoView({ block: "start" });
    }
  }, [cargando]);

  const accion = async (method, body) => {
    try {
      await apiLugares(method, body);
      await cargar();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    if (!nuevo.trim()) return;
    setCreando(true);
    await accion("POST", { accion: "crear_lugar", titulo: nuevo });
    setNuevo("");
    setCreando(false);
  };

  return (
    <section id="lugares" className="mb-10 scroll-mt-24">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Lugares</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Tarjetas de «Lugares de Colón». La primera foto de cada lugar es su portada.
      </p>

      <form
        onSubmit={crear}
        className="flex flex-col sm:flex-row gap-2 mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
      >
        <input
          type="text"
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder="Nombre del nuevo lugar (p. ej. Termales)"
          maxLength={80}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          disabled={creando || !nuevo.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg"
        >
          {creando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Agregar lugar
        </button>
      </form>

      {cargando ? (
        <p className="text-center text-gray-400 py-6">Cargando lugares…</p>
      ) : lugares.length === 0 ? (
        <p className="text-center text-gray-400 py-6">Aún no hay lugares.</p>
      ) : (
        <div className="space-y-4">
          {lugares.map((lugar, i) => (
            <LugarTarjeta
              key={lugar.id}
              lugar={lugar}
              media={media.filter((m) => m.lugar_id === lugar.id)}
              primero={i === 0}
              ultimo={i === lugares.length - 1}
              accion={accion}
              recargar={cargar}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function LugarTarjeta({ lugar, media, primero, ultimo, accion, recargar }) {
  const [titulo, setTitulo] = useState(lugar.titulo || "");
  const [descripcion, setDescripcion] = useState(lugar.descripcion || "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [cola, setCola] = useState([]);
  const [ocupadoId, setOcupadoId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setTitulo(lugar.titulo || "");
    setDescripcion(lugar.descripcion || "");
  }, [lugar.titulo, lugar.descripcion]);

  const cambios = titulo.trim() !== (lugar.titulo || "") || descripcion.trim() !== (lugar.descripcion || "");
  const subiendo = cola.some((c) => c.estado === "subiendo" || c.estado === "procesando");

  const guardar = async () => {
    setGuardando(true);
    await accion("PATCH", { accion: "editar_lugar", id: lugar.id, titulo, descripcion });
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const subir = async (e) => {
    const archivos = [...(e.target.files || [])];
    e.target.value = "";
    if (archivos.length === 0) return;
    const ok = await subirArchivosLugar(lugar.id, archivos, setCola);
    if (ok > 0) await recargar();
  };

  const conBloqueo = async (id, fn) => {
    setOcupadoId(id);
    await fn();
    setOcupadoId(null);
  };

  const borrarLugar = async () => {
    if (!window.confirm(`¿Borrar «${lugar.titulo}» con todas sus fotos y vídeos? No se puede deshacer.`)) return;
    try {
      await borrarLugarMedia({ lugarId: lugar.id });
      await recargar();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const borrarMedia = (m) =>
    conBloqueo(m.id, async () => {
      if (!window.confirm(`¿Borrar este ${m.tipo === "video" ? "vídeo" : "foto"}?`)) return;
      try {
        await borrarLugarMedia({ mediaId: m.id });
        await recargar();
      } catch (err) {
        window.alert(err.message);
      }
    });

  const btnIcono =
    "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-600 hover:text-blue-700 disabled:opacity-30 disabled:hover:border-gray-300";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={80}
            aria-label="Nombre del lugar"
            className="w-full px-3 py-2 text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            maxLength={600}
            placeholder="Descripción (opcional)"
            aria-label="Descripción del lugar"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-y"
          />
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className={btnIcono}
            disabled={primero}
            onClick={() => accion("PATCH", { accion: "mover_lugar", id: lugar.id, dir: -1 })}
            aria-label="Subir lugar"
            title="Subir"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={btnIcono}
            disabled={ultimo}
            onClick={() => accion("PATCH", { accion: "mover_lugar", id: lugar.id, dir: 1 })}
            aria-label="Bajar lugar"
            title="Bajar"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button
          type="button"
          onClick={guardar}
          disabled={!cambios || guardando || !titulo.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
        >
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {guardado ? "Guardado" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm font-semibold rounded-lg"
        >
          {subiendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Subir fotos o vídeos
        </button>
        <a
          href={`/colon#${lugar.id}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 text-sm text-blue-600 hover:underline"
        >
          Ver en /colon
        </a>
        <button
          type="button"
          onClick={borrarLugar}
          className="ml-auto inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          <Trash2 className="w-4 h-4" /> Borrar lugar
        </button>
        <input ref={inputRef} type="file" accept="image/*,video/*" multiple hidden onChange={subir} />
      </div>

      {cola.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
          {cola.map((c, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="truncate">{c.nombre}</span>
              <span className={c.estado === "error" ? "text-red-600" : ""}>{textoEstado(c)}</span>
            </li>
          ))}
        </ul>
      )}

      {media.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">Sin fotos ni vídeos todavía.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media.map((m, j) => (
            <div key={m.id} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <div className="relative aspect-[4/3]">
                {m.tipo === "video" ? (
                  <video src={`${m.url}#t=0.1`} preload="metadata" muted playsInline className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.thumb_url || m.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                )}
                {m.fecha_toma && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs">
                    {fechaLegible(m.fecha_toma)}
                  </span>
                )}
              </div>
              {j === 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
                  Portada
                </span>
              )}
              {m.tipo === "video" && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs">
                  Vídeo
                </span>
              )}
              <div className="flex items-center justify-between gap-1 p-1.5 bg-white dark:bg-gray-800">
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={btnIcono}
                    disabled={j === 0 || ocupadoId === m.id}
                    onClick={() => conBloqueo(m.id, () => accion("PATCH", { accion: "mover_media", id: m.id, dir: -1 }))}
                    aria-label="Mover antes"
                    title="Mover antes"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className={btnIcono}
                    disabled={j === media.length - 1 || ocupadoId === m.id}
                    onClick={() => conBloqueo(m.id, () => accion("PATCH", { accion: "mover_media", id: m.id, dir: 1 }))}
                    aria-label="Mover después"
                    title="Mover después"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={btnIcono}
                    disabled={j === 0 || ocupadoId === m.id}
                    onClick={() => conBloqueo(m.id, () => accion("PATCH", { accion: "portada", id: m.id }))}
                    aria-label="Usar como portada"
                    title="Usar como portada"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className={btnIcono}
                    disabled={ocupadoId === m.id}
                    onClick={() => borrarMedia(m)}
                    aria-label="Borrar"
                    title="Borrar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
