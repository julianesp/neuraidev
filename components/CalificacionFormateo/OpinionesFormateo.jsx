"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import TarjetaOpinion from "@/app/_components/calificar/TarjetaOpinion";

/**
 * Muestra en la página del servicio técnico las opiniones (comentario,
 * nombre, estrellas y, si el cliente lo autorizó, su foto y Facebook) que el
 * admin ya aprobó. Nunca muestra emails.
 *
 * Se apoya en /api/testimonios (solo devuelve los 'aprobado') y filtra por
 * tipo === 'formateo'. Si no hay ninguna aprobada, no renderiza nada.
 */
const TEXTOS = {
  formateo:
    "Opiniones reales de personas a quienes les hice el servicio de formateo y mantenimiento.",
  web: "Opiniones reales de clientes para quienes desarrollé su página web o software.",
};

export default function OpinionesFormateo({ tipo = "formateo" }) {
  const [opiniones, setOpiniones] = useState([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    let activo = true;
    fetch("/api/testimonios")
      .then((r) => r.json())
      .then((data) => {
        if (!activo) return;
        const lista = (data.testimonios || []).filter(
          (t) => t.tipo === tipo
        );
        setOpiniones(lista);
        setCargado(true);
      })
      .catch(() => setCargado(true));
    return () => {
      activo = false;
    };
  }, [tipo]);

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
    <section className="w-full py-14 px-4 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lo que dicen mis clientes
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {TEXTOS[tipo] || TEXTOS.formateo}
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
            <TarjetaOpinion key={o.id} opinion={o} />
          ))}
        </div>
      </div>
    </section>
  );
}
