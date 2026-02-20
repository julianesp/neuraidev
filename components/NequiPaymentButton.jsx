"use client";

import React, { useState } from "react";
import { Zap, Copy, Check, ExternalLink } from "lucide-react";
import Swal from "sweetalert2";

/**
 * Botón de pago con Nequi
 * Muestra el número de Nequi y permite copiar
 *
 * @param {object} producto - Objeto del producto
 * @param {number} descuento - Porcentaje de descuento
 */
export default function NequiPaymentButton({
  producto,
  descuento = 5,
  numeroNequi = "3174503604", // Tu número de Nequi
  nombreNegocio = "Neurai.dev"
}) {
  const [copiado, setCopiado] = useState(false);

  const precioOriginal = producto?.precio || 0;
  const precioConDescuento = Math.round(precioOriginal * (1 - descuento / 100));
  const ahorro = precioOriginal - precioConDescuento;

  const copiarNumero = () => {
    navigator.clipboard.writeText(numeroNequi);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleNequiPayment = async () => {
    const result = await Swal.fire({
      title: '💜 Pagar con Nequi',
      html: `
        <div class="text-left">
          <div class="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-lg mb-4">
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Producto:</strong> ${producto?.nombre || 'Producto'}
            </p>
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Precio original:</strong>
              <span class="line-through ml-2">$${precioOriginal.toLocaleString('es-CO')}</span>
            </p>
            <p class="text-lg font-bold text-purple-700 dark:text-purple-300 mb-2">
              <strong>Precio con descuento:</strong> $${precioConDescuento.toLocaleString('es-CO')}
            </p>
            <p class="text-sm text-green-600 dark:text-green-400 font-semibold">
              ✓ Ahorras: $${ahorro.toLocaleString('es-CO')} (${descuento}%)
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-lg p-4 mb-4">
            <h3 class="font-bold text-gray-900 dark:text-white mb-3">Instrucciones:</h3>
            <ol class="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Abre tu app de <strong>Nequi</strong></li>
              <li>Envía <strong>$${precioConDescuento.toLocaleString('es-CO')}</strong> al número:</li>
            </ol>

            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mt-3 text-center">
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Número Nequi:</p>
              <p class="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                ${numeroNequi}
              </p>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                📱 ${nombreNegocio}
              </p>
            </div>

            <ol start="3" class="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 mt-3">
              <li>Incluye en el mensaje: <strong>"${producto?.nombre}"</strong></li>
              <li>Toma captura del comprobante</li>
              <li>Envíanos el comprobante por WhatsApp</li>
            </ol>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600 rounded-lg p-3">
            <p class="text-xs text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Importante:</strong> Envía el comprobante para confirmar tu pedido
            </p>
          </div>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Copiar número',
      denyButtonText: 'WhatsApp',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#9333ea',
      denyButtonColor: '#25D366',
      width: '600px',
      customClass: {
        popup: 'text-left'
      }
    });

    if (result.isConfirmed) {
      // Copiar número de Nequi
      await navigator.clipboard.writeText(numeroNequi);
      Swal.fire({
        icon: 'success',
        title: '¡Copiado!',
        text: `Número ${numeroNequi} copiado al portapapeles`,
        timer: 2000,
        showConfirmButton: false
      });
    } else if (result.isDenied) {
      // Abrir WhatsApp
      const mensaje = `Hola, quiero comprar:\n\n📦 *${producto?.nombre}*\n💰 Precio con descuento Nequi: $${precioConDescuento.toLocaleString('es-CO')}\n\nVoy a realizar el pago por Nequi y enviaré el comprobante.`;
      const whatsappUrl = `https://wa.me/57${numeroNequi}?text=${encodeURIComponent(mensaje)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <button
      onClick={handleNequiPayment}
      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
    >
      <Zap className="w-5 h-5 mr-2 group-hover:animate-bounce" />
      <div className="text-left flex-1">
        <div className="text-sm">Pagar con Nequi</div>
        <div className="text-xs opacity-90">
          ${precioConDescuento.toLocaleString('es-CO')} (-{descuento}%)
        </div>
      </div>
      <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
        Ahorra ${ahorro.toLocaleString('es-CO')}
      </div>
    </button>
  );
}

/**
 * Botón compacto de Nequi (para usar junto a otros botones)
 */
export function NequiPaymentButtonCompact({
  producto,
  descuento = 5,
  numeroNequi = "3174503604"
}) {
  const precioOriginal = producto?.precio || 0;
  const precioConDescuento = Math.round(precioOriginal * (1 - descuento / 100));

  const handleClick = async () => {
    const mensaje = `Hola, quiero comprar:\n\n📦 *${producto?.nombre}*\n💰 Precio con descuento Nequi: $${precioConDescuento.toLocaleString('es-CO')}\n\nVoy a realizar el pago por Nequi.`;
    const whatsappUrl = `https://wa.me/57${numeroNequi}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
    >
      <Zap className="w-4 h-4 mr-2" />
      <span className="text-sm">
        Nequi (-{descuento}%)
      </span>
    </button>
  );
}
