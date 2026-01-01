"use client";

import { useEffect, useState } from "react";
import { Tag, Clock } from "lucide-react";

/**
 * Badge que muestra el descuento de una oferta activa
 * @param {string} productoId - ID del producto
 * @param {string} precio - Precio original del producto
 * @param {boolean} showCountdown - Mostrar contador regresivo (opcional)
 */
export default function OfertaBadge({ productoId, precio, showCountdown = false }) {
  const [oferta, setOferta] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarOferta();
  }, [productoId]);

  useEffect(() => {
    if (!oferta || !showCountdown) return;

    const interval = setInterval(() => {
      calcularTiempoRestante();
    }, 1000);

    return () => clearInterval(interval);
  }, [oferta, showCountdown]);

  const cargarOferta = async () => {
    try {
      const res = await fetch(`/api/ofertas/producto/${productoId}`);
      if (res.ok) {
        const data = await res.json();
        setOferta(data.oferta);
      }
    } catch (error) {
      console.error("Error cargando oferta:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularTiempoRestante = () => {
    if (!oferta) return;

    const ahora = new Date();
    const fin = new Date(oferta.fecha_fin);
    const diferencia = fin - ahora;

    if (diferencia <= 0) {
      setTiempoRestante("Oferta finalizada");
      return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    if (dias > 0) {
      setTiempoRestante(`${dias}d ${horas}h`);
    } else if (horas > 0) {
      setTiempoRestante(`${horas}h ${minutos}m`);
    } else {
      setTiempoRestante(`${minutos}m ${segundos}s`);
    }
  };

  const calcularPrecioConDescuento = () => {
    if (!oferta || !precio) return null;

    const precioNumero = typeof precio === "string" ? parseFloat(precio) : precio;
    const descuento = (precioNumero * oferta.porcentaje_descuento) / 100;
    return precioNumero - descuento;
  };

  if (loading || !oferta) return null;

  const precioConDescuento = calcularPrecioConDescuento();

  return (
    <div className="space-y-2">
      {/* Badge de descuento */}
      <div className="inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
        <Tag size={16} />
        <span>{oferta.porcentaje_descuento}% OFF</span>
      </div>

      {/* Precio con descuento */}
      {precioConDescuento && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 line-through text-sm">
              ${typeof precio === "number" ? precio.toLocaleString("es-CO") : precio}
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            ${precioConDescuento.toLocaleString("es-CO", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </div>
          <div className="text-xs text-gray-600">
            Ahorras: ${((typeof precio === "number" ? precio : parseFloat(precio)) - precioConDescuento).toLocaleString("es-CO", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </div>
        </div>
      )}

      {/* Contador regresivo */}
      {showCountdown && tiempoRestante && (
        <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
          <Clock size={14} />
          <span>Termina en: {tiempoRestante}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Componente simple solo con el badge (sin precios)
 */
export function OfertaBadgeSimple({ porcentaje }) {
  if (!porcentaje) return null;

  return (
    <div className="absolute top-2 right-2 z-10">
      <div className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
        <Tag size={16} />
        <span>{porcentaje}% OFF</span>
      </div>
    </div>
  );
}
