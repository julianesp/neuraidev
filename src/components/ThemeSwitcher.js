"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import styles from "@/styles/components/ThemeSwitcher.module.scss";

const ThemeSwitcher = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);

  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Añadimos un efecto para forzar los estilos del tema oscuro directamente
  useEffect(() => {
    setMounted(true);
    setIsLoaded(true);

    if (mounted) {
      if (resolvedTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.body.style.backgroundColor = "#121212";
        document.body.style.color = "#e0e0e0";
      } else {
        document.documentElement.classList.remove("dark");
        document.body.style.backgroundColor = "";
        document.body.style.color = "";
      }
    }
  }, [resolvedTheme, mounted]);
  if (!isLoaded) return null;
  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    console.log("Cambiando tema a:", newTheme);

    // Forzar el cambio de clase inmediatamente para el elemento HTML
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#121212";
      document.body.style.color = "#e0e0e0";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    }
  };

  return (
    <div className={styles.themeContainer}>
      <button
        className={`${styles.themeToggle} ${resolvedTheme === "dark" ? styles.darkMode : styles.lightMode}`}
        onClick={toggleTheme}
        aria-label="Cambiar tema"
      >
        {resolvedTheme === "dark" ? (
          <Sun className={styles.icon} size={20} />
        ) : (
          <Moon className={styles.icon} size={20} />
        )}
      </button>
      <span className={styles.themeDebug}>
        Tema: {theme} / Resuelto: {resolvedTheme}
      </span>
    </div>
  );
};

export default ThemeSwitcher;
