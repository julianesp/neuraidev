"use client";

import React, { useState } from "react";
import { X, Copy, Check, Download, MessageCircle, UserPlus, LogIn } from "lucide-react";
import { generateNequiInvoicePDF } from "@/utils/generateNequiInvoicePDF";
import { useUser } from "@clerk/nextjs";

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
  const { user, isLoaded } = useUser();
  const [copiado, setCopiado] = useState(false);
  const [pdfGenerado, setPdfGenerado] = useState(false);
  const [showRegisterSuggestion, setShowRegisterSuggestion] = useState(false);
  const [userDecidedToContinue, setUserDecidedToContinue] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [numeroFactura, setNumeroFactura] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);

  // IMPORTANTE: Todos los hooks deben estar ANTES de cualquier return condicional
  // Cerrar modal con Escape
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showRegisterSuggestion) {
          setShowRegisterSuggestion(false);
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
  }, [isOpen, onClose, showRegisterSuggestion]);

  // Auto-completar email si el usuario está logueado
  React.useEffect(() => {
    if (isLoaded && user && user.primaryEmailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [isLoaded, user]);

  // Mostrar sugerencia de registro si el usuario NO está autenticado
  React.useEffect(() => {
    if (isOpen && isLoaded && !user && !userDecidedToContinue && !orderCreated) {
      setShowRegisterSuggestion(true);
    } else if (isOpen && isLoaded && (user || userDecidedToContinue) && !orderCreated) {
      // Si el usuario está registrado o decidió continuar, mostrar formulario de email
      setShowEmailForm(true);
    }
  }, [isOpen, isLoaded, user, userDecidedToContinue, orderCreated]);

  // Reset al cerrar
  React.useEffect(() => {
    if (!isOpen) {
      setShowRegisterSuggestion(false);
      setUserDecidedToContinue(false);
      setShowEmailForm(false);
      setEmail('');
      setEmailError('');
      setCreatingOrder(false);
      setNumeroFactura('');
      setOrderCreated(false);
    }
  }, [isOpen]);

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
    let mensaje = `Hola! 👋\n\nQuiero confirmar mi pago por Nequi:\n\n`;

    if (numeroFactura) {
      mensaje += `📄 Factura: ${numeroFactura}\n`;
    }

    if (email) {
      mensaje += `📧 Email: ${email}\n\n`;
    }

    mensaje += `📦 Producto: ${productoNombreCompleto}\n📊 Cantidad: ${cantidad}\n💰 Total pagado: $${totalConDescuento.toLocaleString('es-CO')}\n\nAdjunto el comprobante de pago.\n\n¡Gracias!`;

    const whatsappUrl = `https://wa.me/57${numeroNequi}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Continuar sin registrarse
  const handleContinuarSinRegistro = () => {
    setUserDecidedToContinue(true);
    setShowRegisterSuggestion(false);
    setShowEmailForm(true);
  };

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
      const precioOriginal = (producto.precio || producto.price) * cantidad;
      const totalConDescuento = Math.round(precioOriginal * (1 - descuento / 100));

      // Generar número de factura único
      const fecha = new Date();
      const numeroFacturaGenerado = `NEQUI-${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}${String(fecha.getHours()).padStart(2, '0')}${String(fecha.getMinutes()).padStart(2, '0')}${String(fecha.getSeconds()).padStart(2, '0')}`;

      // Preparar producto para guardar
      const productoParaGuardar = {
        id: producto.id,
        nombre: producto.nombre || producto.title,
        precio: producto.precio || producto.price,
        cantidad: cantidad,
        variacion: colorSeleccionado || null,
        imagen: producto.imagen || producto.image
      };

      // Llamar a la API para crear el pedido
      const response = await fetch('/api/nequi/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          numeroFactura: numeroFacturaGenerado,
          productos: [productoParaGuardar],
          precioOriginal: precioOriginal,
          descuentoPorcentaje: descuento,
          totalConDescuento: totalConDescuento,
          userId: user?.id || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pedido');
      }

      setNumeroFactura(numeroFacturaGenerado);
      setShowEmailForm(false);
      setOrderCreated(true);

      console.log('✅ Pedido Nequi creado:', data.order);

    } catch (error) {
      console.error('Error creando pedido Nequi:', error);
      setEmailError(error.message || 'Error al crear el pedido. Intenta de nuevo.');
    } finally {
      setCreatingOrder(false);
    }
  };

  // Vista de sugerencia de registro
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
            onClick={onClose}
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
              href={`/sign-up?redirect_url=${encodeURIComponent(window.location.pathname)}`}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Crear cuenta gratis
            </a>

            <a
              href={`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Ya tengo cuenta
            </a>

            <button
              onClick={handleContinuarSinRegistro}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Continuar sin registrarme
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista de formulario de email
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
            onClick={onClose}
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
                autoFocus
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
                onClick={() => {
                  setShowEmailForm(false);
                  if (!user) {
                    setShowRegisterSuggestion(true);
                  } else {
                    onClose();
                  }
                }}
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
