"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { CreditCard, Loader2 } from "lucide-react";

/**
 * Componente de Checkout con ePayco usando API REST
 * Maneja el formulario de datos del cliente y redirige a ePayco
 */
export default function EpaycoCheckout({ onClose }) {
  const { cart, getTotalPrice, clearCart } = useCart();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Datos del cliente
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    docType: "CC",
    address: "",
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validar formulario
  const validateForm = () => {
    if (!customerData.name.trim()) {
      toast.warning("Por favor ingresa tu nombre completo", {
        title: "Campo requerido",
      });
      return false;
    }

    if (!customerData.email.trim() || !customerData.email.includes("@")) {
      toast.warning("Por favor ingresa un email válido", {
        title: "Campo requerido",
      });
      return false;
    }

    if (!customerData.phone.trim() || customerData.phone.length < 10) {
      toast.warning("Por favor ingresa un teléfono válido (10 dígitos)", {
        title: "Campo requerido",
      });
      return false;
    }

    return true;
  };

  // Procesar el pago
  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Crear la sesión de pago en nuestro backend
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          customer: customerData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al crear la orden");
      }

      // Mostrar notificación de éxito
      toast.success("Abriendo pasarela de pago...", {
        title: "Orden Creada",
        duration: 2000,
      });

      // Limpiar el carrito
      clearCart();

      // Cerrar el modal
      onClose();

      // Verificar que el script de ePayco esté cargado
      if (typeof window.ePayco === 'undefined') {
        throw new Error('ePayco SDK no está cargado. Por favor recarga la página.');
      }

      // Configurar y abrir Smart Checkout v2
      const checkout = window.ePayco.checkout.configure({
        sessionId: data.sessionId,
        type: "onepage",
        test: process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === 'true'
      });

      // Eventos del checkout
      checkout.onErrors((error) => {
        console.error("❌ Error en checkout:", error);
        toast.error("Ocurrió un error en el proceso de pago", {
          title: "Error",
          duration: 5000,
        });
      });

      checkout.onClosed(() => {
        setLoading(false);
      });

      // Abrir el checkout
      checkout.open();

    } catch (error) {
      console.error("❌ Error al procesar el pago:", error);
      toast.error(error.message || "Error al procesar el pago", {
        title: "Error en el Pago",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold mb-4">Información de Facturación</h3>

      {/* Formulario de datos del cliente */}
      <div className="space-y-3">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Juan Pérez"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="email@ejemplo.com"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="3001234567"
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="docType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <select
              id="docType"
              name="docType"
              value={customerData.docType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="NIT">NIT</option>
              <option value="TI">Tarjeta de Identidad</option>
            </select>
          </div>

          <div>
            <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Documento
            </label>
            <input
              type="text"
              id="document"
              name="document"
              value={customerData.document}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1234567890"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección (Opcional)
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={customerData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Calle 123 #45-67"
            disabled={loading}
          />
        </div>
      </div>

      {/* Resumen del pago */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total a Pagar:</span>
          <span className="text-blue-600">
            ${getTotalPrice().toLocaleString("es-CO")}
          </span>
        </div>
      </div>

      {/* Botón de pago */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            Pagar con ePayco
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Serás redirigido a la pasarela de pago segura de ePayco
      </p>
    </div>
  );
}
