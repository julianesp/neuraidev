"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

/**
 * Compartir un plato. En celulares usa el menú nativo del sistema (WhatsApp,
 * Instagram, Facebook, TikTok…); si no existe, muestra WhatsApp, Facebook, X y
 * "Copiar enlace". El enlace es la página del plato, cuya vista previa muestra
 * su foto (no el logo de neurai.dev).
 */
export default function BotonCompartir({ url, titulo, texto, className = "", conTexto = false }) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => ref.current && !ref.current.contains(e.target) && setAbierto(false);
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);

  const compartir = async (e) => {
    // Dentro de tarjetas que son enlaces: que no navegue al tocar compartir.
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return; // el usuario cerró el menú
      }
    }
    setAbierto((v) => !v);
  };

  const mensaje = `${texto} ${url}`;
  const opciones = [
    ["WhatsApp", `https://wa.me/?text=${encodeURIComponent(mensaje)}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`],
    ["X", `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(url)}`],
  ];

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={compartir}
        aria-label={`Compartir ${titulo}`}
        title="Compartir"
        className={
          className ||
          "inline-flex items-center justify-center gap-1.5 w-9 h-9 rounded-full bg-black/45 hover:bg-black/60 text-white backdrop-blur-sm"
        }
      >
        <Share2 className="w-4 h-4 fill-none" />
        {conTexto && <span className="text-sm font-semibold">Compartir</span>}
      </button>
      {abierto && (
        <span
          role="menu"
          className="absolute right-0 top-full mt-2 z-30 w-48 rounded-xl bg-white text-stone-900 shadow-xl ring-1 ring-black/10 p-1.5 text-sm"
        >
          {opciones.map(([nombre, href]) => (
            <a
              key={nombre}
              role="menuitem"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setAbierto(false)}
              className="block rounded-lg px-3 py-2 hover:bg-stone-100"
            >
              {nombre}
            </a>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                await navigator.clipboard.writeText(url);
                setCopiado(true);
                setTimeout(() => {
                  setCopiado(false);
                  setAbierto(false);
                }, 1200);
              } catch {}
            }}
            className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-stone-100"
          >
            {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 fill-none" />}
            {copiado ? "Enlace copiado" : "Copiar enlace"}
          </button>
        </span>
      )}
    </span>
  );
}
