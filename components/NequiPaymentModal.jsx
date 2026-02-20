"use client";

import React, { useState } from "react";
import { X, Copy, Check, Download, MessageCircle } from "lucide-react";
import { generateNequiInvoicePDF } from "@/utils/generateNequiInvoicePDF";

/**
 * Modal de instrucciones para pago con Nequi
 * Incluye generación de factura PDF
 */
export default function NequiPaymentModal({
  isOpen,
  onClose,
  producto,
  colorSeleccionado,
  cantidad = 1,
  descuento = 5,
  numeroNequi = "3174503604",
  nombreNegocio = "Neurai.dev"
}) {
  const [copiado, setCopiado] = useState(false);
  const [pdfGenerado, setPdfGenerado] = useState(false);

  // IMPORTANTE: Todos los hooks deben estar ANTES de cualquier return condicional
  // Cerrar modal con Escape
  React.useEffect(() => {
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

  // Cálculos y funciones DESPUÉS del return condicional (pero no son hooks)
  const precioOriginal = producto.precio || producto.price || 0;
  const precioConDescuento = Math.round(precioOriginal * (1 - descuento / 100));
  const totalOriginal = precioOriginal * cantidad;
  const totalConDescuento = precioConDescuento * cantidad;
  const ahorro = totalOriginal - totalConDescuento;

  const productoNombreCompleto = colorSeleccionado
    ? `${producto.nombre || producto.title} - ${colorSeleccionado}`
    : producto.nombre || producto.title;

  // Copiar número de Nequi
  const copiarNumero = () => {
    navigator.clipboard.writeText(numeroNequi);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Generar y descargar factura PDF
  const descargarFactura = () => {
    try {
      const datosFactura = {
        productoNombre: producto.nombre || producto.title,
        productoColor: colorSeleccionado,
        cantidad: cantidad,
        precioOriginal: precioOriginal,
        descuento: descuento,
        precioConDescuento: precioConDescuento,
        numeroNequi: numeroNequi,
        nombreNegocio: nombreNegocio
      };

      const resultado = generateNequiInvoicePDF(datosFactura);
      setPdfGenerado(true);

      // Mostrar notificación de éxito
      console.log("Factura generada:", resultado);
    } catch (error) {
      console.error("Error al generar factura:", error);
      alert("Hubo un error al generar la factura. Por favor, intenta de nuevo.");
    }
  };

  // Enviar comprobante por WhatsApp
  const enviarPorWhatsApp = () => {
    const mensaje = `Hola! 👋\n\nQuiero confirmar mi pago por Nequi:\n\n📦 Producto: ${productoNombreCompleto}\n📊 Cantidad: ${cantidad}\n💰 Total pagado: $${totalConDescuento.toLocaleString('es-CO')}\n\nAdjunto el comprobante de pago.\n\n¡Gracias!`;
    const whatsappUrl = `https://wa.me/57${numeroNequi}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in duration-300"
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
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            💜 Instrucciones de Pago con Nequi
          </h2>
        </div>

        {/* Resumen del producto */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Producto:</strong>
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {productoNombreCompleto}
              </span>
            </div>

            {cantidad > 1 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Cantidad:</strong>
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {cantidad} unidades
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Precio original:</strong>
              </span>
              <span className="text-sm line-through text-gray-500 dark:text-gray-400">
                ${totalOriginal.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                <strong>Total a pagar:</strong>
              </span>
              <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                ${totalConDescuento.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="pt-2 border-t border-purple-300 dark:border-purple-600">
              <p className="text-sm text-center text-green-600 dark:text-green-400 font-semibold">
                ✓ Ahorras: ${ahorro.toLocaleString('es-CO')} ({descuento}%)
              </p>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-white dark:bg-gray-700 border-2 border-purple-300 dark:border-purple-600 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
              📲
            </span>
            Instrucciones:
          </h3>

          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <li>Abre tu app de <strong>Nequi</strong></li>
            <li>
              Envía <strong className="text-purple-700 dark:text-purple-300">${totalConDescuento.toLocaleString('es-CO')}</strong> al número:
            </li>
          </ol>

          {/* Número de Nequi */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 my-4 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Número Nequi:</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2">
              {numeroNequi}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              📱 {nombreNegocio}
            </p>

            <button
              onClick={copiarNumero}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {copiado ? (
                <>
                  <Check size={18} />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copiar número
                </>
              )}
            </button>
          </div>

          <ol start="3" className="list-decimal list-inside space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <li>Incluye en el mensaje: <strong>&quot;{productoNombreCompleto}&quot;</strong></li>
            <li>Toma captura del comprobante de pago</li>
            <li>Envíanos el comprobante por WhatsApp</li>
          </ol>
        </div>

        {/* Aviso importante */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            <strong>⚠️ IMPORTANTE:</strong> Tu factura se generará automáticamente al hacer clic en el botón de abajo.
            Envía el comprobante de pago para confirmar tu pedido.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          {/* Descargar Factura */}
          <button
            onClick={descargarFactura}
            className={`w-full font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 ${
              pdfGenerado
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            <Download size={20} />
            {pdfGenerado ? "✓ Factura Descargada" : "📄 Descargar Factura PDF"}
          </button>

          {/* Enviar comprobante por WhatsApp */}
          <button
            onClick={enviarPorWhatsApp}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            💬 Enviar comprobante por WhatsApp
          </button>

          {/* Cerrar */}
          <button
            onClick={onClose}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
