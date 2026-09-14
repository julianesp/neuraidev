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

  // Secuencia de activación: barrido de "colocar bloques" + entrada escalonada.
  // Solo al ENCENDER el tema (delight de evento raro); apagar es una salida limpia.
  const playActivationAnimation = () => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const root = document.documentElement;
    root.classList.add('minecraft-theme', 'mc-activating');

    // Overlay de barrido de bloques
    const overlay = document.createElement('div');
    overlay.className = 'mc-place-overlay';
    document.body.appendChild(overlay);

    // Duración alineada con los keyframes CSS (700ms; reducido a 200ms sin movimiento)
    const duration = reduce ? 220 : 720;
    window.setTimeout(() => {
      root.classList.remove('mc-activating');
      overlay.remove();
    }, duration);
  };

  const toggleMinecraftTheme = () => {
    setIsMinecraftTheme(prev => {
      const next = !prev;
      if (next && mounted) {
        // encender: reproducir la animación temática
        playActivationAnimation();
      }
      return next;
    });
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
