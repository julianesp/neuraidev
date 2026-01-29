"use client";

import { useState, useEffect } from "react";

const COLORES_PREDEFINIDOS = {
  "Negro": "#000000",
  "Blanco": "#FFFFFF",
  "Rojo": "#EF4444",
  "Azul": "#3B82F6",
  "Verde": "#10B981",
  "Amarillo": "#F59E0B",
  "Rosa": "#EC4899",
  "Morado": "#8B5CF6",
  "Gris": "#6B7280",
  "Naranja": "#F97316",
  "Café": "#92400E",
  "Dorado": "#D97706",
  "Plateado": "#D1D5DB",
  "Turquesa": "#06B6D4",
  "Beige": "#D2B48C",
};

export default function ProductColorPicker({
  coloresDisponibles = [],
  colorSeleccionado,
  onColorChange
}) {
  // Si solo hay un color disponible, seleccionarlo automáticamente
  useEffect(() => {
    if (coloresDisponibles.length === 1 && !colorSeleccionado) {
      onColorChange(coloresDisponibles[0]);
    }
  }, [coloresDisponibles, colorSeleccionado, onColorChange]);

  if (!coloresDisponibles || coloresDisponibles.length === 0) {
    return null;
  }

  const getColorHex = (nombreColor) => {
    return COLORES_PREDEFINIDOS[nombreColor] || null;
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color: {colorSeleccionado ? (
            <span className="text-blue-600 dark:text-blue-400">{colorSeleccionado}</span>
          ) : (
            <span className="text-red-600 dark:text-red-400">Selecciona un color *</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {coloresDisponibles.map((color, index) => {
            const hex = getColorHex(color);
            const isSelected = colorSeleccionado === color;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onColorChange(color)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                  ${isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md scale-105"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow"
                  }
                `}
                aria-label={`Seleccionar color ${color}`}
              >
                {hex && (
                  <div
                    className={`w-6 h-6 rounded-full border-2 ${
                      hex === "#FFFFFF"
                        ? "border-gray-400"
                        : "border-gray-300 dark:border-gray-500"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                )}
                <span className={`text-sm font-medium ${
                  isSelected
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}>
                  {color}
                </span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {!colorSeleccionado && coloresDisponibles.length > 1 && (
        <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Debes seleccionar un color antes de agregar al carrito
        </p>
      )}
    </div>
  );
}
