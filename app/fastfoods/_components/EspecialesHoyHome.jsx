"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TarjetaHoy from "./TarjetaHoy";

/**
 * Sección del home de neurai.dev con los especiales vigentes de los negocios
 * de comidas. Si hoy no hay ninguno, no se muestra nada.
 */
export default function EspecialesHoyHome() {
  const [especiales, setEspeciales] = useState([]);

  useEffect(() => {
    fetch("/api/fastfoods/hoy?limite=8")
      .then((r) => (r.ok ? r.json() : { especiales: [] }))
      .then((d) => setEspeciales(Array.isArray(d.especiales) ? d.especiales : []))
      .catch(() => {});
  }, []);

  if (especiales.length === 0) return null;

  return (
    <section className="w-full min-w-0 max-w-6xl mx-auto px-4 py-8" aria-labelledby="especiales-hoy">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
            Comidas
          </p>
          <h2 id="especiales-hoy" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            ¿Qué hay para comer hoy?
          </h2>
        </div>
        <Link
          href="/fastfoods/hoy"
          className="flex-shrink-0 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline underline-offset-4"
        >
          Ver todos
        </Link>
      </div>
      <ul className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-4 pb-2 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {especiales.map((e) => (
          <li key={e.id} className="snap-start flex-shrink-0 w-56 sm:w-64">
            <TarjetaHoy e={e} compacta />
          </li>
        ))}
      </ul>
    </section>
  );
}
