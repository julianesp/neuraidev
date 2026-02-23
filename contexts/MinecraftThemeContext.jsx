"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const MinecraftThemeContext = createContext({
  isMinecraftTheme: false,
  toggleMinecraftTheme: () => {},
});

export const useMinecraftTheme = () => {
  const context = useContext(MinecraftThemeContext);
  if (!context) {
    throw new Error('useMinecraftTheme debe usarse dentro de MinecraftThemeProvider');
  }
  return context;
};

export const MinecraftThemeProvider = ({ children }) => {
  const [isMinecraftTheme, setIsMinecraftTheme] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar preferencia del usuario desde localStorage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('minecraft-theme');
    if (savedTheme === 'true') {
      setIsMinecraftTheme(true);
      document.documentElement.classList.add('minecraft-theme');
    }
  }, []);

  // Aplicar o remover la clase del tema
  useEffect(() => {
    if (!mounted) return;

    if (isMinecraftTheme) {
      document.documentElement.classList.add('minecraft-theme');
      localStorage.setItem('minecraft-theme', 'true');
    } else {
      document.documentElement.classList.remove('minecraft-theme');
      localStorage.setItem('minecraft-theme', 'false');
    }
  }, [isMinecraftTheme, mounted]);

  const toggleMinecraftTheme = () => {
    setIsMinecraftTheme(prev => !prev);
  };

  // Evitar flash de contenido sin estilo
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <MinecraftThemeContext.Provider value={{ isMinecraftTheme, toggleMinecraftTheme }}>
      {children}
    </MinecraftThemeContext.Provider>
  );
};
