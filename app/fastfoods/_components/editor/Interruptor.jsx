"use client";

/**
 * Interruptor on/off visible. Reemplaza los checkbox del editor: el
 * `appearance: none` global (app/globals.css) los deja invisibles.
 */
export default function Interruptor({ activo, onCambio, children, className = "" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onCambio(!activo)}
      className={`inline-flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-gray-200 ${className}`}
    >
      <span
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          activo ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            activo ? "translate-x-5" : ""
          }`}
        />
      </span>
      {children}
    </button>
  );
}
