"use client";

import React from "react";
import { Zap, Gift, Percent, TrendingDown } from "lucide-react";

/**
 * Badge/Banner para mostrar el descuento por pago con Nequi
 *
 * @param {number} descuento - Porcentaje de descuento (ej: 5 para 5%)
 * @param {string} variant - Estilo: "banner", "badge", "card"
 */
export default function NequiPaymentBadge({
  descuento = 5,
  variant = "banner"
}) {

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-lg p-4 shadow-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full mr-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg flex items-center">
                <Percent className="w-5 h-5 mr-1" />
                {descuento}% de Descuento
              </h3>
              <p className="text-white/90 text-sm">
                ¡Paga con <span className="font-bold">Nequi</span> y ahorra!
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Gift className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-semibold text-sm">
              Sin comisiones
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-md">
        <TrendingDown className="w-4 h-4 mr-2" />
        <span className="font-bold text-sm">
          -{descuento}% pagando con Nequi
        </span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-6">
        <div className="flex items-start">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-lg mr-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Percent className="w-5 h-5 mr-2 text-purple-600" />
              {descuento}% de Descuento Inmediato
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Paga con <span className="font-bold text-purple-600 dark:text-purple-400">Nequi</span> y
              obtén un descuento directo en tu compra
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                <Gift className="w-3 h-3 mr-1 text-purple-600" />
                Sin comisiones
              </span>
              <span className="inline-flex items-center bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                <Zap className="w-3 h-3 mr-1 text-purple-600" />
                Pago instantáneo
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Banner flotante/sticky para mostrar en toda la tienda
 */
export function NequiDiscountFloatingBanner({ descuento = 5 }) {
  const [visible, setVisible] = React.useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 shadow-2xl animate-pulse-slow">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <Zap className="w-6 h-6 text-yellow-300 mr-3 animate-bounce" />
            <div>
              <p className="text-white font-bold text-sm md:text-base">
                🎉 ¡DESCUENTO ESPECIAL! {descuento}% OFF pagando con Nequi
              </p>
              <p className="text-white/90 text-xs hidden md:block">
                Aprovecha ahora y ahorra en todos tus productos
              </p>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="ml-4 text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Comparador de precios: ePayco vs Nequi
 */
export function PriceComparison({ precio, descuento = 5 }) {
  const precioConDescuento = precio * (1 - descuento / 100);
  const ahorro = precio - precioConDescuento;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Elige tu método de pago:
      </h4>

      <div className="space-y-3">
        {/* ePayco */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">ePayco</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${precio.toLocaleString('es-CO')}
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Precio normal
          </div>
        </div>

        {/* Nequi con descuento */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-600">
          <div>
            <div className="flex items-center mb-1">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                Nequi
              </p>
              <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                -{descuento}%
              </span>
            </div>
            <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
              ${precioConDescuento.toLocaleString('es-CO')}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              Ahorras: ${ahorro.toLocaleString('es-CO')}
            </p>
          </div>
          <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
    </div>
  );
}
