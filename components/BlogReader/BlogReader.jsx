"use client";

import { useState, useEffect, useRef } from "react";

export default function BlogReader({ title, excerpt, contentSelector = "[itemprop='articleBody']" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const getArticleText = () => {
    const bodyEl = document.querySelector(contentSelector);
    const bodyText = bodyEl ? bodyEl.innerText || bodyEl.textContent : "";
    const parts = [title, excerpt, bodyText].filter(Boolean);
    return parts.join(". ");
  };

  const getSpanishVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === "es-CO") ||
      voices.find((v) => v.lang.startsWith("es-")) ||
      voices.find((v) => v.lang.startsWith("es")) ||
      null
    );
  };

  const speak = () => {
    window.speechSynthesis.cancel();
    const text = getArticleText();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-CO";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const voice = getSpanishVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!supported) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      margin: "1rem 0",
      padding: "0.75rem 1rem",
      background: "var(--tarjeta, #fff)",
      border: "2px solid #2563eb",
      borderRadius: "8px",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}>
      <span style={{ fontSize: "1.3rem" }}>🔊</span>
      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--tinta-2, #333)", flex: 1 }}>
        {isPlaying && !isPaused ? "Leyendo artículo..." : isPaused ? "En pausa" : "Escuchar este artículo"}
      </span>

      {!isPlaying ? (
        <button
          onClick={speak}
          title="Leer en voz alta"
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "0.4rem 1rem",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            fontFamily: "Georgia, serif",
          }}
        >
          ▶ Reproducir
        </button>
      ) : (
        <>
          {isPaused ? (
            <button
              onClick={resume}
              title="Continuar"
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "0.4rem 0.9rem",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              ▶ Continuar
            </button>
          ) : (
            <button
              onClick={pause}
              title="Pausar"
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "0.4rem 0.9rem",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              ⏸ Pausar
            </button>
          )}
          <button
            onClick={stop}
            title="Detener"
            style={{
              background: "transparent",
              color: "var(--tinta, #000)",
              border: "2px solid var(--tinta-suave, #555)",
              borderRadius: "6px",
              padding: "0.4rem 0.9rem",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            ⏹ Detener
          </button>
        </>
      )}
    </div>
  );
}
