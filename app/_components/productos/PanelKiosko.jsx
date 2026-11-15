"use client";

import { useState } from "react";
import { Tag } from "lucide-react";

/**
 * Parte inferior de la tarjeta de producto, estilo kiosko: el nombre siempre
 * se ve y el precio queda tapado por un toldo azul. La pestaña de la esquina
 * redondeada (abajo a la derecha) invita a tocar: el toldo se levanta girando
 * sobre su borde superior, como la ventana lateral de un kiosko, y deja ver
 * el precio debajo del nombre. Tocar de nuevo lo baja.
 */
export default function PanelKiosko({ nombre, children }) {
  const [abierto, setAbierto] = useState(false);

  const alternar = (e) => {
    // La tarjeta es un enlace: tocar el toldo no debe abrir el producto
    e.preventDefault();
    e.stopPropagation();
    setAbierto((v) => !v);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/60 backdrop-blur-sm rounded-br-[28px]">
      <h3 className="font-bold text-base text-white px-3 pt-3 pb-2 line-clamp-2">{nombre}</h3>

      {/* Mostrador: el precio, debajo del nombre */}
      {/* (posición en style: el SCSS de la tarjeta fuerza 140px a cualquier .relative en celular) */}
      <div style={{ position: "relative", height: 56, perspective: "700px" }}>
        <div className="absolute inset-0 flex items-center px-3 pb-1">{children}</div>

        {/* Toldo que tapa el precio y se levanta al tocarlo */}
        <button
          type="button"
          onClick={alternar}
          aria-expanded={abierto}
          aria-label={abierto ? `Ocultar precio de ${nombre}` : `Ver precio de ${nombre}`}
          className="kiosko-toldo absolute inset-0 rounded-br-[28px] text-left"
          style={{
            transformOrigin: "top center",
            // Levantado queda casi horizontal, saliendo hacia el frente como el toldo de un kiosko
            transform: abierto ? "rotateX(-80deg)" : "rotateX(0deg)",
            transition: "transform 650ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 650ms ease",
            background:
              "repeating-linear-gradient(90deg, #2563eb 0 22px, #eff6ff 22px 44px)",
            boxShadow: abierto ? "0 -6px 14px rgba(0,0,0,0.35)" : "0 -2px 6px rgba(0,0,0,0.25)",
            pointerEvents: "auto",
          }}
        >
          {/* Borde ondulado del toldo */}
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 -bottom-[7px] h-[8px]"
            style={{
              background: "radial-gradient(circle at 11px 0, #2563eb 7px, transparent 7.5px) 0 0 / 44px 8px repeat-x, radial-gradient(circle at 33px 0, #eff6ff 7px, transparent 7.5px) 0 0 / 44px 8px repeat-x",
            }}
          />
          {/* Pestaña: distintivo de que se puede tocar */}
          <span
            className={`kiosko-pestana absolute bottom-1.5 right-2 inline-flex items-center gap-1 rounded-full bg-white text-blue-700 text-xs font-bold px-2.5 py-1 shadow-md ${
              abierto ? "" : "kiosko-pista"
            }`}
          >
            <Tag className="w-3.5 h-3.5" aria-hidden="true" />
            Ver precio
          </span>
        </button>
      </div>

      <style>{`
        .kiosko-toldo .lucide { fill: none; }
        @keyframes kiosko-pista {
          0%, 78%, 100% { transform: translateY(0) rotate(0deg); }
          84% { transform: translateY(-3px) rotate(-4deg); }
          90% { transform: translateY(0) rotate(3deg); }
          95% { transform: translateY(-1px) rotate(0deg); }
        }
        .kiosko-pista { animation: kiosko-pista 3.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .kiosko-pista { animation: none; }
          .kiosko-toldo { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
