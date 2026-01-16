"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

const COLORES_PREDEFINIDOS = [
  { nombre: "Negro", hex: "#000000" },
  { nombre: "Blanco", hex: "#FFFFFF" },
  { nombre: "Rojo", hex: "#EF4444" },
  { nombre: "Azul", hex: "#3B82F6" },
  { nombre: "Verde", hex: "#10B981" },
  { nombre: "Amarillo", hex: "#F59E0B" },
  { nombre: "Rosa", hex: "#EC4899" },
  { nombre: "Morado", hex: "#8B5CF6" },
  { nombre: "Gris", hex: "#6B7280" },
  { nombre: "Naranja", hex: "#F97316" },
  { nombre: "Café", hex: "#92400E" },
  { nombre: "Dorado", hex: "#D97706" },
  { nombre: "Plateado", hex: "#D1D5DB" },
  { nombre: "Turquesa", hex: "#06B6D4" },
  { nombre: "Beige", hex: "#D2B48C" },
];

export default function ColorSelector({ value = [], onChange, label = "Colores Disponibles" }) {
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [colorPersonalizado, setColorPersonalizado] = useState("");

  const handleAgregarColor = (color) => {
    if (!value.includes(color)) {
      onChange([...value, color]);
    }
  };

  const handleEliminarColor = (colorAEliminar) => {
    onChange(value.filter((c) => c !== colorAEliminar));
  };

  const handleAgregarColorPersonalizado = () => {
    const colorTrimmed = colorPersonalizado.trim();
    if (colorTrimmed && !value.includes(colorTrimmed)) {
      onChange([...value, colorTrimmed]);
      setColorPersonalizado("");
    }
  };

  const getColorHex = (nombreColor) => {
    const colorPredefinido = COLORES_PREDEFINIDOS.find(
      (c) => c.nombre.toLowerCase() === nombreColor.toLowerCase()
    );
    return colorPredefinido?.hex;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setMostrarSelector(!mostrarSelector)}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
        >
          <Plus size={16} />
          Agregar color
        </button>
      </div>

      {/* Colores seleccionados */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((color, index) => {
            const hex = getColorHex(color);
            return (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg group hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {hex && (
                  <div
                    className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500"
                    style={{ backgroundColor: hex }}
                    title={color}
                  />
                )}
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {color}
                </span>
                <button
                  type="button"
                  onClick={() => handleEliminarColor(color)}
                  className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Eliminar color ${color}`}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Selector de colores */}
      {mostrarSelector && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
          {/* Colores predefinidos */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Colores predefinidos
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {COLORES_PREDEFINIDOS.map((color) => {
                const yaSeleccionado = value.includes(color.nombre);
                return (
                  <button
                    key={color.nombre}
                    type="button"
                    onClick={() => handleAgregarColor(color.nombre)}
                    disabled={yaSeleccionado}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      yaSeleccionado
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 cursor-not-allowed"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-500 flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="truncate">{color.nombre}</span>
                    {yaSeleccionado && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color personalizado */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color personalizado
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: Azul marino, Verde limón..."
                value={colorPersonalizado}
                onChange={(e) => setColorPersonalizado(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAgregarColorPersonalizado();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              <button
                type="button"
                onClick={handleAgregarColorPersonalizado}
                disabled={!colorPersonalizado.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Agregar
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMostrarSelector(false)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Mensaje si no hay colores */}
      {value.length === 0 && !mostrarSelector && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No hay colores configurados. Haz clic en &quot;Agregar color&quot; para comenzar.
        </p>
      )}
    </div>
  );
}
