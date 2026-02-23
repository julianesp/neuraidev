"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, CreditCard, Download, MessageCircle, Copy, Check, UserPlus, LogIn } from "lucide-react";
import { generateNequiInvoicePDF } from "@/utils/generateNequiInvoicePDF";
import { useUser } from "@clerk/nextjs";

/**
 * Modal para seleccionar método de pago desde el carrito
 * Incluye flujo completo de Nequi con factura PDF
 */
export default function CartPaymentMethodModal({
  isOpen,
  onClose,
  cart = [],
  totalPrice = 0,
  descuento = 5,
  numeroNequi = "3174503604",
  nombreNegocio = "Neurai.dev",
  onSelectEpayco
}) {
  const { user, isLoaded } = useUser();
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [showNequiInstructions, setShowNequiInstructions] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showRegisterSuggestion, setShowRegisterSuggestion] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [numeroFactura, setNumeroFactura] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [pdfGenerado, setPdfGenerado] = useState(false);

  // IMPORTANTE: Todos los hooks deben estar ANTES de cualquier return condicional
  useEffect(() => {
    if (!isOpen) {
      setMetodoSeleccionado(null);
      setShowNequiInstructions(false);
      setShowEmailForm(false);
      setShowRegisterSuggestion(false);
      setEmail('');
      setEmailError('');
      setCreatingOrder(false);
      setNumeroFactura('');
      setCopiado(false);
      setPdfGenerado(false);
    }
  }, [isOpen]);

  // Auto-completar email si el usuario está logueado
  useEffect(() => {
    if (isLoaded && user && user.primaryEmailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [isLoaded, user]);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showNequiInstructions) {
          setShowNequiInstructions(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, showNequiInstructions, onClose]);

  // Return condicional DESPUÉS de todos los hooks
  if (!isOpen) return null;

  // Cálculos DESPUÉS del return condicional (no son hooks)
  const totalConDescuento = Math.round(totalPrice * (1 - descuento / 100));
  const ahorro = totalPrice - totalConDescuento;

  // Validar email
  const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  // Crear pedido en Supabase
  const createNequiOrder = async () => {
    if (!validateEmail(email)) {
      setEmailError('Por favor ingresa un email válido');
      return;
    }

    setCreatingOrder(true);
    setEmailError('');

    try {
      // Generar número de factura único
      const fecha = new Date();
      const numeroFacturaGenerado = `NEQUI-${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}${String(fecha.getHours()).padStart(2, '0')}${String(fecha.getMinutes()).padStart(2, '0')}${String(fecha.getSeconds()).padStart(2, '0')}`;

      // Preparar productos para guardar
      const productosParaGuardar = cart.map(item => ({
        id: item.id,
        nombre: item.nombre || item.title,
        precio: item.precio || item.price,
        cantidad: item.cantidad,
        variacion: item.variacion || null,
        imagen: item.imagen || item.image
      }));

      // Llamar a la API para crear el pedido
      const response = await fetch('/api/nequi/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          numeroFactura: numeroFacturaGenerado,
          productos: productosParaGuardar,
          precioOriginal: totalPrice,
          descuentoPorcentaje: descuento,
          totalConDescuento: totalConDescuento,
          userId: user?.id || null // Vincular con el usuario de Clerk si está autenticado
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pedido');
      }

      setNumeroFactura(numeroFacturaGenerado);
      setShowEmailForm(false);
      setShowNequiInstructions(true);

      console.log('✅ Pedido Nequi creado:', data.order);

    } catch (error) {
      console.error('Error creando pedido Nequi:', error);
      setEmailError(error.message || 'Error al crear el pedido. Intenta de nuevo.');
    } finally {
      setCreatingOrder(false);
    }
  };

  const copiarNumero = () => {
    navigator.clipboard.writeText(numeroNequi);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const descargarFactura = () => {
    try {
      // Generar factura con resumen del carrito
      const productosResumen = cart.map(item =>
        `${item.nombre}${item.variacion ? ` - ${item.variacion}` : ''} (x${item.cantidad})`
      ).join(', ');

      const cantidadTotal = cart.reduce((sum, item) => sum + item.cantidad, 0);

      const datosFactura = {
        productoNombre: `Pedido de ${cart.length} producto${cart.length > 1 ? 's' : ''}`,
        productoColor: productosResumen,
        cantidad: cantidadTotal,
        precioOriginal: totalPrice / cantidadTotal,
        descuento: descuento,
        precioConDescuento: totalConDescuento / cantidadTotal,
        numeroNequi: numeroNequi,
        nombreNegocio: nombreNegocio
      };

      const resultado = generateNequiInvoicePDF(datosFactura);
      setPdfGenerado(true);

      console.log("Factura del carrito generada:", resultado);
    } catch (error) {
      console.error("Error al generar factura:", error);
      alert("Hubo un error al generar la factura. Por favor, intenta de nuevo.");
    }
  };

  const enviarPorWhatsApp = () => {
    let mensaje = `Hola! 👋\n\n`;
    mensaje += `Quiero confirmar mi pago por Nequi:\n\n`;
    mensaje += `📄 Factura: ${numeroFactura}\n`;
    mensaje += `📧 Email: ${email}\n\n`;
    mensaje += `📦 Productos:\n`;

    cart.forEach((item, index) => {
      mensaje += `${index + 1}. ${item.nombre}${item.variacion ? ` - ${item.variacion}` : ''} (x${item.cantidad})\n`;
    });

    mensaje += `\n💰 Total pagado: $${totalConDescuento.toLocaleString('es-CO')}\n`;
    mensaje += `\nAdjunto el comprobante de pago.\n\n¡Gracias!`;

    const whatsappUrl = `https://wa.me/57${numeroNequi}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleContinuar = () => {
    if (metodoSeleccionado === "nequi") {
      // Si el usuario no está autenticado, mostrar sugerencia de registro
      if (!user) {
        setShowRegisterSuggestion(true);
      } else {
        // Si está autenticado, ir directo al formulario de email
        setShowEmailForm(true);
      }
    } else if (metodoSeleccionado === "epayco") {
      onSelectEpayco();
      onClose();
    }
  };

  // Vista 0: Sugerencia de registro (si no está autenticado)
  if (showRegisterSuggestion) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => setShowRegisterSuggestion(false)}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setShowRegisterSuggestion(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              ¿Registrarte antes de comprar?
            </h2>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Te recomendamos crear una cuenta para una mejor experiencia
            </p>
          </div>

          {/* Beneficios */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Beneficios de registrarte:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Identificación precisa:</strong> Podremos vincular tu compra directamente contigo</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Historial de compras:</strong> Accede a todas tus órdenes en un solo lugar</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Seguimiento fácil:</strong> Rastrea el estado de tu pedido en tiempo real</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Evita confusiones:</strong> Con el descuento de Nequi, es más fácil identificar tu pedido si estás registrado</span>
              </li>
            </ul>
          </div>

          {/* Nota importante */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-3 mb-6">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>💡 ¿Por qué es importante?</strong><br />
              Al pagar con Nequi, el precio cambia por el descuento. Si dos personas compran el mismo producto a la misma hora, tener una cuenta nos ayuda a identificar correctamente tu pedido.
            </p>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <a
              href="/sign-up?redirect_url=/carrito"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Crear cuenta gratis
            </a>

            <a
              href="/sign-in?redirect_url=/carrito"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Ya tengo cuenta
            </a>

            <button
              onClick={() => {
                setShowRegisterSuggestion(false);
                setShowEmailForm(true);
              }}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Continuar sin registrarme
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista 1: Formulario de email (cuando elige Nequi)
  if (showEmailForm) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => setShowEmailForm(false)}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setShowEmailForm(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Ingresa tu email
            </h2>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Necesitamos tu email para enviarte recordatorios y confirmación del pedido
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-600 dark:focus:border-purple-400 focus:outline-none transition-colors"
                disabled={creatingOrder}
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {emailError}
                </p>
              )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>¿Por qué necesitamos tu email?</strong><br />
                • Te enviaremos recordatorios si olvidas completar el pago<br />
                • Recibirás confirmación cuando procesemos tu pedido<br />
                • Tu email NO será compartido con terceros
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEmailForm(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
                disabled={creatingOrder}
              >
                Volver
              </button>
              <button
                onClick={createNequiOrder}
                disabled={creatingOrder || !email}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingOrder ? 'Procesando...' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista 2: Selección de método de pago
  if (!showNequiInstructions) {
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
              {cart.length} producto{cart.length > 1 ? 's' : ''} en tu carrito
            </p>
          </div>

          {/* Métodos de pago */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              💰 Método de Pago:
            </p>

            {/* Opción Nequi */}
            <button
              onClick={() => setMetodoSeleccionado("nequi")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                metodoSeleccionado === "nequi"
                  ? "border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30"
                  : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700"
              }`}
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
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                metodoSeleccionado === "epayco"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
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
                    ${totalPrice.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Pago con tarjeta de crédito/débito
              </div>
            </button>
          </div>

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
              disabled={!metodoSeleccionado}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all ${
                !metodoSeleccionado
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

  // Vista de instrucciones de Nequi
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => setShowNequiInstructions(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={() => setShowNequiInstructions(false)}
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

        {/* Resumen del pedido */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Productos en tu pedido:</strong>
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {cart.length} producto{cart.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Lista de productos */}
            <div className="max-h-32 overflow-y-auto text-xs text-gray-600 dark:text-gray-400">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between py-1">
                  <span>{item.nombre}{item.variacion ? ` - ${item.variacion}` : ''}</span>
                  <span>x{item.cantidad}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-purple-300 dark:border-purple-600">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Precio original:</strong>
              </span>
              <span className="text-sm line-through text-gray-500 dark:text-gray-400">
                ${totalPrice.toLocaleString('es-CO')}
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

            <div className="pt-2">
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
            <li>Incluye en el mensaje: <strong>&quot;Pedido de {cart.length} producto{cart.length > 1 ? 's' : ''}&quot;</strong></li>
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

          {/* Volver */}
          <button
            onClick={() => setShowNequiInstructions(false)}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-6 rounded-lg transition-colors"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
}
