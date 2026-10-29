"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

/**
 * Fila que se desplaza sola en el eje X (clientes y opiniones de la vitrina).
 * Se detiene con el mouse encima; en celular hay un botón de pausa. Con menos
 * de `minimoParaMover` elementos se muestran quietos y centrados (repetir a
 * la misma persona parece relleno). Si hay pocos se repiten para llenar la
 * fila, y la lista va dos veces
 * para que la vuelta sea continua (keyframes `cinta` en globals.css).
 */
export default function CintaMovil({
  items,
  render,
  claveDe = (item) => item.id,
  minimo = 8, // elementos mínimos por vuelta para que la fila no quede corta
  segundosPorItem = 6,
  etiqueta,
  minimoParaMover = 3,
}) {
  const [pausada, setPausada] = useState(false);
  const [mouseEncima, setMouseEncima] = useState(false);

  if (!items?.length) return null;

  if (items.length < minimoParaMover) {
    return (
      <ul className="flex flex-wrap justify-center gap-6">
        {items.map((item) => (
          <li key={claveDe(item)} className="flex">
            {render(item)}
          </li>
        ))}
      </ul>
    );
  }

  const repeticiones = Math.max(1, Math.ceil(minimo / items.length));
  const vuelta = Array.from({ length: repeticiones }, () => items).flat();
  const duracion = Math.max(vuelta.length * segundosPorItem, 20);

  return (
    <div>
      <div className="flex justify-end mb-2 [@media(hover:hover)]:hidden">
        <button
          type="button"
          onClick={() => setPausada((v) => !v)}
          aria-pressed={pausada}
          aria-label={pausada ? `Seguir ${etiqueta || ""}` : `Pausar ${etiqueta || ""}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 active:bg-blue-700 px-3 py-1.5 rounded-full"
        >
          {pausada ? (
            <>
              <Play className="w-3.5 h-3.5" /> Seguir
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5" /> Pausa
            </>
          )}
        </button>
      </div>
      <div
        className="overflow-hidden motion-reduce:overflow-x-auto py-2 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
        onPointerEnter={(e) => e.pointerType === "mouse" && setMouseEncima(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setMouseEncima(false)}
      >
        <ul
          className="flex w-max items-stretch animate-[cinta_var(--duracion)_linear_infinite] motion-reduce:animate-none"
          style={{
            "--duracion": `${duracion}s`,
            animationPlayState: pausada || mouseEncima ? "paused" : "running",
          }}
        >
          {[...vuelta, ...vuelta].map((item, i) => (
            <li
              key={`${claveDe(item)}-${i}`}
              className="shrink-0 px-3 flex"
              // Solo la primera copia la leen los lectores de pantalla
              aria-hidden={i >= items.length || undefined}
            >
              {render(item)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
