"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react"; // Íconos bonitos
import { Button } from "./ui/button"; // Botón estilizado de shadcn
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // O un loader, o solo el botón sin icono

  return (
    <Button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant="outline"
      className="w-10 h-10 p-0 rounded-full border-2 shadow-lg hover:scale-110 transition-all duration-200
        bg-gray-800 text-yellow-400 border-gray-700
        dark:bg-yellow-400 dark:text-gray-900 dark:border-yellow-500"
      aria-label={
        theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
      title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </Button>
  );
}
