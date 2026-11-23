"use client";

import { useState, useEffect, useRef } from "react";

// 8 botones "Sí" + 1 botón "No" (el último, abajo a la derecha de la cuadrícula 3×3)
const BOTONES_SI = Array.from({ length: 8 }, (_, i) => i);

// Chispas de cada fuego artificial (ángulos alrededor del centro)
const CHISPAS = Array.from({ length: 10 }, (_, i) => (360 / 10) * i);

// Posiciones de los fuegos alrededor de cada botón (en % del botón)
const FUEGOS = [
  { top: "-18%", left: "-10%", delay: 0 },
  { top: "-22%", left: "105%", delay: 0.7 },
  { top: "110%", left: "-8%", delay: 1.3 },
  { top: "112%", left: "100%", delay: 0.4 },
];

function FuegoArtificial({ top, left, delay }) {
  return (
    <span className="fuego" style={{ top, left, animationDelay: `${delay}s` }} aria-hidden="true">
      {CHISPAS.map((ang, i) => (
        <span
          key={i}
          className="chispa"
          style={{
            "--ang": `${ang}deg`,
            animationDelay: `${delay}s`,
            background: i % 3 === 0 ? "#ffffff" : i % 2 === 0 ? "#60a5fa" : "#2563eb",
          }}
        />
      ))}
    </span>
  );
}

export default function InvitacionPage() {
  // paso: "pregunta" | "guino" | "whatsapp" | "enviado" | "triste"
  const [paso, setPaso] = useState("pregunta");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
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
      await fetch("/api/admin/invitacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: numero }),
      });
    } catch {
      // aunque falle el aviso, se muestra la confirmación y el número queda en pantalla
    } finally {
      setEnviando(false);
      setPaso("enviado");
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
            {FUEGOS.map((f, k) => (
              <FuegoArtificial key={k} {...f} delay={f.delay + i * 0.23} />
            ))}
            <button
              type="button"
              onClick={() => setPaso("guino")}
              className="relative z-10 w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-lg py-3 shadow-lg shadow-blue-600/30 transition"
            >
              Sí
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPaso("triste")}
          aria-label="No"
          className="w-full rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 active:scale-95 text-2xl py-2.5 transition"
        >
          🙁
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
        .fuego {
          position: absolute;
          width: 0;
          height: 0;
          pointer-events: none;
        }
        .chispa {
          position: absolute;
          left: -2px;
          top: -2px;
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          opacity: 0;
          animation: estallido 2.2s ease-out infinite;
        }
        @keyframes estallido {
          0% {
            transform: rotate(var(--ang)) translateX(0) scale(1);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          45% {
            transform: rotate(var(--ang)) translateX(16px) scale(0.9);
            opacity: 1;
          }
          70% {
            transform: rotate(var(--ang)) translateX(20px) translateY(4px) scale(0.4);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
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
          .chispa {
            animation: none;
            opacity: 0.6;
            transform: rotate(var(--ang)) translateX(14px);
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
