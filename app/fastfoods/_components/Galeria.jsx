"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Galería de fotos de un plato (hasta 4). Se desliza con el dedo
 * (scroll-snap); en pantallas con mouse hay flechas, y siempre puntos para
 * saltar a cada foto. Con una sola foto es una imagen normal.
 * `className` va en el contenedor: debe darle posición (relative o absolute)
 * y alto o proporción.
 */
export default function Galeria({ fotos, alt, className = "" }) {
  const ref = useRef(null);
  const [actual, setActual] = useState(0);
  const lista = (fotos || []).filter((f) => f?.url);

  if (lista.length === 0) return null;
  if (lista.length === 1) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lista[0].url} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      </div>
    );
  }

  const ir = (i) => {
    const el = ref.current;
    if (!el) return;
    const destino = Math.max(0, Math.min(lista.length - 1, i));
    el.scrollTo({ left: destino * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className={`group ${className}`}>
      <div
        ref={ref}
        onScroll={(e) => setActual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {lista.map((f, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={f.url}
            src={f.url}
            alt={i === 0 ? alt : `${alt} (foto ${i + 1})`}
            loading={i === 0 ? "eager" : "lazy"}
            className="w-full h-full flex-shrink-0 snap-center object-cover"
          />
        ))}
      </div>

      {actual > 0 && (
        <button
          type="button"
          onClick={() => ir(actual - 1)}
          aria-label="Foto anterior"
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {actual < lista.length - 1 && (
        <button
          type="button"
          onClick={() => ir(actual + 1)}
          aria-label="Foto siguiente"
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
        {lista.map((f, i) => (
          <button
            key={f.url}
            type="button"
            onClick={() => ir(i)}
            aria-label={`Ver foto ${i + 1} de ${lista.length}`}
            aria-current={i === actual}
            className={`h-2 rounded-full transition-all ${i === actual ? "w-5 bg-white" : "w-2 bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
