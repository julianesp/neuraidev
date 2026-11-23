"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Trash2, Loader2, MessageCircle } from "lucide-react";

function formatoFecha(sqlite) {
  // created_at viene en UTC como "YYYY-MM-DD HH:MM:SS"
  const d = new Date(`${sqlite.replace(" ", "T")}Z`);
  return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export default function RespuestasInvitacionPage() {
  const [respuestas, setRespuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [borrando, setBorrando] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/invitacion");
      const data = await res.json();
      setRespuestas(data.respuestas || []);
    } catch {
      setRespuestas([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const borrar = async (id) => {
    setBorrando(id);
    try {
      await fetch(`/api/admin/invitacion?id=${id}`, { method: "DELETE" });
      setRespuestas((r) => r.filter((x) => x.id !== id));
    } finally {
      setBorrando(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Respuestas de la invitación</h1>
        <Link href="/dashboard/invitacion" className="text-sm text-blue-600 hover:text-blue-700 underline">
          Ver invitación
        </Link>
      </div>

      {cargando ? (
        <div className="mt-10 flex justify-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : respuestas.length === 0 ? (
        <p className="mt-10 text-center text-gray-500 dark:text-gray-400">Todavía no hay números guardados.</p>
      ) : (
        <ul className="mt-6 divide-y divide-gray-200 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          {respuestas.map((r) => {
            const wa = r.whatsapp.length === 10 ? `57${r.whatsapp}` : r.whatsapp;
            return (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold tracking-wider text-gray-900 dark:text-white">{r.whatsapp}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatoFecha(r.created_at)}</p>
                </div>
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2"
                >
                  <MessageCircle className="w-4 h-4" /> Escribir
                </a>
                <button
                  type="button"
                  onClick={() => borrar(r.id)}
                  disabled={borrando === r.id}
                  aria-label="Borrar"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  {borrando === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
