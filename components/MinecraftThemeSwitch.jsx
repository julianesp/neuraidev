"use client";

import React from 'react';
import { useMinecraftTheme } from '@/contexts/MinecraftThemeContext';
import styles from './MinecraftThemeSwitch.module.scss';

export default function MinecraftThemeSwitch() {
  const { isMinecraftTheme, toggleMinecraftTheme } = useMinecraftTheme();

  return (
    <div className={styles.minecraftSwitchContainer}>
      <label className={styles.switchLabel}>
        <span className={styles.labelText}>
          {isMinecraftTheme ? '⛏️ Tema Minecraft' : '🎮 Tema Minecraft'}
        </span>
        <div
          className={`${styles.leverSwitch} ${isMinecraftTheme ? styles.active : ''}`}
          onClick={toggleMinecraftTheme}
          role="switch"
          aria-checked={isMinecraftTheme}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleMinecraftTheme();
            }
          }}
        >
          <div className={styles.leverBase}>
            <div className={styles.leverHandle}></div>
          </div>
          <div className={styles.stoneBlock}></div>
        </div>
      </label>
    </div>
  );
}
