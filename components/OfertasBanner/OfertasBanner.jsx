"use client";

import { useState, useEffect } from "react";
import { X, Tag } from "lucide-react";
import Link from "next/link";

// Banner de la home: aparece solo si hay productos con oferta, precio de
// lanzamiento o campaña vigente (ver /api/productos/ofertas).
export default function OfertasBanner() {
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    const hoy = new Date().toDateString();
    try {
      if (localStorage.getItem("ofertasBannerCerrado") === hoy) return;
    } catch {}

    fetch("/api/productos/ofertas")
      .then((r) => r.json())
      .then((data) => {
        if (data.total > 0) setResumen(data);
      })
      .catch(() => {});
  }, []);

  const cerrar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem("ofertasBannerCerrado", new Date().toDateString());
    } catch {}
    setResumen(null);
  };

  if (!resumen) return null;

  const partes = [];
  if (resumen.lanzamientos > 0) {
    partes.push(
      `🚀 ${resumen.lanzamientos} ${resumen.lanzamientos === 1 ? "precio" : "precios"} de lanzamiento`,
    );
  }
  if (resumen.ofertas > 0) {
    partes.push(
      `🔥 ${resumen.ofertas} ${resumen.ofertas === 1 ? "producto" : "productos"} en oferta`,
    );
  }

  return (
    <Link href="/ofertas/productos" className="block w-full" style={{ backgroundColor: "#2563eb" }}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap text-white">
            <Tag className="w-5 h-5 shrink-0" />
            {partes.map((texto) => (
              <span
                key={texto}
                className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold"
              >
                {texto}
              </span>
            ))}
            {resumen.mayorDescuento > 0 && (
              <span className="text-sm font-semibold">
                Hasta {resumen.mayorDescuento}% de descuento
              </span>
            )}
            <span
              className="bg-white font-semibold text-xs px-3 py-1 rounded-full hidden sm:inline transition-opacity hover:opacity-90"
              style={{ color: "#2563eb" }}
            >
              Ver ofertas →
            </span>
          </div>
          <button
            onClick={cerrar}
            aria-label="Cerrar banner de ofertas"
            className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
