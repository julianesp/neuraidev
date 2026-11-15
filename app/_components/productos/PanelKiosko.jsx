"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";

const ALTO_PRECIO = 44; // lo que sube el nombre para dejar ver el precio

/**
 * Parte inferior de la tarjeta de producto: el nombre va en un panel oscuro
 * elegante que tapa el precio. En la esquina inferior derecha (la redondeada)
 * hay una esquina doblada que se levanta sola cada tanto, invitando a tocar:
 * al tocarla, el panel del nombre sube y deja ver el precio debajo. Tocar de
 * nuevo lo baja. Funciona con el dedo (celular / tablet) y con el mouse.
 */
export default function PanelKiosko({ nombre, children }) {
  const [abierto, setAbierto] = useState(false);

  const alternar = (e) => {
    // La tarjeta es un enlace: tocar la esquina no debe abrir el producto
    e.preventDefault();
    e.stopPropagation();
    setAbierto((v) => !v);
  };

  return (
    // Posición en style: el SCSS de la tarjeta fuerza 140px a cualquier .relative en celular
    <div className="kiosko absolute bottom-0 left-0 right-0 z-20" style={{ minHeight: ALTO_PRECIO + 8 }}>
      {/* Precio: queda debajo del panel del nombre */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center px-3 rounded-br-[28px]"
        style={{ height: ALTO_PRECIO, background: "#0b0f17" }}
      >
        {children}
      </div>

      {/* Panel del nombre: sube al tocar la esquina */}
      <div
        className="kiosko-panel rounded-br-[28px]"
        style={{
          position: "relative",
          minHeight: ALTO_PRECIO + 8,
          transform: abierto ? `translateY(-${ALTO_PRECIO}px)` : "translateY(0)",
          transition: "transform 520ms cubic-bezier(0.34, 1.35, 0.64, 1), box-shadow 520ms ease",
          background: "linear-gradient(180deg, rgba(55,65,81,0.92) 0%, rgba(31,41,55,0.96) 55%, rgba(17,24,39,0.98) 100%)",
          borderTop: "1px solid rgba(255,255,255,0.14)",
          boxShadow: abierto ? "0 10px 18px -6px rgba(0,0,0,0.6)" : "0 -2px 8px rgba(0,0,0,0.25)",
          backdropFilter: "blur(6px)",
        }}
      >
        {/* Nombre más pequeño y en hasta 3 líneas para que quepa completo
            (whiteSpace en style: el SCSS de la tarjeta lo deja en una sola línea en celular) */}
        <h3
          className="kiosko-nombre font-semibold text-white pl-3 pr-11 py-2.5 line-clamp-3"
          style={{ whiteSpace: "normal", lineHeight: 1.25 }}
        >
          {nombre}
        </h3>

        {/* Esquina doblada: distintivo de que se puede tocar */}
        <button
          type="button"
          onClick={alternar}
          aria-expanded={abierto}
          aria-label={abierto ? `Ocultar precio de ${nombre}` : `Ver precio de ${nombre}`}
          className="kiosko-esquina absolute bottom-0 right-0 w-11 h-11 rounded-br-[28px] overflow-hidden"
          style={{ position: "absolute", border: "none", background: "transparent", padding: 0, boxShadow: "none" }}
        >
          <span aria-hidden="true" className={`kiosko-doblez ${abierto ? "" : "kiosko-pista"}`} />
          <ChevronUp
            aria-hidden="true"
            className="absolute bottom-1.5 right-2 w-4 h-4 text-gray-900"
            style={{
              transform: abierto ? "rotate(180deg)" : "none",
              transition: "transform 400ms ease",
            }}
          />
        </button>
      </div>

      <style>{`
        .kiosko .lucide { fill: none; }
        .kiosko .kiosko-nombre { font-size: 0.8125rem !important; }
        @media (min-width: 1024px) { .kiosko .kiosko-nombre { font-size: 0.875rem !important; } }
        .kiosko-doblez {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          /* la hoja doblada: claro arriba-izquierda, sombra en el pliegue */
          background: linear-gradient(315deg, #e5e7eb 0%, #f9fafb 48%, rgba(0,0,0,0.35) 50%, transparent 56%);
          border-top-left-radius: 10px;
          transform-origin: 100% 100%;
          box-shadow: -2px -2px 6px rgba(0,0,0,0.25);
          transition: transform 300ms ease;
        }
        .kiosko-esquina:hover .kiosko-doblez,
        .kiosko-esquina:focus-visible .kiosko-doblez { transform: scale(1.12); }
        @keyframes kiosko-pista {
          0%, 70%, 100% { transform: scale(1); }
          78% { transform: scale(1.22); }
          86% { transform: scale(0.96); }
          92% { transform: scale(1.08); }
        }
        .kiosko-pista { animation: kiosko-pista 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .kiosko-pista { animation: none; }
          .kiosko-panel { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
