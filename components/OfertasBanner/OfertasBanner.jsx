"use client";

import { useState, useEffect } from "react";
import { X, Tag } from "lucide-react";

export default function OfertasBanner() {
  const [ofertas, setOfertas] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hoy = new Date().toDateString();
    const cerradoEn = localStorage.getItem("ofertasBannerCerrado");
    if (cerradoEn === hoy) return;

    fetch("/api/ofertas?activas=true")
      .then((r) => r.json())
      .then((data) => {
        if (data.ofertas && data.ofertas.length > 0) {
          setOfertas(data.ofertas);
          setVisible(true);
        }
      })
      .catch(() => {});
  }, []);

  const cerrar = () => {
    const hoy = new Date().toDateString();
    localStorage.setItem("ofertasBannerCerrado", hoy);
    setVisible(false);
  };

  if (!visible || ofertas.length === 0) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Tag className="w-5 h-5 shrink-0" />
            <span className="font-bold text-sm uppercase tracking-wide">
              Ofertas activas:
            </span>
            <div className="flex flex-wrap gap-3">
              {ofertas.map((oferta) => (
                <span
                  key={oferta.id}
                  className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold"
                >
                  {oferta.nombre} — {oferta.porcentaje_descuento}% OFF
                  {oferta.fecha_fin && (
                    <span className="ml-1 opacity-80 text-xs font-normal">
                      (hasta{" "}
                      {new Date(oferta.fecha_fin).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "short",
                      })}
                      )
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={cerrar}
            aria-label="Cerrar banner de ofertas"
            className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
