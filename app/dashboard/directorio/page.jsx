"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Loader2, Star, Trash2, X } from "lucide-react";
import { nombreCategoria, nombreMunicipio } from "@/lib/directorio/constantes";

const TABS = [
  { id: "aprobado", nombre: "Publicados" },
  { id: "pendiente", nombre: "Por revisar" },
  { id: "rechazado", nombre: "Suspendidos" },
];

export default function DashboardDirectorioPage() {
  const [estado, setEstado] = useState("aprobado");
  const [negocios, setNegocios] = useState([]);
  const [conteo, setConteo] = useState({});
  const [cargando, setCargando] = useState(true);
  const [actionId, setActionId] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`/api/admin/directorio?estado=${estado}`);
      const data = await res.json();
      setNegocios(data.negocios || []);
      setConteo(data.conteo || {});
    } catch {
      setNegocios([]);
    } finally {
      setCargando(false);
    }
  }, [estado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const accion = async (n, tipo, meses) => {
    let motivo;
    if (tipo === "rechazar") {
      motivo = window.prompt("Motivo de la suspensión (se le muestra al dueño):", "");
      if (motivo === null) return;
    }
    setActionId(n.id);
    try {
      await fetch("/api/admin/directorio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id, accion: tipo, motivo, meses }),
      });
      await cargar();
    } finally {
      setActionId(null);
    }
  };

  const quitarOferta = async (o) => {
    if (!window.confirm(`¿Quitar la oferta "${o.titulo}"?`)) return;
    await fetch(`/api/admin/directorio?oferta=${encodeURIComponent(o.id)}`, { method: "DELETE" });
    await cargar();
  };

  const eliminar = async (n) => {
    if (!window.confirm(`¿Eliminar "${n.nombre}" definitivamente?`)) return;
    setActionId(n.id);
    try {
      await fetch(`/api/admin/directorio?id=${encodeURIComponent(n.id)}`, { method: "DELETE" });
      await cargar();
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Directorio del Putumayo</h1>
        <Link
          href="/directorio/mis-negocios"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Publicar una ficha
        </Link>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setEstado(t.id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              estado === t.id
                ? "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-800 dark:border-gray-700 dark:text-gray-200"
            }`}
          >
            {t.nombre} ({conteo[t.id] || 0})
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="mt-8 flex items-center gap-2 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
        </p>
      ) : negocios.length === 0 ? (
        <p className="mt-8 text-gray-600 dark:text-gray-400">No hay fichas en esta lista.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {negocios.map((n) => (
            <li key={n.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex gap-3">
                {(n.fotos[0] || n.logo_url) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.fotos[0] || n.logo_url} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {n.nombre} {n.destacado ? <Star className="inline h-4 w-4 text-blue-600" /> : null}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {nombreCategoria(n.categoria)} · {nombreMunicipio(n.municipio)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {n.whatsapp ? `WhatsApp ${n.whatsapp}` : ""}
                  </p>
                  {n.owner_email && <p className="text-xs text-gray-500">Cuenta: {n.owner_email}</p>}
                  {n.plan_hasta && (
                    <p className="text-xs text-gray-500">
                      Plan hasta {new Date(n.plan_hasta).toLocaleDateString("es-CO")}
                      {new Date(n.plan_hasta) < new Date() ? " (vencido)" : ""}
                    </p>
                  )}
                  {n.descripcion && (
                    <p className="mt-1 line-clamp-3 text-sm text-gray-800 dark:text-gray-200">{n.descripcion}</p>
                  )}
                  {n.ofertas?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {n.ofertas.map((o) => (
                        <p key={o.id} className="flex items-center gap-2 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-900 dark:bg-blue-900/30 dark:text-blue-100">
                          <span className="min-w-0 flex-1 truncate">
                            Oferta: <strong>{o.titulo}</strong> (vence {o.vence})
                          </span>
                          <button
                            onClick={() => quitarOferta(o)}
                            className="shrink-0 rounded border border-blue-300 px-1.5 py-0.5 hover:border-blue-900"
                          >
                            Quitar
                          </button>
                        </p>
                      ))}
                    </div>
                  )}
                  {n.estado === "rechazado" && n.motivo_rechazo && (
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Motivo: {n.motivo_rechazo}</p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {n.estado !== "aprobado" && (
                  <button
                    onClick={() => accion(n, "aprobar")}
                    disabled={actionId === n.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" /> Aprobar
                  </button>
                )}
                {n.estado !== "rechazado" && (
                  <button
                    onClick={() => accion(n, "rechazar")}
                    disabled={actionId === n.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:border-gray-900 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
                  >
                    <X className="h-4 w-4" /> Suspender
                  </button>
                )}
                {n.estado === "aprobado" && (
                  <>
                    <button
                      onClick={() => accion(n, n.destacado ? "quitar_destacado" : "destacar")}
                      disabled={actionId === n.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-600 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-900/30"
                    >
                      <Star className="h-4 w-4" /> {n.destacado ? "Quitar destacado" : "Destacar"}
                    </button>
                    <button
                      onClick={() => accion(n, "extender_plan", 1)}
                      disabled={actionId === n.id}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:border-blue-600 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
                    >
                      +1 mes de plan
                    </button>
                    <button
                      onClick={() => accion(n, "extender_plan", 6)}
                      disabled={actionId === n.id}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:border-blue-600 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
                    >
                      +6 meses
                    </button>
                    <Link
                      href={`/directorio/${n.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                    >
                      <ExternalLink className="h-4 w-4" /> Ver
                    </Link>
                  </>
                )}
                <button
                  onClick={() => eliminar(n)}
                  disabled={actionId === n.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:border-gray-900 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
