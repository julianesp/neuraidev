"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Accessibility,
  Type,
  Volume2,
  VolumeX,
  Eye,
  Contrast,
  X,
  Plus,
  Minus,
  RotateCcw
} from "lucide-react";
import styles from "./AccessibilityPanel.module.scss";

/**
 * Panel de Accesibilidad
 * Herramientas para personas con discapacidad visual, auditiva y motora
 */
export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100); // Porcentaje base
  const [isReading, setIsReading] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1); // Velocidad de lectura
  const panelRef = useRef(null);
  const speechSynthRef = useRef(null);

  // Cargar preferencias guardadas
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility_fontSize');
    const savedHighContrast = localStorage.getItem('accessibility_highContrast');
    const savedAutoRead = localStorage.getItem('accessibility_autoRead');
    const savedReadingSpeed = localStorage.getItem('accessibility_readingSpeed');

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    if (savedAutoRead) setAutoRead(savedAutoRead === 'true');
    if (savedReadingSpeed) setReadingSpeed(parseFloat(savedReadingSpeed));
  }, []);

  // Aplicar tamaño de fuente
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('accessibility_fontSize', fontSize.toString());
  }, [fontSize]);

  // Aplicar alto contraste
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility_highContrast', highContrast.toString());
  }, [highContrast]);

  // Guardar preferencia de lectura automática
  useEffect(() => {
    localStorage.setItem('accessibility_autoRead', autoRead.toString());
  }, [autoRead]);

  // Guardar velocidad de lectura
  useEffect(() => {
    localStorage.setItem('accessibility_readingSpeed', readingSpeed.toString());
  }, [readingSpeed]);

  // Aumentar tamaño de fuente
  const increaseFontSize = () => {
    if (fontSize < 200) {
      setFontSize(prev => Math.min(prev + 10, 200));
    }
  };

  // Disminuir tamaño de fuente
  const decreaseFontSize = () => {
    if (fontSize > 80) {
      setFontSize(prev => Math.max(prev - 10, 80));
    }
  };

  // Resetear tamaño de fuente
  const resetFontSize = () => {
    setFontSize(100);
  };

  // Leer texto con síntesis de voz
  const readText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier lectura en curso
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = readingSpeed;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tu navegador no soporta la síntesis de voz. Por favor, usa un navegador moderno como Chrome, Edge o Safari.');
    }
  };

  // Detener lectura
  const stopReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  };

  // Leer elemento al hacer hover (solo si autoRead está activado)
  useEffect(() => {
    if (!autoRead) return;

    const handleMouseOver = (e) => {
      const target = e.target;

      // Obtener texto del elemento
      let textToRead = '';

      // Priorizar atributos aria-label y title
      if (target.getAttribute('aria-label')) {
        textToRead = target.getAttribute('aria-label');
      } else if (target.getAttribute('title')) {
        textToRead = target.getAttribute('title');
      } else if (target.tagName === 'IMG') {
        textToRead = target.alt || 'Imagen sin descripción';
      } else if (target.tagName === 'A') {
        textToRead = `Enlace a ${target.textContent}`;
      } else if (target.tagName === 'BUTTON') {
        textToRead = `Botón: ${target.textContent}`;
      } else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(target.tagName)) {
        textToRead = `Título: ${target.textContent}`;
      } else if (target.textContent && target.textContent.trim().length < 150) {
        textToRead = target.textContent;
      }

      if (textToRead && textToRead.trim()) {
        readText(textToRead.trim());
      }
    };

    // Solo agregar listener a elementos interactivos y de contenido
    const interactiveElements = document.querySelectorAll(
      'a, button, input, select, textarea, h1, h2, h3, h4, h5, h6, p, img, [role="button"]'
    );

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseOver);
    });

    return () => {
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseOver);
      });
    };
  }, [autoRead, readingSpeed]);

  // Leer contenido visible en el viewport
  const readViewportContent = () => {
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Obtener todos los elementos de texto visibles
    const textElements = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, li')
    ).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.top <= viewportHeight && el.textContent.trim();
    });

    // Extraer y concatenar el texto
    const texts = textElements.map(el => {
      if (el.tagName.startsWith('H')) {
        return `Título: ${el.textContent}. `;
      }
      return `${el.textContent}. `;
    });

    const fullText = texts.join(' ');

    if (fullText.trim()) {
      readText(fullText);
    } else {
      readText('No hay contenido visible para leer');
    }
  };

  // Escuchar evento para abrir el panel desde el menú móvil
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev);
    };

    window.addEventListener('toggleAccessibilityPanel', handleToggle);
    return () => window.removeEventListener('toggleAccessibilityPanel', handleToggle);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={styles.accessibilityContainer} ref={panelRef}>
      {/* Botón flotante de accesibilidad */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.accessibilityButton}
        aria-label="Abrir panel de accesibilidad"
        title="Opciones de accesibilidad"
      >
        <Accessibility size={24} />
        {/* Badge de "Nuevo" o indicador para llamar atención */}
        {/* <span className={styles.badge}>♿</span> */}
      </button>

      {/* Tooltip flotante para móviles */}
      {!isOpen && (
        <div className={styles.tooltip}>
          <span>Accesibilidad</span>
          <div className={styles.tooltipArrow}></div>
        </div>
      )}

      {/* Panel de opciones */}
      {isOpen && (
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.panelHeader}>
            <div className={styles.headerTitle}>
              <Accessibility size={20} />
              <h3>Accesibilidad</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
              aria-label="Cerrar panel"
            >
              <X size={20} />
            </button>
          </div>

          {/* Contenido */}
          <div className={styles.panelContent}>
            {/* Tamaño de texto */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <Type size={18} />
                <span>Tamaño de Texto</span>
              </div>
              <div className={styles.fontSizeControls}>
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 80}
                  className={styles.controlButton}
                  aria-label="Disminuir tamaño de texto"
                  title="Hacer texto más pequeño"
                >
                  <Minus size={16} />
                </button>
                <span className={styles.fontSizeValue}>{fontSize}%</span>
                <button
                  onClick={increaseFontSize}
                  disabled={fontSize >= 200}
                  className={styles.controlButton}
                  aria-label="Aumentar tamaño de texto"
                  title="Hacer texto más grande"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={resetFontSize}
                  className={styles.resetButton}
                  aria-label="Resetear tamaño de texto"
                  title="Volver al tamaño normal"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Lector de pantalla */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                {isReading ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <span>Lector de Pantalla</span>
              </div>

              <div className={styles.readerControls}>
                <button
                  onClick={readViewportContent}
                  className={`${styles.primaryButton} ${isReading ? styles.reading : ''}`}
                  disabled={isReading}
                  aria-label="Leer contenido visible"
                  title="Lee el contenido que ves en pantalla"
                >
                  {isReading ? (
                    <>
                      <Volume2 size={16} />
                      <span>Leyendo...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={16} />
                      <span>Leer Pantalla</span>
                    </>
                  )}
                </button>

                {isReading && (
                  <button
                    onClick={stopReading}
                    className={styles.stopButton}
                    aria-label="Detener lectura"
                    title="Detener la lectura"
                  >
                    <VolumeX size={16} />
                    <span>Detener</span>
                  </button>
                )}
              </div>

              {/* Velocidad de lectura */}
              <div className={styles.speedControl}>
                <label htmlFor="readingSpeed">
                  Velocidad: {readingSpeed}x
                </label>
                <input
                  id="readingSpeed"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={readingSpeed}
                  onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              {/* Lectura automática */}
              <div className={styles.toggleOption}>
                <label htmlFor="autoRead">
                  <Eye size={16} />
                  <span>Leer al pasar el cursor</span>
                </label>
                <input
                  id="autoRead"
                  type="checkbox"
                  checked={autoRead}
                  onChange={(e) => setAutoRead(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>
            </div>

            {/* Alto contraste */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <Contrast size={18} />
                <span>Alto Contraste</span>
              </div>
              <div className={styles.toggleOption}>
                <label htmlFor="highContrast">
                  <span>Activar modo de alto contraste</span>
                </label>
                <input
                  id="highContrast"
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>
            </div>

            {/* Información */}
            <div className={styles.info}>
              <p>
                💡 <strong>Atajos de teclado:</strong>
              </p>
              <ul>
                <li><kbd>Tab</kbd> - Navegar entre elementos</li>
                <li><kbd>Enter</kbd> / <kbd>Espacio</kbd> - Activar elemento</li>
                <li><kbd>Esc</kbd> - Cerrar modales</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
