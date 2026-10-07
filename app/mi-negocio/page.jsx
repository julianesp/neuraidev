"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { slugify } from "@/lib/fastfoods/utils";
import EditorNegocio from "@/app/fastfoods/_components/editor/EditorNegocio";

/*
 * Panel del dueño de un negocio de comidas. La ruta está protegida en
 * proxy.js (pide iniciar sesión). Sin negocio → formulario de registro,
 * que publica la página de inmediato (sin aprobación del admin).
 */
export default function MiNegocioPage() {
  const [estado, setEstado] = useState({ cargando: true, tieneNegocio: false });
  const [recienCreado, setRecienCreado] = useState(null);

  const cargar = async () => {
    try {
      const res = await fetch("/api/mi-negocio");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEstado({ cargando: false, tieneNegocio: !!data.negocio });
    } catch (err) {
      setEstado({ cargando: false, tieneNegocio: false, error: err.message || "No se pudo cargar" });
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16 sm:pt-32">
        {estado.cargando ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : estado.error ? (
          <p className="text-center text-red-600 py-20">{estado.error}</p>
        ) : estado.tieneNegocio ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Mi negocio</h1>
            {recienCreado ? (
              <div className="mb-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 text-green-900 dark:text-green-200">
                <p className="font-semibold">¡Tu página ya está publicada!</p>
                <p className="text-sm mt-1">
                  Agrega tu menú y el especial de hoy, y comparte el enlace en tus grupos de WhatsApp.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Publica el especial de hoy, edita tu menú y comparte tu enlace.
              </p>
            )}
            <EditorNegocio modo="dueno" />
          </>
        ) : (
          <Registro
            onCreado={(slug) => {
              setRecienCreado(slug);
              setEstado({ cargando: false, tieneNegocio: true });
            }}
          />
        )}
      </div>
    </div>
  );
}

const input =
  "w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 text-base";
const label = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

function Registro({ onCreado }) {
  const [form, setForm] = useState({ nombre: "", slug: "", whatsapp: "", ciudad: "" });
  const [slugEditado, setSlugEditado] = useState(false);
  const [slugEstado, setSlugEstado] = useState(null); // { disponible, error? } | null
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Revisa si el enlace está libre mientras escribe (con una pausa corta).
  useEffect(() => {
    if (!form.slug) {
      setSlugEstado(null);
      return;
    }
    let vigente = true;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/mi-negocio?slug=${encodeURIComponent(form.slug)}`);
        const data = await res.json();
        if (vigente) setSlugEstado(data);
      } catch {
        if (vigente) setSlugEstado(null);
      }
    }, 400);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [form.slug]);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const res = await fetch("/api/mi-negocio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "crear_negocio", ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear");
      onCreado(data.slug);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white text-balance">
        Crea la página de tu negocio
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400 text-pretty">
        Menú, especial del día y pedidos por WhatsApp. Queda publicada apenas la crees y la
        puedes editar cuando quieras desde aquí.
      </p>

      <form onSubmit={enviar} className="mt-6 space-y-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
        <div>
          <label className={label} htmlFor="nombre">Nombre del negocio</label>
          <input
            id="nombre"
            required
            value={form.nombre}
            onChange={(e) => {
              const nombre = e.target.value;
              setForm((f) => ({ ...f, nombre, slug: slugEditado ? f.slug : slugify(nombre) }));
            }}
            placeholder="Hamburguesas La Esquina"
            className={input}
          />
        </div>

        <div>
          <label className={label} htmlFor="slug">Tu enlace</label>
          <div className="flex items-center rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 overflow-hidden">
            <span className="pl-4 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">neurai.dev/fastfoods/</span>
            <input
              id="slug"
              required
              value={form.slug}
              onChange={(e) => {
                setSlugEditado(true);
                setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
              }}
              className="flex-1 min-w-0 bg-transparent px-1 py-3 text-base text-gray-900 dark:text-white outline-none"
            />
          </div>
          {slugEstado && (
            <p
              className={`mt-1 text-sm flex items-center gap-1 ${
                slugEstado.disponible ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {slugEstado.disponible ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {slugEstado.disponible ? "Disponible" : slugEstado.error}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Es el enlace que compartirás. No se puede cambiar después.
          </p>
        </div>

        <div>
          <label className={label} htmlFor="whatsapp">WhatsApp donde recibes los pedidos</label>
          <input
            id="whatsapp"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.whatsapp}
            onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
            placeholder="300 123 4567"
            className={input}
          />
        </div>

        <div>
          <label className={label} htmlFor="ciudad">Ciudad o pueblo</label>
          <input
            id="ciudad"
            value={form.ciudad}
            onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))}
            placeholder="Colón, Putumayo"
            className={input}
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={enviando || slugEstado?.disponible === false}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3.5 text-lg disabled:opacity-60"
        >
          {enviando && <Loader2 className="w-5 h-5 animate-spin" />}
          Crear y publicar
        </button>
      </form>
    </div>
  );
}
