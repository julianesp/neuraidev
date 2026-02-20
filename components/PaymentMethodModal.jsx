"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, CreditCard } from "lucide-react";
import ProductColorPicker from "./ProductColorPicker";

/**
 * Modal para seleccionar método de pago antes de agregar al carrito
 */
export default function PaymentMethodModal({
  isOpen,
  onClose,
  producto,
  coloresDisponibles = [],
  colorInicial = null,
  cantidad = 1,
  descuento = 5,
  onSelectNequi,
  onSelectEpayco
}) {
  const [colorSeleccionado, setColorSeleccionado] = useState(colorInicial);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);

  // IMPORTANTE: Todos los hooks deben estar ANTES de cualquier return condicional
  useEffect(() => {
    setColorSeleccionado(colorInicial);
  }, [colorInicial]);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Return condicional DESPUÉS de todos los hooks
  if (!isOpen || !producto) return null;

  const precioOriginal = producto.precio || producto.price || 0;
  const precioConDescuento = Math.round(precioOriginal * (1 - descuento / 100));
  const totalOriginal = precioOriginal * cantidad;
  const totalConDescuento = precioConDescuento * cantidad;
  const ahorro = totalOriginal - totalConDescuento;

  const tieneColores = coloresDisponibles.length > 0;
  const requiereColor = tieneColores && !colorSeleccionado;

  const handleContinuar = () => {
    if (tieneColores && !colorSeleccionado) {
      alert("Por favor selecciona un color");
      return;
    }

    if (metodoSeleccionado === "nequi") {
      onSelectNequi(colorSeleccionado);
    } else if (metodoSeleccionado === "epayco") {
      onSelectEpayco(colorSeleccionado);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            💜 Elige cómo quieres pagar
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona tu método de pago favorito
          </p>
        </div>

        {/* Información del producto */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">📦</div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {producto.nombre || producto.title}
              </p>
              {cantidad > 1 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cantidad: {cantidad} unidades
                </p>
              )}
            </div>
          </div>

          {/* Selector de color */}
          {tieneColores && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🎨 Selecciona un color:
              </p>
              <ProductColorPicker
                coloresDisponibles={coloresDisponibles}
                colorSeleccionado={colorSeleccionado}
                onColorChange={setColorSeleccionado}
              />
            </div>
          )}
        </div>

        {/* Métodos de pago */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            💰 Método de Pago:
          </p>

          {/* Opción Nequi */}
          <button
            onClick={() => setMetodoSeleccionado("nequi")}
            disabled={requiereColor}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              metodoSeleccionado === "nequi"
                ? "border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30"
                : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700"
            } ${requiereColor ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  Nequi
                </span>
                <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  -{descuento}%
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  ${totalConDescuento.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-green-600 dark:text-green-400 font-medium">
                ✓ Ahorras ${ahorro.toLocaleString('es-CO')}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                • Sin comisiones
              </span>
            </div>
          </button>

          {/* Opción ePayco */}
          <button
            onClick={() => setMetodoSeleccionado("epayco")}
            disabled={requiereColor}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              metodoSeleccionado === "epayco"
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700"
            } ${requiereColor ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  ePayco
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${totalOriginal.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Pago con tarjeta de crédito/débito
            </div>
          </button>
        </div>

        {/* Advertencia si requiere color */}
        {requiereColor && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-600 rounded-lg p-3 mb-4">
            <p className="text-sm text-orange-800 dark:text-orange-200 text-center">
              ⚠️ Selecciona un color para continuar
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleContinuar}
            disabled={!metodoSeleccionado || requiereColor}
            className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all ${
              !metodoSeleccionado || requiereColor
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : metodoSeleccionado === "nequi"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {metodoSeleccionado === "nequi" ? "Continuar con Nequi" : metodoSeleccionado === "epayco" ? "Pagar con ePayco" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
