"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";

// Botones para compartir la ficha: menú nativo del celular, WhatsApp, Facebook y copiar enlace.
export default function CompartirFicha({ url, nombre }) {
  const [copiado, setCopiado] = useState(false);
  const texto = `Mira ${nombre} en el directorio del Putumayo`;

  const compartirNativo = async () => {
    try {
      await navigator.share({ title: nombre, text: texto, url });
    } catch {
      /* el usuario canceló */
    }
  };
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copia este enlace:", url);
    }
  };

  const boton =
    "inline-flex items-center gap-1.5 rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-900/30";

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Compartir esta ficha">
      {typeof navigator !== "undefined" && navigator.share && (
        <button type="button" onClick={compartirNativo} className={boton}>
          <Share2 className="h-4 w-4" /> Compartir
        </button>
      )}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${texto}: ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={boton}
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={boton}
      >
        Facebook
      </a>
      <button type="button" onClick={copiar} className={boton}>
        {copiado ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copiado ? "¡Enlace copiado!" : "Copiar enlace"}
      </button>
    </div>
  );
}
