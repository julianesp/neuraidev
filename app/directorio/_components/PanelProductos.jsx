"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { comprimirImagen } from "@/lib/directorio/comprimirImagen";
import { PRODUCTOS_PLAN, pesos } from "@/lib/directorio/planes";

const campo =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white";
const VACIO = { nombre: "", precio: "", descripcion: "", imagen_url: "" };

// Catálogo de un negocio: lista de productos (nombre, precio, foto) y formulario para agregar.
export default function PanelProductos({ negocio, alCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const inputImg = useRef(null);

  const productos = negocio.productos || [];
  const sinPlan = negocio.limite_productos === 0;
  const lleno = productos.length >= negocio.limite_productos;
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

  const agregar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/directorio/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, negocio_id: negocio.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo agregar el producto");
      setForm(VACIO);
      setAbierto(false);
      alCambiar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const alternar = async (p) => {
    await fetch("/api/directorio/productos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, disponible: !p.disponible }),
    });
    alCambiar();
  };

  const quitar = async (p) => {
    if (!window.confirm(`¿Quitar "${p.nombre}" del catálogo?`)) return;
    await fetch(`/api/directorio/productos?id=${encodeURIComponent(p.id)}`, { method: "DELETE" });
    alCambiar();
  };

  return (
    <div className="mt-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
        <ShoppingCart className="h-3.5 w-3.5" /> Catálogo{" "}
        {sinPlan ? "(parte del plan)" : `(${productos.length}/${negocio.limite_productos})`}
      </p>

      {productos.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {productos.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 text-sm dark:border-gray-700">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                {p.imagen_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imagen_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-gray-900 dark:text-white">{p.nombre}</strong>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {p.precio ? pesos(p.precio) : "Consultar precio"}
                  {!p.disponible && " · Agotado"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => alternar(p)}
                className="shrink-0 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-800 hover:border-blue-600 dark:border-gray-700 dark:text-gray-200"
              >
                {p.disponible ? "Marcar agotado" : "Marcar disponible"}
              </button>
              <button
                type="button"
                onClick={() => quitar(p)}
                aria-label={`Quitar ${p.nombre}`}
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
            <Plus className="h-4 w-4" /> Agregar producto
          </button>
          {lleno && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {sinPlan
                ? `Tu plan venció: el catálogo no se muestra ni se pueden publicar productos. Actívalo para volver a vender con hasta ${PRODUCTOS_PLAN} productos${productos.length ? " (los que ya creaste se conservan)" : ""}.`
                : "Llegaste al máximo de productos. Quita uno para agregar otro."}
            </p>
          )}
        </>
      )}

      {abierto && (
        <form onSubmit={agregar} className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Nombre del producto *</span>
            <input className={campo} value={form.nombre} onChange={set("nombre")} maxLength={80} placeholder="Ej: Hamburguesa doble" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Precio en pesos (opcional)</span>
            <input className={campo} inputMode="numeric" value={form.precio} onChange={set("precio")} placeholder="Ej: 18000" />
            <span className="mt-1 block text-xs text-gray-500">Si lo dejas vacío se muestra “Consultar precio”.</span>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Descripción corta (opcional)</span>
            <input className={campo} value={form.descripcion} onChange={set("descripcion")} maxLength={200} placeholder="Ej: Con papas y gaseosa" />
          </label>
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Foto</span>
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

          {negocio.fotos?.length > 0 && (
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                …o usa una foto que ya tienes en tu galería
              </span>
              <div className="flex flex-wrap gap-2">
                {negocio.fotos.map((url) => (
                  <button
                    type="button"
                    key={url}
                    onClick={() => setForm((f) => ({ ...f, imagen_url: url }))}
                    aria-label="Usar esta foto"
                    aria-pressed={form.imagen_url === url}
                    className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${
                      form.imagen_url === url ? "border-blue-600 ring-2 ring-blue-300" : "border-transparent hover:border-blue-400"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <span className="mt-1 block text-xs text-gray-500">
                Así esa misma foto de tu galería lleva el nombre, el precio y el botón “Lo quiero”, sin repetirse.
              </span>
            </div>
          )}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={guardando || subiendo}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium !text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {guardando && <Loader2 className="h-4 w-4 animate-spin" />} Agregar al catálogo
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
