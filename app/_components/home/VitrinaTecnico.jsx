"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Monitor, Disc3, Wrench, HardDrive, Zap, ShieldCheck, ArrowRight, Camera } from "lucide-react";

// Los mismos servicios que muestra /servicios/tecnico-sistemas
const SERVICIOS = [
  { icono: Monitor, texto: "Mantenimiento y formateo" },
  { icono: Disc3, texto: "Instalación de software" },
  { icono: Wrench, texto: "Reparación de hardware" },
  { icono: HardDrive, texto: "Recuperación de datos" },
  { icono: Zap, texto: "Actualización de equipos" },
  { icono: ShieldCheck, texto: "Licencias antivirus y Office" },
];

/**
 * Acceso a /servicios/tecnico-sistemas en la home: mosaico con fotos reales de
 * los trabajos (las que se cargan en /dashboard/trabajos) + los servicios que
 * se ofrecen. Muestra lo que de verdad hay en esa página.
 */
export default function VitrinaTecnico() {
  const [fotos, setFotos] = useState([]);
  const [totalFotos, setTotalFotos] = useState(0);
  const [casos, setCasos] = useState(0);

  useEffect(() => {
    let activo = true;
    fetch("/api/trabajos")
      .then((r) => r.json())
      .then(({ trabajos = [] }) => {
        if (!activo) return;
        // Una foto de cada trabajo primero, luego el resto, hasta 5
        const porTrabajo = trabajos.map((t) => t.fotos || []);
        const elegidas = [];
        for (let i = 0; elegidas.length < 5 && porTrabajo.some((f) => f[i]); i++) {
          for (const f of porTrabajo) if (f[i] && elegidas.length < 5) elegidas.push(f[i]);
        }
        setFotos(elegidas);
        setCasos(trabajos.length);
        setTotalFotos(porTrabajo.reduce((s, f) => s + f.length, 0));
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  return (
    <section className="w-full px-4 my-12" data-aos="fade-up">
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl grid lg:grid-cols-2">
        {/* Fotos reales de trabajos */}
        <Link
          href="/servicios/tecnico-sistemas#trabajos"
          className="relative grid grid-cols-4 grid-rows-2 gap-1 bg-gray-900 h-[300px] sm:h-[380px] lg:h-full lg:min-h-[420px] overflow-hidden group"
          aria-label="Ver fotos de trabajos realizados"
        >
          {fotos.length > 0 ? (
            fotos.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt="Trabajo realizado en un computador"
                loading="lazy"
                className={`w-full h-full min-h-0 object-cover transition-transform duration-500 group-hover:scale-105 ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
              />
            ))
          ) : (
            <div className="col-span-4 row-span-2 flex items-center justify-center text-gray-500">
              <Monitor className="w-16 h-16" />
            </div>
          )}
          {totalFotos > 0 && (
            <span className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <Camera className="w-3.5 h-3.5" />
              {totalFotos} fotos de {casos} trabajos reales
            </span>
          )}
        </Link>

        {/* Texto y servicios */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Técnico en sistemas
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">
            Así trabajo en tu computador
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-3">
            Mira paso a paso equipos reales que he revisado, limpiado y dejado
            funcionando, y los servicios que te puedo hacer.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 mt-6">
            {SERVICIOS.map(({ icono: Icono, texto }) => (
              <li key={texto} className="flex items-center gap-2.5 text-sm text-gray-800 dark:text-gray-200">
                <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  {/* fill="none": un estilo global rellena los svg */}
                  <Icono className="w-4 h-4" fill="none" />
                </span>
                {texto}
              </li>
            ))}
          </ul>

          <Link
            href="/servicios/tecnico-sistemas"
            className="mt-8 inline-flex items-center justify-center gap-2 self-start bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Ver mis trabajos y servicios
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
