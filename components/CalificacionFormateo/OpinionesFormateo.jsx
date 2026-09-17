"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

/**
 * Muestra en la página del servicio técnico las opiniones (comentarios +
 * nombres + estrellas) que los clientes dejaron sobre el formateo y que el
 * admin ya aprobó. No muestra fotos ni emails.
 *
 * Se apoya en /api/testimonios (solo devuelve los 'aprobado') y filtra por
 * tipo === 'formateo'. Si no hay ninguna aprobada, no renderiza nada.
 */
export default function OpinionesFormateo() {
  const [opiniones, setOpiniones] = useState([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    let activo = true;
    fetch("/api/testimonios")
      .then((r) => r.json())
      .then((data) => {
        if (!activo) return;
        const lista = (data.testimonios || []).filter(
          (t) => t.tipo === "formateo"
        );
        setOpiniones(lista);
        setCargado(true);
      })
      .catch(() => setCargado(true));
    return () => {
      activo = false;
    };
  }, []);

  if (!cargado || opiniones.length === 0) return null;

  // Promedio de estrellas para la cabecera.
  const conCalif = opiniones.filter((o) => o.calificacion);
  const promedio =
    conCalif.length > 0
      ? (
          conCalif.reduce((acc, o) => acc + o.calificacion, 0) / conCalif.length
        ).toFixed(1)
      : null;

  return (
    <section className="w-full py-14 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lo que dicen mis clientes
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Opiniones reales de personas a quienes les hice el servicio de
            formateo y mantenimiento.
          </p>
          {promedio && (
            <div className="inline-flex items-center gap-2 mt-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              <Star className="w-5 h-5 text-amber-400" fill="currentColor" />
              <span className="font-bold text-gray-900 dark:text-white">
                {promedio}
              </span>
              <span className="text-sm text-gray-500">
                ({conCalif.length} calificación{conCalif.length !== 1 ? "es" : ""})
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opiniones.map((o) => (
            <div
              key={o.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 relative"
            >
              <Quote className="w-8 h-8 text-blue-200 dark:text-blue-900 mb-2" />
              {o.calificacion && (
                <div className="flex text-amber-400 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      fill={i < o.calificacion ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              )}
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                &ldquo;{o.mensaje}&rdquo;
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                — {o.cliente_nombre}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
