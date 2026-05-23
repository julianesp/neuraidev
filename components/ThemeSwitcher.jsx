"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState, useRef } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const curtainRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const curtain = curtainRef.current;
    if (!curtain) return;

    // Color de la cortina según el tema que se va a aplicar
    curtain.style.background = nextTheme === "dark" ? "#0f172a" : "#f8fafc";
    curtain.style.transform = "translateY(-100%)";
    curtain.style.transition = "none";
    curtain.style.display = "block";

    // Forzar reflow para que la transición arranque desde arriba
    curtain.getBoundingClientRect();

    // Bajar la cortina
    curtain.style.transition = "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
    curtain.style.transform = "translateY(0%)";

    setTimeout(() => {
      // Aplicar el tema cuando la cortina cubre toda la pantalla
      setTheme(nextTheme);

      // Subir la cortina
      curtain.style.transition = "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
      curtain.style.transform = "translateY(-100%)";

      setTimeout(() => {
        curtain.style.display = "none";
      }, 350);
    }, 350);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Cortina de animación */}
      <div
        ref={curtainRef}
        style={{ display: "none" }}
        className="fixed inset-0 z-[99999] pointer-events-none"
        aria-hidden="true"
      />

      <Button
        onClick={handleToggle}
        variant="outline"
        className="w-10 h-10 p-0 rounded-full border-2 shadow-lg hover:scale-110 transition-all duration-200
          bg-gray-800 text-yellow-400 border-gray-700
          dark:bg-yellow-400 dark:text-gray-900 dark:border-yellow-500"
        aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </Button>
    </>
  );
}
