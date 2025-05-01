"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react"; // Íconos bonitos
import { Button } from "../components/ui/button"; // Botón estilizado de shadcn
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
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
