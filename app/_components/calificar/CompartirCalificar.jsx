"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

export const ENLACE_CALIFICAR = "https://neurai.dev/calificar";

export const MENSAJE_CALIFICAR =
  "¿Compraste en neurai.dev o pediste algún servicio? 💻\n" +
  "Califica y envía para recibir 15% de descuento en tu próxima compra de la tienda 🎁\n" +
  ENLACE_CALIFICAR;

function IconoWhatsApp({ className }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" className={className} style={{ width: 16, height: 16, flexShrink: 0 }}>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.13-1.35A9.9 9.9 0 1 0 12.04 2Zm5.8 14.03c-.25.7-1.43 1.33-1.98 1.4-.5.07-1.14.1-1.84-.12a16.8 16.8 0 0 1-1.67-.62 13 13 0 0 1-5-4.42 5.7 5.7 0 0 1-1.2-3.03c0-1.43.75-2.13 1.02-2.42.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.66.5.25.6.84 2.05.91 2.2.08.14.12.31.03.5-.1.19-.14.31-.29.48-.14.17-.3.38-.43.5-.14.15-.29.3-.12.6.17.29.74 1.22 1.6 1.98 1.1.97 2.02 1.28 2.31 1.42.29.14.46.12.63-.07.17-.2.72-.84.91-1.13.2-.29.38-.24.65-.14.26.1 1.68.79 1.97.93.29.15.48.22.55.34.07.12.07.7-.18 1.4Z" />
    </svg>
  );
}

function IconoFacebook({ className }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" className={className} style={{ width: 16, height: 16, flexShrink: 0 }}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

/**
 * Botones para compartir el enlace de calificar (compras y servicios + 15%):
 * WhatsApp, Facebook, menú de compartir del celular y copiar enlace.
 */
export default function CompartirCalificar({
  titulo = "¿Compraste en neurai o pediste algún servicio? Califica y envía para recibir tu descuento",
  subtitulo = null,
}) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(ENLACE_CALIFICAR);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {}
  };

  const compartirNativo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Califica a neurai.dev", text: MENSAJE_CALIFICAR });
        return;
      } catch {
        // cancelado por el usuario
        return;
      }
    }
    copiar();
  };

  const boton =
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors";

  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4">
      <p className="font-semibold text-blue-700 dark:text-blue-300 text-center mb-3">🎁 {titulo}</p>
      {subtitulo && (
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center -mt-2 mb-3">{subtitulo}</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(MENSAJE_CALIFICAR)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${boton} bg-blue-600 hover:bg-blue-700 text-white`}
        >
          <IconoWhatsApp className="w-4 h-4" />
          WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ENLACE_CALIFICAR)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${boton} bg-blue-600 hover:bg-blue-700 text-white`}
        >
          <IconoFacebook className="w-4 h-4" />
          Facebook
        </a>
        <button
          type="button"
          onClick={compartirNativo}
          className={`${boton} bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100`}
        >
          <Share2 className="w-4 h-4 shrink-0" size={16} />
          Compartir
        </button>
        <button
          type="button"
          onClick={copiar}
          className={`${boton} bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100`}
        >
          {copiado ? <Check className="w-4 h-4 shrink-0" size={16} /> : <Copy className="w-4 h-4 shrink-0" size={16} />}
          {copiado ? "¡Copiado!" : "Copiar enlace"}
        </button>
      </div>
    </div>
  );
}
