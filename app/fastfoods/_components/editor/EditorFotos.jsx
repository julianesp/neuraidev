"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { subirFoto } from "./subirFoto";

export const MAX_FOTOS = 4;

/**
 * Galería editable de un plato (hasta 4 fotos). Controlado: recibe `fotos`
 * ([{ url, path }]) y avisa con `onCambio(lista)`. Las fotos nuevas se suben a
 * R2 al elegirlas; quien lo usa decide cuándo guardar (al momento o al enviar
 * un formulario). La primera es la portada.
 */
export default function EditorFotos({ negocioId, fotos, onCambio, deshabilitado = false }) {
  const [subiendo, setSubiendo] = useState(0);
  const input = useRef(null);
  const espacio = MAX_FOTOS - fotos.length;

  const agregar = async (archivos) => {
    const elegidos = Array.from(archivos || []).slice(0, espacio);
    if (archivos?.length > espacio) {
      window.alert(`Máximo ${MAX_FOTOS} fotos por plato: se agregan solo ${espacio}.`);
    }
    if (elegidos.length === 0) return;
    setSubiendo(elegidos.length);
    const nuevas = [];
    try {
      for (const file of elegidos) {
        nuevas.push(await subirFoto(file, negocioId));
        setSubiendo((n) => n - 1);
      }
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSubiendo(0);
      if (nuevas.length) onCambio([...fotos, ...nuevas]);
    }
  };

  const quitar = (i) => onCambio(fotos.filter((_, j) => j !== i));
  const hacerPortada = (i) => onCambio([fotos[i], ...fotos.filter((_, j) => j !== i)]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {fotos.map((f, i) => (
          <div key={f.path || f.url} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt="" className="w-full h-full object-cover" />
            {i === 0 ? (
              <span className="absolute bottom-0 inset-x-0 bg-blue-600 text-white text-[10px] font-bold text-center py-0.5">
                Portada
              </span>
            ) : (
              <button
                type="button"
                onClick={() => hacerPortada(i)}
                disabled={deshabilitado}
                className="absolute bottom-0 inset-x-0 bg-black/55 hover:bg-black/70 text-white text-[10px] font-semibold py-0.5 flex items-center justify-center gap-0.5"
                title="Usar como portada"
              >
                <Star className="w-3 h-3" /> Portada
              </button>
            )}
            <button
              type="button"
              onClick={() => quitar(i)}
              disabled={deshabilitado}
              aria-label={`Quitar foto ${i + 1}`}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {Array.from({ length: subiendo }, (_, i) => (
          <div key={`s${i}`} className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ))}
        {espacio - subiendo > 0 && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={deshabilitado || subiendo > 0}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-0.5 text-[11px] hover:border-blue-500 hover:text-blue-600"
          >
            <ImagePlus className="w-5 h-5 fill-none" />
            {fotos.length === 0 ? "Agregar" : `${fotos.length}/${MAX_FOTOS}`}
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          agregar(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
