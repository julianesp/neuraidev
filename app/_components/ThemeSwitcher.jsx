"use client";

import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Cambio de tema animado (View Transitions):
 *  - a claro: "amanecer", la luz sube desde el horizonte (abajo) con un tono cálido;
 *  - a oscuro: "anochecer", la noche cae desde arriba con un tono azulado.
 * Cada elemento toma su estilo nuevo cuando el borde de luz/sombra pasa sobre él.
 * Las animaciones están en app/globals.css (bloque "Cambio de tema").
 *
 * Sin soporte de View Transitions, o con "reducir movimiento", cambia al instante.
 */
export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
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
  };

  if (!mounted) return null;

  const oscuro = resolvedTheme === "dark";

  // Botón propio (sin la variante "outline" de ui/button, que imponía su fondo
  // y color). Siempre contrasta con la barra: oscuro con luna en modo claro,
  // ámbar con sol en modo oscuro.
  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={oscuro ? "Modo claro" : "Modo oscuro"}
      className="w-10 h-10 inline-flex items-center justify-center rounded-full border-2 shadow-lg transition-[transform,background-color,box-shadow] duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400
        bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800
        dark:bg-amber-300 dark:text-slate-900 dark:border-amber-100 dark:hover:bg-amber-200 dark:shadow-[0_0_14px_rgba(252,211,77,0.55)]"
    >
      {oscuro ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
