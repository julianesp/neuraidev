"use client";

import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
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

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      className="w-10 h-10 p-0 rounded-full border-2 shadow-lg hover:scale-110 transition-all duration-200
        bg-gray-800 text-yellow-400 border-gray-700
        dark:bg-yellow-400 dark:text-gray-900 dark:border-yellow-500"
      aria-label={resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={resolvedTheme === "dark" ? "Modo claro" : "Modo oscuro"}
    >
      {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}
