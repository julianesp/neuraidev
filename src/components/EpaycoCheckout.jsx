"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";

/**
 * Componente de Checkout con ePayco
 * Maneja el flujo completo de pago integrado con el carrito
 */
export default function EpaycoCheckout({ onClose }) {
  const { cart, getTotalPrice, clearCart } = useCart();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Validar que ePayco esté cargado
  const isEpaycoLoaded = () => {
    return typeof window !== "undefined" && window.ePayco;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validar datos del cliente
  const validateCustomerData = () => {
    if (!customerData.name || customerData.name.trim().length < 3) {
      toast.error("Por favor ingresa tu nombre completo");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerData.email || !emailRegex.test(customerData.email)) {
      toast.error("Por favor ingresa un email válido");
      return false;
    }

    if (!customerData.phone || customerData.phone.length < 7) {
      toast.error("Por favor ingresa un teléfono válido");
      return false;
    }

    return true;
  };

  // Procesar pago
  const handlePayment = async () => {
    // Validar datos
    if (!validateCustomerData()) {
      return;
    }

    // Validar carrito
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    // Validar que ePayco esté cargado
    if (!isEpaycoLoaded()) {
      toast.error("El sistema de pagos no está disponible. Por favor recarga la página.");
      return;
    }

    setLoading(true);

    try {
      // Calcular total
      const total = getTotalPrice();

      // Generar factura única
      const invoice = `NRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Preparar descripción
      const description = cart.length === 1
        ? cart[0].nombre
        : `${cart.length} productos de Neurai.dev`;

      // Crear sesión de pago en el backend
      console.log("🔄 Creando sesión de pago...");

      const response = await fetch("/api/payments/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          description: description,
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          invoice: invoice,
          items: cart.map((item) => ({
            name: item.nombre,
            quantity: item.quantity,
            price: item.precio,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear sesión de pago");
      }

      const { sessionId, test } = await response.json();

      console.log("✅ Sesión creada:", sessionId);
      console.log("Modo de prueba:", test);

      // Configurar checkout de ePayco
      const checkout = window.ePayco.checkout.configure({
        sessionId: sessionId,
        type: "onepage", // Puede ser: onepage, standard, component
        test: test,
      });

      // Definir callbacks
      checkout.onCreated = () => {
        console.log("✅ Transacción creada exitosamente");
        toast.success("¡Pago completado exitosamente!");

        // Limpiar carrito después de pago exitoso
        setTimeout(() => {
          clearCart();
          if (onClose) onClose();
        }, 2000);
      };

      checkout.onErrors = (errors) => {
        console.error("❌ Errores en el pago:", errors);
        toast.error("Hubo un error con el pago. Por favor intenta nuevamente.");
        setLoading(false);
      };

      checkout.onClosed = () => {
        console.log("👋 Checkout cerrado por el usuario");
        setLoading(false);
      };

      // Abrir checkout
      console.log("🚀 Abriendo checkout de ePayco...");
      checkout.open();

    } catch (error) {
      console.error("❌ Error al procesar pago:", error);
      toast.error(error.message || "Error al procesar el pago");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Datos para el pago
      </h3>

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre completo *
          </label>
          <input
            type="text"
            name="name"
            value={customerData.name}
            onChange={handleChange}
            placeholder="Juan Pérez"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Correo electrónico *
          </label>
          <input
            type="email"
            name="email"
            value={customerData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            name="phone"
            value={customerData.phone}
            onChange={handleChange}
            placeholder="3001234567"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Resumen */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
            <span>Total a pagar:</span>
            <span className="text-blue-600 dark:text-blue-400">
              ${getTotalPrice().toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {cart.length} {cart.length === 1 ? "producto" : "productos"}
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
                Pagar con Tarjeta/PSE
              </>
            )}
          </button>
        </div>

        {/* Información de seguridad */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium">Pago 100% seguro</p>
              <p className="mt-1">
                Procesado por ePayco con encriptación SSL. Tu información está
                protegida.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
