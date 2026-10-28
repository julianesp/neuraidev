"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import CompartirCalificar from "@/app/_components/calificar/CompartirCalificar";

const ESTADO = {
  pendiente: { texto: "En revisión", clase: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" },
  aprobado: { texto: "Publicada", clase: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" },
  rechazado: { texto: "No publicada", clase: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" },
};

const TIPO = { producto: "Compra", formateo: "Servicio técnico", web: "Página web / software" };

/** Pestaña del perfil: calificaciones que ha dejado el cliente y su estado. */
export default function MisCalificaciones({ calificaciones = [] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mis calificaciones</h2>
        <Link
          href="/#calificar"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Star className="w-4 h-4" />
          Calificar un servicio o compra
        </Link>
      </div>

      {calificaciones.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          Aún no has dejado calificaciones. Si te hice formateo o mantenimiento,
          califícame y gana 15% de descuento en tu próxima compra.
        </p>
      ) : (
        <ul className="space-y-3">
          {calificaciones.map((c) => {
            const estado = ESTADO[c.estado] || ESTADO.pendiente;
            return (
              <li
                key={c.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        fill={i < (c.calificacion || 0) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estado.clase}`}>
                    {estado.texto}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mt-2">&ldquo;{c.mensaje}&rdquo;</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {TIPO[c.tipo] || "Compra"}
                  {c.producto_relacionado && ` · ${c.producto_relacionado}`} ·{" "}
                  {new Date(c.created_at).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <CompartirCalificar titulo="¿Conoces a alguien a quien le hice un servicio? Compártele el enlace" />
    </div>
  );
}
