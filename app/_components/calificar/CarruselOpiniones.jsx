"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

// Tarjetas visibles a la vez según el ancho: 1 en celular, 2 en tablet, 3 en
// computador.
function usePorVista() {
  const [porVista, setPorVista] = useState(1);
  useEffect(() => {
    const md = window.matchMedia("(min-width: 768px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const calcular = () => setPorVista(lg.matches ? 3 : md.matches ? 2 : 1);
    calcular();
    md.addEventListener("change", calcular);
    lg.addEventListener("change", calcular);
    return () => {
      md.removeEventListener("change", calcular);
      lg.removeEventListener("change", calcular);
    };
  }, []);
  return porVista;
}

/**
 * Carrusel de opiniones de clientes: avanza solo cada `intervalo` ms, con
 * flechas, botón de pausa y deslizamiento con el dedo. Así la sección ocupa
 * siempre lo mismo aunque haya 100 opiniones. Se detiene con el mouse encima,
 * y con "reducir movimiento" arranca en pausa.
 */
export default function CarruselOpiniones({
  items,
  render,
  claveDe = (item) => item.id,
  intervalo = 3000,
  etiqueta = "opiniones",
}) {
  const porVista = usePorVista();
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [mouseEncima, setMouseEncima] = useState(false);
  const inicioToque = useRef(null);

  const total = items?.length || 0;
  const ultimo = Math.max(total - porVista, 0);
  const hayMovimiento = ultimo > 0;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPausado(true);
  }, []);

  // Si cambia el ancho (más tarjetas por vista), no quedar pasado del final
  useEffect(() => {
    setIndice((i) => Math.min(i, ultimo));
  }, [ultimo]);

  const siguiente = useCallback(
    () => setIndice((i) => (i >= ultimo ? 0 : i + 1)),
    [ultimo],
  );
  const anterior = useCallback(
    () => setIndice((i) => (i <= 0 ? ultimo : i - 1)),
    [ultimo],
  );

  useEffect(() => {
    if (!hayMovimiento || pausado || mouseEncima) return;
    const id = setInterval(siguiente, intervalo);
    return () => clearInterval(id);
  }, [hayMovimiento, pausado, mouseEncima, siguiente, intervalo, indice]);

  if (!total) return null;

  const alSoltar = (e) => {
    if (inicioToque.current === null) return;
    const dx = e.changedTouches[0].clientX - inicioToque.current;
    inicioToque.current = null;
    if (Math.abs(dx) < 40) return;
    dx < 0 ? siguiente() : anterior();
  };

  const botonFlecha =
    "shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors";

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label={`Carrusel de ${etiqueta}`}
      onMouseEnter={() => setMouseEncima(true)}
      onMouseLeave={() => setMouseEncima(false)}
    >
      <div className="overflow-hidden" onTouchStart={(e) => (inicioToque.current = e.touches[0].clientX)} onTouchEnd={alSoltar}>
        <ul
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${(indice * 100) / porVista}%)` }}
        >
          {items.map((item, i) => (
            <li
              key={claveDe(item)}
              className="shrink-0 px-2 sm:px-3 flex"
              style={{ width: `${100 / porVista}%` }}
              aria-hidden={i < indice || i >= indice + porVista || undefined}
            >
              <div className="w-full flex">{render(item)}</div>
            </li>
          ))}
        </ul>
      </div>

      {hayMovimiento && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button type="button" onClick={anterior} className={botonFlecha} aria-label={`Ver ${etiqueta} anteriores`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setPausado((v) => !v)}
            aria-pressed={pausado}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 h-10 rounded-full shadow-md transition-colors"
          >
            {pausado ? (
              <>
                <Play className="w-4 h-4" /> Reanudar
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" /> Pausar
              </>
            )}
          </button>
          <button type="button" onClick={siguiente} className={botonFlecha} aria-label={`Ver más ${etiqueta}`}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      {hayMovimiento && (
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
          {indice + 1}
          {porVista > 1 ? `–${Math.min(indice + porVista, total)}` : ""} de {total}
        </p>
      )}
    </div>
  );
}
