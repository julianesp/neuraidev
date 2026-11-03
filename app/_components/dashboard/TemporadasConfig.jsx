"use client";

import { useEffect, useState } from "react";
import { Snowflake, PartyPopper, ExternalLink } from "lucide-react";
import {
  COPOS_MAX,
  estadoTemporadas,
  guardarPreview,
  leerPreview,
  PREVIEW_VACIO,
} from "@/lib/temporadas";

// Switches de vista previa de las animaciones de temporada. Las fechas reales
// quedan fijas en lib/temporadas.js; esto solo sirve para revisarlas antes en
// ESTE navegador (los visitantes no ven nada distinto).

function Switch({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer shrink-0">
      <span className="sr-only">{label}</span>
      <input
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-300 dark:peer-focus-visible:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  );
}

const DIAS_CARNAVAL = [
  { dia: 1, nombre: "1 ene · Inicio" },
  { dia: 2, nombre: "2 ene" },
  { dia: 3, nombre: "3 ene" },
  { dia: 4, nombre: "4 ene · Víspera" },
  { dia: 5, nombre: "5 ene · Día de Negros" },
  { dia: 6, nombre: "6 ene · Día de Blancos" },
  { dia: 7, nombre: "7 ene · Cierre" },
];

export default function TemporadasConfig() {
  const [preview, setPreview] = useState(PREVIEW_VACIO);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setPreview(leerPreview());
    setListo(true);
  }, []);

  const cambiar = (cambios) => setPreview(guardarPreview(cambios));

  const real = listo ? estadoTemporadas(PREVIEW_VACIO) : null;
  const efectivo = estadoTemporadas(preview);
  const copos = Math.round(COPOS_MAX * efectivo.nieve);
  const anio = new Date().getFullYear();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-1">
        <Snowflake className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Animaciones de temporada
        </h2>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
        Las fechas ya están programadas y se activan solas. Enciende la vista
        previa para revisarlas antes: solo la ves tú, en este navegador.
      </p>

      <div className="space-y-6">
        {/* Nieve */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-600" /> Nieve en todas las páginas
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                15 nov → 31 dic. Empieza con pocos copos y aumenta cada día
                hasta el 1° dic (máximo); el 1° de enero desaparece.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Hoy (fecha real):{" "}
                {real
                  ? real.nieve > 0
                    ? `activa, ${Math.round(real.nieve * 100)}% (${Math.round(COPOS_MAX * real.nieve)} copos)`
                    : "inactiva"
                  : "…"}
              </p>
            </div>
            <Switch
              id="preview-nieve"
              label="Vista previa de la nieve"
              checked={preview.nieve}
              onChange={(v) => cambiar({ nieve: v })}
            />
          </div>

          {preview.nieve && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label htmlFor="fecha-nieve" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Simular el día (cambia la cantidad de copos)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="fecha-nieve"
                  type="date"
                  min={`${anio}-11-15`}
                  max={`${anio}-12-31`}
                  value={preview.fechaNieve}
                  onChange={(e) => cambiar({ fechaNieve: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => cambiar({ fechaNieve: "" })}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Usar el máximo
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {copos} copos en computador · {Math.max(1, Math.round(copos / 2))} en celular
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${Math.round(efectivo.nieve * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Carnaval */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-blue-600" /> Carnaval de Negros y Blancos
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                1 → 7 de enero, solo en la página de inicio: banner con
                serpentinas, confeti y nubes de talco al tocar la pantalla (el
                5 de enero, cosmético negro).
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Hoy (fecha real):{" "}
                {real ? (real.carnaval ? `activo, día ${real.carnaval}` : "inactivo") : "…"}
              </p>
            </div>
            <Switch
              id="preview-carnaval"
              label="Vista previa del carnaval"
              checked={preview.carnaval}
              onChange={(v) => cambiar({ carnaval: v })}
            />
          </div>

          {preview.carnaval && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Simular el día
              </p>
              <div className="flex flex-wrap gap-2">
                {DIAS_CARNAVAL.map(({ dia, nombre }) => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => cambiar({ diaCarnaval: dia })}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      Number(preview.diaCarnaval) === dia
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Ver la página de inicio <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
