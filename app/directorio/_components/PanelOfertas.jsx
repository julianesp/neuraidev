"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Tag, Trash2, X } from "lucide-react";
import { comprimirImagen } from "@/lib/directorio/comprimirImagen";
import { OFERTA_MAX_DIAS, OFERTAS_PLAN } from "@/lib/directorio/planes";

const campo =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

const hoyColombia = (dias = 0) =>
  new Date(Date.now() + dias * 86_400_000).toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

const fechaCorta = (vence) =>
  new Date(`${vence}T12:00:00Z`).toLocaleDateString("es-CO", { day: "numeric", month: "long", timeZone: "UTC" });

// Ofertas de un negocio: lista de vigentes + formulario para publicar una nueva.
export default function PanelOfertas({ negocio, alCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState({ titulo: "", descripcion: "", vence: hoyColombia(7), imagen_url: "" });
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const inputImg = useRef(null);

  const ofertas = negocio.ofertas || [];
  const lleno = ofertas.length >= negocio.limite_ofertas;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const subirImagen = async (file) => {
    if (!file) return;
    setSubiendo(true);
    setError("");
    try {
      const liviana = await comprimirImagen(file, { maxLado: 1000 });
      const fd = new FormData();
      fd.append("file", liviana);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "No se pudo subir la imagen");
      setForm((f) => ({ ...f, imagen_url: data.url }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSubiendo(false);
    }
  };

  const publicar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/directorio/ofertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, negocio_id: negocio.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo publicar la oferta");
      setForm({ titulo: "", descripcion: "", vence: hoyColombia(7), imagen_url: "" });
      setAbierto(false);
      alCambiar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const quitar = async (o) => {
    if (!window.confirm(`¿Quitar la oferta "${o.titulo}"?`)) return;
    await fetch(`/api/directorio/ofertas?id=${encodeURIComponent(o.id)}`, { method: "DELETE" });
    alCambiar();
  };

  return (
    <div className="mt-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
        <Tag className="h-3.5 w-3.5" /> Ofertas ({ofertas.length}/{negocio.limite_ofertas})
      </p>

      {ofertas.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {ofertas.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm dark:border-blue-900/50 dark:bg-blue-900/20"
            >
              <span className="min-w-0">
                <strong className="block truncate text-gray-900 dark:text-white">{o.titulo}</strong>
                <span className="text-xs text-gray-600 dark:text-gray-400">Vence el {fechaCorta(o.vence)}</span>
              </span>
              <button
                type="button"
                onClick={() => quitar(o)}
                aria-label={`Quitar oferta ${o.titulo}`}
                className="shrink-0 rounded-md border border-gray-300 p-1.5 text-gray-700 hover:border-gray-900 dark:border-gray-700 dark:text-gray-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!abierto && (
        <>
          <button
            type="button"
            onClick={() => setAbierto(true)}
            disabled={lleno}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium !text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Nueva oferta
          </button>
          {lleno && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {negocio.limite_ofertas === 1
                ? `Con el plan activo puedes tener hasta ${OFERTAS_PLAN} ofertas a la vez. Quita la actual para publicar otra.`
                : "Llegaste al máximo de ofertas vigentes. Quita una para publicar otra."}
            </p>
          )}
        </>
      )}

      {abierto && (
        <form onSubmit={publicar} className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Título de la oferta *</span>
            <input className={campo} value={form.titulo} onChange={set("titulo")} maxLength={80} placeholder="Ej: 2x1 en hamburguesas" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Condiciones (opcional)</span>
            <textarea className={campo} rows={2} value={form.descripcion} onChange={set("descripcion")} maxLength={300} placeholder="Ej: Solo de lunes a jueves" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Vale hasta el *</span>
            <input
              type="date"
              className={campo}
              value={form.vence}
              onChange={set("vence")}
              min={hoyColombia(0)}
              max={hoyColombia(OFERTA_MAX_DIAS)}
              required
            />
            <span className="mt-1 block text-xs text-gray-500">Máximo {OFERTA_MAX_DIAS} días. Al vencer, la oferta se quita sola.</span>
          </label>

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Foto (opcional)</span>
            <div className="flex items-center gap-3">
              {form.imagen_url && (
                <div className="relative h-16 w-16">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imagen_url} alt="" className="h-full w-full rounded-lg object-cover" />
                  <button
                    type="button"
                    aria-label="Quitar foto"
                    onClick={() => setForm((f) => ({ ...f, imagen_url: "" }))}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-gray-900 p-0.5 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => inputImg.current?.click()}
                disabled={subiendo}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:border-blue-600 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
              >
                {subiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {form.imagen_url ? "Cambiar foto" : "Subir foto"}
              </button>
              <input ref={inputImg} type="file" accept="image/*" hidden onChange={(e) => { subirImagen(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={guardando || subiendo}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium !text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {guardando && <Loader2 className="h-4 w-4 animate-spin" />} Publicar oferta
            </button>
            <button
              type="button"
              onClick={() => {
                setAbierto(false);
                setError("");
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
