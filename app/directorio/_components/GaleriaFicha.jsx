"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, X } from "lucide-react";

// Galería de la ficha: al tocar una foto se amplía dentro de la página (sin
// abrir otra pestaña). El visor queda debajo del navbar, que sigue visible.
export default function GaleriaFicha({ fotos, nombre, negocioId, whatsapp, slug }) {
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

  // "Pedir": abre WhatsApp del negocio con un mensaje listo que incluye el enlace de la foto elegida.
  const enlacePedido = (url) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      `Hola, quiero pedir esto de ${nombre}: ${url}\n\nLo vi en https://neurai.dev/directorio/${slug}`
    )}`;
  // Cuenta el toque como "te escribieron" en las estadísticas del dueño.
  const contarPedido = () => {
    try {
      navigator.sendBeacon(
        "/api/directorio/evento",
        new Blob([JSON.stringify({ id: negocioId, tipo: "whatsapp" })], { type: "application/json" })
      );
    } catch {
      /* las estadísticas nunca deben impedir abrir WhatsApp */
    }
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {fotos.map((url, i) => (
          <div
            key={url}
            className={`relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 ${
              i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"
            }`}
          >
            <button
              type="button"
              onClick={() => setAbierta(i)}
              aria-label={`Ampliar foto ${i + 1} de ${nombre}`}
              className="block h-full w-full cursor-zoom-in"
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
            {whatsapp && (
              <a
                href={enlacePedido(url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={contarPedido}
                className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold !text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-700 hover:shadow-xl"
              >
                <ShoppingCart className="h-4 w-4" /> Pedir
              </a>
            )}
          </div>
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

          {whatsapp && (
            <a
              href={enlacePedido(fotos[abierta])}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                contarPedido();
              }}
              className="absolute bottom-12 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-lg font-bold !text-white shadow-xl transition-all hover:scale-110 hover:bg-blue-700"
            >
              <ShoppingCart className="h-5 w-5" /> Pedir esto
            </a>
          )}

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
