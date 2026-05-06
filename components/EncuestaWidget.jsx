"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function EncuestaWidget({ slug }) {
  const [encuesta, setEncuesta] = useState(null);
  const [votos, setVotos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`/api/encuestas/${slug}/votos`)
      .then((r) => r.json())
      .then((d) => {
        setEncuesta(d.encuesta || null);
        setVotos(d.votos || []);
      })
      .finally(() => setCargando(false));
  }, [slug]);

  if (cargando) return (
    <div className="flex justify-center py-6">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!encuesta) return null;

  const candidatos = encuesta.candidatos || [];
  const totales = {};
  candidatos.forEach((c) => { totales[c.id] = 0; });
  votos.forEach((v) => { if (totales[v.candidato_id] !== undefined) totales[v.candidato_id]++; });
  const total = Object.values(totales).reduce((s, v) => s + v, 0);
  const encuestaCerrada = new Date() > new Date(encuesta.fecha_cierre);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-1 rounded-full">
            {encuestaCerrada ? "Encuesta cerrada" : "Encuesta activa"}
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">{encuesta.titulo}</h3>
          {encuesta.descripcion && <p className="text-sm text-gray-500 dark:text-gray-400">{encuesta.descripcion}</p>}
        </div>
        <Link href={`/encuestas/${slug}`}
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          {encuestaCerrada ? "Ver resultados" : "Votar ahora"}
        </Link>
      </div>

      {total === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aun no hay votos. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-3 mt-4">
          {candidatos.map((c) => {
            const v = totales[c.id] || 0;
            const pct = total ? ((v / total) * 100).toFixed(1) : 0;
            return (
              <div key={c.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{c.nombre}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{pct}% · {v} votos</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: c.color || "#3b82f6" }} />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-gray-400 text-right">{total} {total === 1 ? "voto" : "votos"} totales</p>
        </div>
      )}
    </div>
  );
}
