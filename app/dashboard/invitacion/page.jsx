"use client";

import { useState, useEffect, useRef } from "react";

// 8 botones "Sí" + 1 botón "No" (el último, abajo a la derecha de la cuadrícula 3×3)
const BOTONES_SI = Array.from({ length: 8 }, (_, i) => i);

// Cada botón zumba con su propio ritmo y retraso, para que no vibren todos a la vez
const ZUMBIDOS = [
  { delay: 0, dur: 3.1 },
  { delay: 1.7, dur: 2.6 },
  { delay: 0.6, dur: 3.8 },
  { delay: 2.9, dur: 2.9 },
  { delay: 1.1, dur: 3.4 },
  { delay: 3.6, dur: 2.4 },
  { delay: 2.2, dur: 4.1 },
  { delay: 0.3, dur: 3.0 },
];

export default function InvitacionPage() {
  // paso: "pregunta" | "guino" | "whatsapp" | "enviado" | "triste"
  const [paso, setPaso] = useState("pregunta");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef(null);

  // Tras el guiño, pasa a pedir el WhatsApp
  useEffect(() => {
    if (paso !== "guino") return;
    const t = setTimeout(() => setPaso("whatsapp"), 1600);
    return () => clearTimeout(t);
  }, [paso]);

  useEffect(() => {
    if (paso === "whatsapp") setTimeout(() => inputRef.current?.focus(), 50);
  }, [paso]);

  const enviar = async (e) => {
    e.preventDefault();
    const numero = whatsapp.replace(/\D/g, "");
    if (numero.length < 10) {
      setError("Escribe un número de WhatsApp válido (10 dígitos).");
      return;
    }
    setError("");
    setEnviando(true);
    try {
      const res = await fetch("/api/admin/invitacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: numero }),
      });
      if (!res.ok) throw new Error();
      setWhatsapp(numero);
      setPaso("enviado");
    } catch {
      setError("No se pudo guardar. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setPaso("pregunta");
    setWhatsapp("");
    setError("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white max-w-2xl leading-tight">
        Quería saber si le gustaría aceptarme una invitación
      </h1>

      <div className="mt-12 grid grid-cols-3 gap-6 sm:gap-10 w-full max-w-md">
        {BOTONES_SI.map((i) => (
          <div key={i} className="relative">
            <button
              type="button"
              onClick={() => setPaso("guino")}
              style={{
                animationDelay: `${ZUMBIDOS[i].delay}s`,
                animationDuration: `${ZUMBIDOS[i].dur}s`,
              }}
              className="zumbido relative z-10 w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-lg py-3 shadow-lg shadow-blue-600/30 transition"
            >
              Sí
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPaso("triste")}
          className="w-full rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 active:scale-95 text-gray-800 dark:text-gray-100 font-bold text-lg py-3 transition"
        >
          No
        </button>
      </div>

      {/* Capas a pantalla completa */}
      {paso !== "pregunta" && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm px-4"
          onClick={paso === "triste" ? reiniciar : undefined}
        >
          {paso === "guino" && <div className="carita">😉</div>}

          {paso === "triste" && (
            <div className="text-center">
              <div className="carita">🙁</div>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Toca para volver</p>
            </div>
          )}

          {paso === "whatsapp" && (
            <form
              onSubmit={enviar}
              className="aparecer w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl p-6 text-center"
            >
              <div className="text-5xl">😉</div>
              <label htmlFor="wa" className="mt-3 block text-lg font-semibold text-gray-900 dark:text-white">
                Escribe tu WhatsApp
              </label>
              <input
                id="wa"
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9 ]*"
                autoComplete="tel"
                maxLength={15}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d ]/g, ""))}
                placeholder="300 123 4567"
                className="mt-4 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-2xl tracking-widest text-gray-900 dark:text-white py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={enviando}
                className="mt-5 w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 transition"
              >
                {enviando ? "Enviando…" : "Enviar"}
              </button>
            </form>
          )}

          {paso === "enviado" && (
            <div className="aparecer text-center">
              <div className="carita">😉</div>
              <p className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">¡Gracias! Te escribo pronto</p>
              <p className="mt-2 text-2xl tracking-widest text-blue-600 font-bold">{whatsapp}</p>
              <button
                type="button"
                onClick={reiniciar}
                className="mt-6 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Volver
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .zumbido {
          animation-name: zumbido;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        /* vibra rápido al inicio del ciclo y luego descansa */
        @keyframes zumbido {
          0%, 22%, 100% {
            transform: translate(0, 0) rotate(0);
          }
          2% { transform: translate(-2px, 1px) rotate(-3deg); }
          4% { transform: translate(2px, -1px) rotate(3deg); }
          6% { transform: translate(-2px, -1px) rotate(-3deg); }
          8% { transform: translate(2px, 1px) rotate(3deg); }
          10% { transform: translate(-2px, 1px) rotate(-2deg); }
          12% { transform: translate(2px, -1px) rotate(2deg); }
          14% { transform: translate(-1px, 0) rotate(-1deg); }
          16% { transform: translate(1px, 0) rotate(1deg); }
          18% { transform: translate(-1px, 0) rotate(0); }
        }
        .carita {
          font-size: clamp(6rem, 28vw, 12rem);
          line-height: 1;
          animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .aparecer {
          animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes pop {
          from {
            transform: scale(0.4);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .zumbido {
            animation: none;
          }
          .carita,
          .aparecer {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
