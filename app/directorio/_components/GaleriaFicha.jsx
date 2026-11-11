"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Galería de la ficha: al tocar una foto se amplía dentro de la página (sin
// abrir otra pestaña). El visor queda debajo del navbar, que sigue visible.
export default function GaleriaFicha({ fotos, nombre }) {
  const [abierta, setAbierta] = useState(null); // índice de la foto ampliada o null

  const cerrar = useCallback(() => setAbierta(null), []);
  const anterior = useCallback(
    () => setAbierta((i) => (i === null ? i : (i - 1 + fotos.length) % fotos.length)),
    [fotos.length]
  );
  const siguiente = useCallback(
    () => setAbierta((i) => (i === null ? i : (i + 1) % fotos.length)),
    [fotos.length]
  );

  // Teclado (Esc cierra, flechas navegan) y sin scroll de fondo mientras está abierto.
  useEffect(() => {
    if (abierta === null) return;
    const alTeclear = (e) => {
      if (e.key === "Escape") cerrar();
      else if (e.key === "ArrowLeft") anterior();
      else if (e.key === "ArrowRight") siguiente();
    };
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", alTeclear);
    return () => {
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierta, cerrar, anterior, siguiente]);

  // Deslizar con el dedo para pasar de foto.
  const [toqueX, setToqueX] = useState(null);
  const alTerminarToque = (e) => {
    if (toqueX === null) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(dx) > 50 && fotos.length > 1) (dx > 0 ? anterior : siguiente)();
    setToqueX(null);
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {fotos.map((url, i) => (
          <button
            type="button"
            key={url}
            onClick={() => setAbierta(i)}
            aria-label={`Ampliar foto ${i + 1} de ${nombre}`}
            className={`block cursor-zoom-in overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 ${
              i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${nombre} foto ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {abierta !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${abierta + 1} de ${fotos.length} de ${nombre}`}
          // top-[64px]: deja libre el navbar fijo (60 px) para que siga visible.
          className="fixed inset-x-0 bottom-0 top-[64px] z-[2000] flex items-center justify-center bg-black/90"
          onClick={cerrar}
          onTouchStart={(e) => setToqueX(e.touches[0].clientX)}
          onTouchEnd={alTerminarToque}
        >
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="absolute right-3 top-3 z-10 rounded-full bg-white p-2.5 text-gray-900 shadow-lg transition hover:scale-110 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>

          {fotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  anterior();
                }}
                aria-label="Foto anterior"
                className="absolute left-2 z-10 rounded-full bg-white/90 p-2 text-gray-900 shadow-lg transition hover:scale-110 sm:left-4"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  siguiente();
                }}
                aria-label="Foto siguiente"
                className="absolute right-2 z-10 rounded-full bg-white/90 p-2 text-gray-900 shadow-lg transition hover:scale-110 sm:right-4"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotos[abierta]}
            alt={`${nombre} foto ${abierta + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full select-none object-contain p-3 sm:p-6"
            draggable={false}
          />

          {fotos.length > 1 && (
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
              {abierta + 1} / {fotos.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
