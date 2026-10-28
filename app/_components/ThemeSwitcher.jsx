"use client";

import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { Sun, Moon, Clock, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  NOCHE_FIN,
  NOCHE_INICIO,
  cambiarTemaManual,
  fijarModoTema,
  obtenerModoTema,
  suscribirTema,
  temaEsOscuro,
} from "@/lib/tema";

/**
 * Aplica un tema con la transición animada (View Transitions):
 *  - a claro: "amanecer", la luz sube desde el horizonte (abajo) con un tono cálido;
 *  - a oscuro: "anochecer", la noche cae desde arriba con un tono azulado.
 * Las animaciones están en app/globals.css (bloque "Cambio de tema").
 * Sin soporte de View Transitions, o con "reducir movimiento", cambia al instante.
 */
function aplicarTema(nextTheme, setTheme) {
  const root = document.documentElement;
  const sinAnimacion =
    typeof document.startViewTransition !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (sinAnimacion) {
    setTheme(nextTheme);
    return;
  }

  root.dataset.transicionTema = nextTheme === "light" ? "amanecer" : "anochecer";
  const transicion = document.startViewTransition(() => {
    // next-themes aplica la clase en un efecto (diferido): aquí la ponemos ya,
    // para que la "foto" nueva de la transición salga con el tema nuevo.
    root.classList.remove("light", "dark");
    root.classList.add(nextTheme);
    root.style.colorScheme = nextTheme;
    flushSync(() => setTheme(nextTheme));
  });
  transicion.finished.finally(() => {
    delete root.dataset.transicionTema;
  });
}

/**
 * Mantiene el tema según la hora o el modo elegido (lib/tema.js). Va una sola
 * vez en el layout, dentro del ThemeProvider: revisa cada minuto y cuando el
 * usuario cambia el modo (también desde otra pestaña).
 */
export function TemaPorHora() {
  const { resolvedTheme, setTheme } = useTheme();
  const actual = useRef(resolvedTheme);
  actual.current = resolvedTheme;

  useEffect(() => {
    const sincronizar = () => {
      const deseado = temaEsOscuro() ? "dark" : "light";
      if (actual.current && actual.current !== deseado) aplicarTema(deseado, setTheme);
    };
    sincronizar();
    return suscribirTema(sincronizar);
  }, [setTheme]);

  return null;
}

const hora = (h) => `${h % 12 || 12} ${h < 12 ? "am" : "pm"}`;

/**
 * Botón sol/luna del encabezado: abre un menú para dejar el tema según la
 * hora, siempre claro o siempre oscuro. Se recuerda en este dispositivo.
 */
export default function ThemeSwitcher() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [modo, setModo] = useState("auto");
  const contenedor = useRef(null);

  useEffect(() => {
    setMounted(true);
    setModo(obtenerModoTema());
    return suscribirTema(() => setModo(obtenerModoTema()));
  }, []);

  // Cerrar con clic afuera o Escape
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => {
      if (contenedor.current && !contenedor.current.contains(e.target)) setAbierto(false);
    };
    const esc = (e) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [abierto]);

  if (!mounted) return null;

  const oscuro = resolvedTheme === "dark";

  const elegir = (nuevo) => {
    fijarModoTema(nuevo);
    setAbierto(false);
  };

  const opciones = [
    {
      valor: "auto",
      icono: Clock,
      texto: "Según la hora",
      detalle: `Claro de ${hora(NOCHE_FIN)} a ${hora(NOCHE_INICIO)}`,
    },
    { valor: "light", icono: Sun, texto: "Siempre claro" },
    { valor: "dark", icono: Moon, texto: "Siempre oscuro" },
  ];

  // Botón propio (sin la variante "outline" de ui/button, que imponía su fondo
  // y color). Siempre contrasta con la barra: oscuro con luna en modo claro,
  // ámbar con sol en modo oscuro.
  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Tema de la pantalla"
        aria-haspopup="menu"
        aria-expanded={abierto}
        title="Tema de la pantalla"
        className="w-10 h-10 inline-flex items-center justify-center rounded-full border-2 shadow-lg transition-[transform,background-color,box-shadow] duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400
          bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800
          dark:bg-amber-300 dark:text-slate-900 dark:border-amber-100 dark:hover:bg-amber-200 dark:shadow-[0_0_14px_rgba(252,211,77,0.55)]"
      >
        {oscuro ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute left-0 top-12 z-50 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl p-2 text-left"
        >
          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Tema de la pantalla
          </p>
          {opciones.map(({ valor, icono: Icono, texto, detalle }) => (
            <button
              key={valor}
              type="button"
              role="menuitemradio"
              aria-checked={modo === valor}
              onClick={() => elegir(valor)}
              className={`w-full flex items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                modo === valor
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                  : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {/* fill explícito: un estilo global rellena los svg y el reloj salía como un círculo */}
              <Icono className="w-4 h-4 mt-0.5 shrink-0" fill={valor === "dark" ? "currentColor" : "none"} />
              <span className="flex-1">
                {texto}
                {detalle && (
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{detalle}</span>
                )}
              </span>
              {modo === valor && <Check className="w-4 h-4 mt-0.5 shrink-0" />}
            </button>
          ))}
          {modo === "auto" && (
            <>
              <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  cambiarTemaManual(!oscuro);
                  setAbierto(false);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {oscuro ? "Pasar a claro" : "Pasar a oscuro"} solo por ahora
                <span className="block text-gray-400 dark:text-gray-500">
                  Vuelve a la hora en el siguiente cambio ({oscuro ? hora(NOCHE_FIN) : hora(NOCHE_INICIO)})
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
