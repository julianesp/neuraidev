"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MessagesSquare, X, ArrowUpRight } from "lucide-react";

const REDES = [
  {
    nombre: "WhatsApp",
    detalle: "317 450 3604 · Respuesta rápida",
    href: "https://wa.me/573174503604",
    icono: "/images/social/whatsapp.png",
    destacado: true,
  },
  {
    nombre: "Facebook",
    detalle: "neurai.dev en Facebook",
    href: "https://www.facebook.com/profile.php?id=100085485673809",
    icono: "/images/social/facebook.png",
  },
  {
    nombre: "Instagram",
    detalle: "@julianrio95",
    href: "https://www.instagram.com/julianrio95/",
    icono: "/images/social/instagram.png",
  },
  {
    nombre: "TikTok",
    detalle: "@julii1295",
    href: "https://www.tiktok.com/@julii1295?_t=8n2OQ52Q4aD&_r=1",
    icono: "/images/social/tiktok.png",
  },
];

/**
 * Botón flotante (abajo a la izquierda) que despliega las redes sociales con
 * su nombre y usuario. Se cierra al tocar afuera, con Escape o al abrir una red.
 */
export default function RedesFlotantes() {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => {
      if (contenedor.current && !contenedor.current.contains(e.target)) setAbierto(false);
    };
    const esc = (e) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("touchstart", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("touchstart", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className="fixed left-3 bottom-3 z-[100]">
      {/* Panel */}
      <nav
        id="panel-redes"
        aria-label="Redes sociales de neurai.dev"
        className={`absolute left-0 bottom-16 w-80 max-w-[calc(100vw-1.5rem)] origin-bottom-left rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl p-3 transition-all duration-200 ${
          abierto
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        }`}
      >
        <p className="px-2 pt-1 pb-2 text-sm font-bold text-gray-900 dark:text-white">
          Síguenos y escríbenos
        </p>
        <ul className="space-y-1">
          {REDES.map((red, i) => (
            <li
              key={red.nombre}
              className={`transition-all duration-300 ${
                abierto ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
              }`}
              style={{ transitionDelay: abierto ? `${60 + i * 50}ms` : "0ms" }}
            >
              <a
                href={red.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAbierto(false)}
                tabIndex={abierto ? 0 : -1}
                className={`flex items-center gap-3 rounded-xl px-2 py-2 transition-colors ${
                  red.destacado
                    ? "bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {/* Fondo blanco: el ícono de TikTok es negro y no se veía en modo oscuro */}
                <span className="w-10 h-10 rounded-full bg-white shadow ring-1 ring-gray-200 dark:ring-gray-700 flex items-center justify-center shrink-0">
                  <Image src={red.icono} alt="" width={28} height={28} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {red.nombre}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                    {red.detalle}
                  </span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-gray-400 shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botón */}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="panel-redes"
        aria-label={abierto ? "Cerrar redes sociales" : "Abrir redes sociales"}
        className="group relative w-[52px] h-[52px] rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-white shadow-lg flex items-center justify-center transition-[transform,background-color] duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
      >
        <span className={`transition-transform duration-200 ${abierto ? "rotate-90" : ""}`}>
          {abierto ? <X className="w-6 h-6" /> : <MessagesSquare className="w-6 h-6" />}
        </span>
        {!abierto && (
          <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Redes sociales
          </span>
        )}
      </button>
    </div>
  );
}
