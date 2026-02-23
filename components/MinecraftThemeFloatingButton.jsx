"use client";

import React, { useState, useEffect } from 'react';
import { useMinecraftTheme } from '@/contexts/MinecraftThemeContext';
import styles from './MinecraftThemeFloatingButton.module.scss';

export default function MinecraftThemeFloatingButton() {
  const { isMinecraftTheme, toggleMinecraftTheme } = useMinecraftTheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verificar si el botón está habilitado desde el admin
    const enabled = localStorage.getItem('minecraft_theme_button_enabled');
    setIsEnabled(enabled === 'true');
  }, []);

  // No mostrar el botón si no está habilitado
  if (!mounted || !isEnabled) return null;

  return (
    <div className={styles.floatingButtonContainer}>
      <button
        onClick={toggleMinecraftTheme}
        className={`${styles.floatingButton} ${isMinecraftTheme ? styles.active : ''}`}
        aria-label={isMinecraftTheme ? "Desactivar tema Minecraft" : "Activar tema Minecraft"}
        title={isMinecraftTheme ? "Desactivar tema Minecraft" : "Activar tema Minecraft"}
      >
        <div className={styles.buttonContent}>
          <div className={`${styles.leverSwitch} ${isMinecraftTheme ? styles.leverActive : ''}`}>
            <div className={styles.stoneBlock}>
              <div className={styles.pixelPattern}></div>
            </div>
            <div className={styles.leverBase}>
              <div className={styles.leverHandle}></div>
            </div>
          </div>
          <span className={styles.buttonLabel}>
            {isMinecraftTheme ? '⛏️' : '🎮'}
          </span>
        </div>
      </button>
    </div>
  );
}
