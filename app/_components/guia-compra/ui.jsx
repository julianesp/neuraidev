"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CheckCircle2 } from "lucide-react";
import s from "./GuiaCompra.module.css";

const QUERY = "(prefers-reduced-motion: reduce)";

function suscribir(onChange) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/** Celular decorativo: la información real va en la lista de pasos (el celular es aria-hidden). */
export function Phone({ children }) {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto h-[540px] w-[270px] select-none rounded-[2.4rem] bg-slate-900 p-2.5 shadow-2xl shadow-black/30 ring-1 ring-white/10"
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.9rem] bg-slate-50 text-slate-800">
        <div className="absolute left-1/2 top-1.5 z-30 h-4 w-16 -translate-x-1/2 rounded-full bg-slate-900" />
        {children}
      </div>
    </div>
  );
}

/** Pantalla apilada: entra/sale con fundido y leve desplazamiento. */
export function Layer({ active, children }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col transition-all duration-500 motion-reduce:transition-none ${
        active
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-5 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

export function AppBar({ title, right, className = "bg-blue-600" }) {
  return (
    <div
      className={`flex items-center justify-between px-4 pb-3 pt-8 text-[13px] font-semibold text-white ${className}`}
    >
      <span>{title}</span>
      {right}
    </div>
  );
}

/** Anillo de "toque" que se dibuja centrado sobre el elemento `relative` que lo contiene. */
export function Tap({ show, delay = 500 }) {
  if (!show) return null;
  return <span className={s.tap} style={{ animationDelay: `${delay}ms` }} />;
}

export function Pop({ children, delay = 0, className = "" }) {
  return (
    <div
      className={`${s.pop} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Btn({ children, tap = false, tapDelay, outline = false, className = "" }) {
  return (
    <div
      className={`relative flex h-9 items-center justify-center gap-1.5 rounded-lg text-[12px] font-semibold ${
        outline
          ? "border border-slate-300 bg-white text-slate-700"
          : "bg-blue-600 text-white"
      } ${className}`}
    >
      {children}
      <Tap show={tap} delay={tapDelay} />
    </div>
  );
}

export function Field({ label, active = false, children }) {
  return (
    <div>
      <div className="mb-0.5 text-[10px] font-medium text-slate-500">
        {label}
      </div>
      <div
        className={`flex h-8 items-center rounded-md border bg-white px-2 text-[12px] text-slate-800 transition-colors ${
          active ? "border-blue-600 ring-2 ring-blue-600/25" : "border-slate-300"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Escribe el texto letra por letra. Se monta solo cuando le toca su paso (así
 * al reiniciar la demo vuelve a escribirse). Con `instant` (paso ya superado) o
 * con movimiento reducido aparece completo.
 */
export function Typed({ text, delayMs = 0, instant = false }) {
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(instant || reduced ? text.length : 0);

  useEffect(() => {
    if (n >= text.length) return;
    const id = window.setTimeout(() => setN(n + 1), n === 0 ? 350 + delayMs : 55);
    return () => window.clearTimeout(id);
  }, [n, text, delayMs]);

  return (
    <span>
      {text.slice(0, n)}
      {n < text.length && <span className={s.caret} />}
    </span>
  );
}

export function Toast({ show, delay = 0, children }) {
  if (!show) return null;
  return (
    <div
      className={`${s.rise} absolute inset-x-3 bottom-2 z-20 flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-[12px] font-medium text-slate-50 shadow-lg`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 fill-none text-blue-400" />
      {children}
    </div>
  );
}

export function Dots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={s.dot} />
      <span className={s.dot} />
      <span className={s.dot} />
    </span>
  );
}

export const anim = s;
