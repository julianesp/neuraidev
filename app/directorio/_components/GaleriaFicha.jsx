"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, X } from "lucide-react";
import { pesos } from "@/lib/directorio/planes";

// Galería de la ficha: las fotos del negocio y los productos del catálogo viven en la MISMA galería.
// Una foto que es un producto muestra su nombre, precio y el botón "Lo quiero" (abre WhatsApp con
// el pedido ya escrito). Al tocar la imagen se amplía dentro de la página, bajo el navbar.
//
// items: [{ url, producto?: { id, nombre, precio, disponible } }]
// pedirFotosSueltas: si no hay catálogo, las fotos sueltas llevan un "Lo quiero" genérico.
export default function GaleriaFicha({ items, nombre, negocioId, whatsapp, slug, pedirFotosSueltas = false }) {
  const [abierta, setAbierta] = useState(null); // índice del item ampliado o null
  const conImagen = items.map((it, i) => ({ ...it, i })).filter((it) => it.url);

  const cerrar = useCallback(() => setAbierta(null), []);
  const mover = useCallback(
    (paso) =>
      setAbierta((actual) => {
        if (actual === null) return actual;
        const pos = conImagen.findIndex((it) => it.i === actual);
        return conImagen[(pos + paso + conImagen.length) % conImagen.length].i;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  useEffect(() => {
    if (abierta === null) return;
    const alTeclear = (e) => {
      if (e.key === "Escape") cerrar();
      else if (e.key === "ArrowLeft") mover(-1);
      else if (e.key === "ArrowRight") mover(1);
    };
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", alTeclear);
    return () => {
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierta, cerrar, mover]);

  const [toqueX, setToqueX] = useState(null);
  const alTerminarToque = (e) => {
    if (toqueX === null) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(dx) > 50 && conImagen.length > 1) mover(dx > 0 ? -1 : 1);
    setToqueX(null);
  };

  // Mensaje de WhatsApp del pedido: producto con nombre y precio, o foto suelta.
  const enlacePedido = (it) => {
    const p = it.producto;
    const lineas = p
      ? [
          `Hola, quiero pedir: ${p.nombre}${p.precio ? ` (${pesos(p.precio)})` : ""} de ${nombre}.`,
          it.url || "",
          `Lo vi en https://neurai.dev/directorio/${slug}`,
        ]
      : [`Hola, quiero pedir esto de ${nombre}:`, it.url, `Lo vi en https://neurai.dev/directorio/${slug}`];
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lineas.filter(Boolean).join("\n\n"))}`;
  };
  // Cada toque en "Lo quiero" cuenta como "te escribieron" en las estadísticas del dueño.
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

  const puedePedir = (it) =>
    !!whatsapp && (it.producto ? it.producto.disponible : pedirFotosSueltas);

  const botonPedir = "inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-bold !text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-700 hover:shadow-xl";

  const actual = abierta !== null ? items[abierta] : null;

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((it, i) => {
          const p = it.producto;
          return (
            <div
              key={`${it.url || p?.id}-${i}`}
              className={`relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 ${
                i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"
              }`}
            >
              {it.url ? (
                <button
                  type="button"
                  onClick={() => setAbierta(i)}
                  aria-label={`Ampliar ${p ? p.nombre : `foto ${i + 1} de ${nombre}`}`}
                  className="block h-full w-full cursor-zoom-in"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.url}
                    alt={p ? p.nombre : `${nombre} foto ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    decoding="async"
                    className={`h-full w-full object-cover ${p && !p.disponible ? "opacity-50" : ""}`}
                  />
                </button>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-blue-600/30">
                  {p?.nombre?.charAt(0).toUpperCase()}
                </div>
              )}

              {p && !p.disponible && (
                <span className="absolute left-2 top-2 rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-bold text-white">
                  Agotado
                </span>
              )}

              {/* Franja inferior: nombre y precio a la izquierda, "Lo quiero" a la derecha */}
              {(p || puedePedir(it)) && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-2 pt-8">
                  <div className="min-w-0 text-white">
                    {p && <p className="line-clamp-2 text-sm font-semibold leading-tight">{p.nombre}</p>}
                    {p && <p className="text-sm font-bold">{p.precio ? pesos(p.precio) : "Consultar precio"}</p>}
                  </div>
                  {puedePedir(it) && (
                    <a
                      href={enlacePedido(it)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={contarPedido}
                      className={`${botonPedir} pointer-events-auto`}
                    >
                      <ShoppingCart className="h-4 w-4" /> Lo quiero
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {actual && actual.url && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={actual.producto ? actual.producto.nombre : `Foto de ${nombre}`}
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

          {conImagen.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  mover(-1);
                }}
                aria-label="Anterior"
                className="absolute left-2 z-10 rounded-full bg-white/90 p-2 text-gray-900 shadow-lg transition hover:scale-110 sm:left-4"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  mover(1);
                }}
                aria-label="Siguiente"
                className="absolute right-2 z-10 rounded-full bg-white/90 p-2 text-gray-900 shadow-lg transition hover:scale-110 sm:right-4"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={actual.url}
            alt={actual.producto ? actual.producto.nombre : `${nombre} foto`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full select-none object-contain p-3 pb-28 sm:p-6 sm:pb-28"
            draggable={false}
          />

          {(actual.producto || puedePedir(actual)) && (
            <div
              className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10 text-center text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {actual.producto && (
                <p className="text-base font-semibold">
                  {actual.producto.nombre} ·{" "}
                  <span className="font-bold">{actual.producto.precio ? pesos(actual.producto.precio) : "Consultar precio"}</span>
                </p>
              )}
              {puedePedir(actual) && (
                <a
                  href={enlacePedido(actual)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={contarPedido}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-lg font-bold !text-white shadow-xl transition-all hover:scale-110 hover:bg-blue-700"
                >
                  <ShoppingCart className="h-5 w-5" /> Lo quiero
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
