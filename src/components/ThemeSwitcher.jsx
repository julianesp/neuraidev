"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react"; // Íconos bonitos
import { Button } from "@/components/ui/button"; // Botón estilizado de shadcn

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant="outline"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
