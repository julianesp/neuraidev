"use client";

import { useState } from "react";
import { X } from "lucide-react";

function coloresDe(p) {
  let m = p.metadata;
  if (typeof m === "string") {
    try {
      m = JSON.parse(m);
    } catch {
      m = {};
    }
  }
  return Array.isArray(m?.colores_disponibles) ? m.colores_disponibles : [];
}

/**
 * Une varios productos iguales de distinto color en uno solo: el cliente ve
 * una sola tarjeta y elige el color (con su foto y sus unidades). Los demás
 * quedan ocultos, no se borran.
 */
export default function AgruparPorColor({ productos, onClose, onListo }) {
  const [principalId, setPrincipalId] = useState(productos[0]?.id);
  const [colores, setColores] = useState(() =>
    Object.fromEntries(productos.map((p) => [p.id, coloresDe(p)[0] || ""]))
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const agrupar = async () => {
    setError("");
    const falta = productos.find((p) => coloresDe(p).length <= 1 && !colores[p.id]?.trim());
    if (falta) return setError(`Escribe el color de «${falta.nombre}».`);
    setEnviando(true);
    try {
      const res = await fetch("/api/productos/agrupar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principalId,
          items: productos.map((p) => ({ id: p.id, color: colores[p.id] })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudieron agrupar");
      onListo(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agrupar por color</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Quedará <strong>un solo producto</strong> con todos los colores, sus fotos y sus unidades.
            Escribe el color de cada uno y elige cuál queda como principal (su nombre, precio y descripción).
            Los demás se ocultan; no se borran.
          </p>

          {productos.map((p) => {
            const yaColores = coloresDe(p);
            const principal = principalId === p.id;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 ${
                  principal ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40" : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {p.imagen_principal ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imagen_principal} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ${Number(p.precio || 0).toLocaleString("es-CO")} · {p.stock} und.
                  </p>
                  {yaColores.length > 1 ? (
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Ya tiene: {yaColores.join(", ")}</p>
                  ) : (
                    <input
                      value={colores[p.id] || ""}
                      onChange={(e) => setColores((c) => ({ ...c, [p.id]: e.target.value }))}
                      placeholder="Color (ej.: Negro)"
                      maxLength={40}
                      className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  )}
                </div>
                <label className="flex flex-col items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="principal"
                    checked={principal}
                    onChange={() => setPrincipalId(p.id)}
                    className="accent-blue-600 w-4 h-4"
                  />
                  Principal
                </label>
              </div>
            );
          })}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={agrupar}
            disabled={enviando}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
          >
            {enviando ? "Agrupando…" : `Agrupar ${productos.length} productos`}
          </button>
        </div>
      </div>
    </div>
  );
}
