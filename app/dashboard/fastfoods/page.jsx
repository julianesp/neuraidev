"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { slugify } from "@/lib/fastfoods/utils";
import EditorNegocio from "@/app/fastfoods/_components/editor/EditorNegocio";

// Llama a /api/admin/fastfoods y lanza el error del servidor si falla.
async function api(method, { body } = {}) {
  const res = await fetch("/api/admin/fastfoods", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error en la solicitud");
  return data;
}

const input =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm";
const tarjeta = "bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5";
const botonPrimario =
  "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60";

const ESTADO_COLOR = {
  publicado: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  pendiente: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  suspendido: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default function FastfoodsDashboardPage() {
  const [negocios, setNegocios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoSlug, setNuevoSlug] = useState("");
  const [slugEditado, setSlugEditado] = useState(false);
  const [creando, setCreando] = useState(false);

  const cargarLista = useCallback(async () => {
    try {
      const data = await api("GET");
      setNegocios(data.negocios || []);
    } catch (err) {
      window.alert(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarLista();
  }, [cargarLista]);

  const crear = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setCreando(true);
    try {
      const data = await api("POST", {
        body: { accion: "crear_negocio", nombre: nuevoNombre, slug: nuevoSlug },
      });
      setNuevoNombre("");
      setNuevoSlug("");
      setSlugEditado(false);
      await cargarLista();
      setSeleccionado(data.id);
    } catch (err) {
      window.alert(err.message);
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Fastfoods</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Páginas de negocios de comidas rápidas en <code>/fastfoods/[enlace]</code>: especial del
        día, menú con pedido por WhatsApp y, en plan gratis, productos de neurai.dev al final.
      </p>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* ── Lista + crear ── */}
        <aside className="space-y-4">
          <form onSubmit={crear} className={`${tarjeta} space-y-3`}>
            <h2 className="font-bold text-gray-900 dark:text-white">Nuevo negocio</h2>
            <input
              value={nuevoNombre}
              onChange={(e) => {
                setNuevoNombre(e.target.value);
                if (!slugEditado) setNuevoSlug(slugify(e.target.value));
              }}
              placeholder="Nombre del negocio"
              className={input}
            />
            <div>
              <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm overflow-hidden">
                <span className="pl-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">/fastfoods/</span>
                <input
                  value={nuevoSlug}
                  onChange={(e) => {
                    setNuevoSlug(slugify(e.target.value));
                    setSlugEditado(true);
                  }}
                  placeholder="enlace"
                  className="flex-1 min-w-0 bg-transparent px-1 py-2 text-gray-900 dark:text-white outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Es el enlace que compartirán: evita cambiarlo después.
              </p>
            </div>
            <button type="submit" disabled={creando || !nuevoNombre.trim()} className={`${botonPrimario} w-full`}>
              {creando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Crear
            </button>
          </form>

          <div className={`${tarjeta} p-2`}>
            {cargando ? (
              <p className="text-center text-gray-400 py-6 text-sm">Cargando…</p>
            ) : negocios.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-sm">Aún no hay negocios.</p>
            ) : (
              <ul>
                {negocios.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => setSeleccionado(n.id)}
                      className={`w-full text-left flex items-center gap-3 p-2 rounded-lg ${
                        seleccionado === n.id
                          ? "bg-blue-50 dark:bg-blue-900/30"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                        {n.logo_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={n.logo_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{n.nombre}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">/{n.slug}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ESTADO_COLOR[n.estado]}`}>
                        {n.estado}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* ── Editor ── */}
        <main>
          {seleccionado ? (
            <EditorNegocio
              modo="admin"
              key={seleccionado}
              id={seleccionado}
              onCambioLista={cargarLista}
              onEliminado={() => {
                setSeleccionado(null);
                cargarLista();
              }}
            />
          ) : (
            <div className={`${tarjeta} text-center text-gray-500 dark:text-gray-400 py-16`}>
              Elige un negocio o crea uno nuevo.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
