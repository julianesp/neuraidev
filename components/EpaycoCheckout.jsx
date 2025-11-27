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
            id: item.id, // IMPORTANTE: Incluir el ID del producto
            name: item.nombre,
            quantity: item.quantity,
            price: item.precio,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear sesión de pago");
      }

      const { sessionId, test } = data;

      // Configurar checkout de ePayco
      const checkout = window.ePayco.checkout.configure({
        sessionId: sessionId,
        type: "onepage", // Puede ser: onepage, standard, component
        test: test,
      });

      // Definir callbacks
      checkout.onCreated = () => {
        toast.success("¡Pago completado exitosamente!");

        // Limpiar carrito después de pago exitoso
        setTimeout(() => {
          clearCart();
          if (onClose) onClose();
        }, 2000);
      };

      checkout.onErrors = () => {
        toast.error("Hubo un error con el pago. Por favor intenta nuevamente.");
        setLoading(false);
      };

      checkout.onClosed = () => {
        setLoading(false);
      };

      // Abrir checkout
      checkout.open();

    } catch (error) {
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
          <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre completo *
          </label>
          <input
            id="customer-name"
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
          <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Correo electrónico *
          </label>
          <input
            id="customer-email"
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
          <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Teléfono *
          </label>
          <input
            id="customer-phone"
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

        {/* Aviso temporal - Sistema de pagos en mantenimiento */}
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-bold text-yellow-800 dark:text-yellow-200 text-sm">
                Sistema de pagos temporalmente deshabilitado
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                Estamos realizando ajustes en nuestro sistema de pagos para mejorar tu experiencia.
                Por favor, contáctanos por WhatsApp para procesar tu pedido manualmente.
              </p>
              <div className="mt-3">
                <a
                  href="https://wa.me/573001234567?text=Hola,%20quiero%20realizar%20un%20pedido"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Botones - DESHABILITADOS TEMPORALMENTE */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          {/* BOTÓN DE PAGO TEMPORALMENTE DESHABILITADO
          <button
            onClick={handlePayment}
            disabled={true}
            className="flex-1 bg-gray-400 text-gray-600 font-bold py-3 px-4 rounded-lg cursor-not-allowed opacity-50 flex items-center justify-center gap-2"
            title="Sistema de pagos temporalmente deshabilitado"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
            </svg>
            Pagar con Tarjeta/PSE
          </button>
          */}
        </div>
      </div>
    </div>
  );
}
