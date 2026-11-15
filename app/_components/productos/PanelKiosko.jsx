"use client";

import { useState } from "react";
import { Tag } from "lucide-react";

/**
 * Parte inferior de la tarjeta de producto, estilo kiosko: el precio va encima
 * del nombre, tapado por un panel oscuro. La pestaña de la esquina redondeada
 * (abajo a la derecha) invita a tocar: el panel se abre hacia afuera, girando
 * sobre su borde superior y saliendo de la tarjeta hacia el frente, como la
 * ventana de un kiosko, y deja ver el precio. Tocar de nuevo lo cierra.
 */
export default function PanelKiosko({ nombre, children }) {
  const [abierto, setAbierto] = useState(false);

  const alternar = (e) => {
    // La tarjeta es un enlace: tocar el panel no debe abrir el producto
    e.preventDefault();
    e.stopPropagation();
    setAbierto((v) => !v);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/60 backdrop-blur-sm rounded-br-[28px]">
      {/* Precio (encima del nombre), tapado por la ventana del kiosko.
          Posición en style: el SCSS de la tarjeta fuerza 140px a cualquier .relative en celular */}
      <div style={{ position: "relative", height: 48, perspective: "420px", perspectiveOrigin: "50% 100%" }}>
        <div className="absolute inset-0 flex items-center px-3">{children}</div>

        <button
          type="button"
          onClick={alternar}
          aria-expanded={abierto}
          aria-label={abierto ? `Ocultar precio de ${nombre}` : `Ver precio de ${nombre}`}
          className="kiosko-ventana absolute inset-0 text-left"
          style={{
            transformOrigin: "top center",
            // Abierta: sale hacia el frente y hacia arriba, fuera de la tarjeta
            transform: abierto ? "rotateX(80deg) translateZ(2px)" : "rotateX(0deg)",
            transition: "transform 650ms cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 650ms ease, filter 650ms ease",
            background: "linear-gradient(180deg, #374151 0%, #1f2937 55%, #111827 100%)",
            borderTop: "1px solid rgba(255,255,255,0.18)",
            boxShadow: abierto
              ? "0 10px 14px -8px rgba(0,0,0,0.45)"
              : "inset 0 1px 0 rgba(255,255,255,0.08), 0 -1px 4px rgba(0,0,0,0.3)",
            filter: abierto ? "brightness(1.25)" : "none",
          }}
        >
          {/* Pestaña: distintivo de que se puede tocar */}
          <span
            className={`absolute top-1/2 -translate-y-1/2 right-2 inline-flex items-center gap-1 rounded-full bg-white text-gray-900 text-xs font-bold px-2.5 py-1 shadow-md ${
              abierto ? "" : "kiosko-pista"
            }`}
          >
            <Tag className="w-3.5 h-3.5" aria-hidden="true" />
            Ver precio
          </span>
        </button>
      </div>

      <h3 className="font-bold text-base text-white px-3 pt-1 pb-3 line-clamp-2">{nombre}</h3>

      <style>{`
        .kiosko-ventana .lucide { fill: none; }
        @keyframes kiosko-pista {
          0%, 78%, 100% { transform: translateY(-50%) rotate(0deg); }
          84% { transform: translateY(calc(-50% - 3px)) rotate(-4deg); }
          90% { transform: translateY(-50%) rotate(3deg); }
          95% { transform: translateY(calc(-50% - 1px)) rotate(0deg); }
        }
        .kiosko-pista { animation: kiosko-pista 3.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .kiosko-pista { animation: none; }
          .kiosko-ventana { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
