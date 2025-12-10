"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import { getProductImage } from "@/lib/constants";

/**
 * Componente de Checkout con Wompi
 * Maneja el flujo completo de pago integrado con el carrito
 */
export default function WompiCheckout({ onClose }) {
  const { cart, getTotalPrice, clearCart } = useCart();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    typeDoc: "CC",
    numberDoc: "",
    address: "",
    city: "",
    region: "",
  });

  // Validar que Wompi esté cargado
  const isWompiLoaded = () => {
    return typeof window !== "undefined" && window.WidgetCheckout;
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

    if (!customerData.numberDoc || customerData.numberDoc.trim().length < 6) {
      toast.error("Por favor ingresa un número de documento válido");
      return false;
    }

    if (!customerData.address || customerData.address.trim().length < 5) {
      toast.error("Por favor ingresa una dirección válida");
      return false;
    }

    if (!customerData.city || customerData.city.trim().length < 3) {
      toast.error("Por favor ingresa tu ciudad");
      return false;
    }

    if (!customerData.region || customerData.region.trim().length < 3) {
      toast.error("Por favor ingresa tu departamento o región");
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

    // Validar que Wompi esté cargado
    if (!isWompiLoaded()) {
      toast.error(
        "El sistema de pagos no está disponible. Por favor recarga la página.",
      );
      return;
    }

    setLoading(true);

    try {
      // Calcular total en centavos (Wompi requiere el monto en centavos)
      const total = getTotalPrice();
      const amountInCents = Math.round(total * 100);

      // Generar referencia única
      const reference = `NRD-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      // Preparar descripción detallada para Wompi
      const description =
        cart.length === 1
          ? `${cart[0].nombre} - Neurai.dev`
          : `Compra de ${cart.length} productos: ${cart.map(item => item.nombre).join(", ").substring(0, 100)}...`;

      // Crear transacción en el backend y obtener la firma de integridad
      const response = await fetch("/api/payments/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          amountInCents: amountInCents,
          description: description,
          reference: reference,
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          customerAddress: customerData.address,
          customerCity: customerData.city,
          customerRegion: customerData.region,
          customerTypeDoc: customerData.typeDoc,
          customerNumberDoc: customerData.numberDoc,
          items: cart.map((item) => ({
            id: item.id,
            name: item.nombre,
            quantity: item.cantidad,
            price: item.precio,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear sesión de pago");
      }

      const { publicKey, integritySignature, redirectUrl } = data;

      // Configurar checkout de Wompi
      const checkout = new window.WidgetCheckout({
        currency: "COP",
        amountInCents: amountInCents,
        reference: reference,
        publicKey: publicKey,
        redirectUrl: redirectUrl || `${window.location.origin}/respuesta-pago`,
        customerData: {
          email: customerData.email,
          fullName: customerData.name,
          phoneNumber: customerData.phone,
          phoneNumberPrefix: "+57",
          legalId: customerData.numberDoc,
          legalIdType: customerData.typeDoc,
        },
        shippingAddress: {
          addressLine1: customerData.address,
          city: customerData.city,
          phoneNumber: customerData.phone,
          region: customerData.region,
          country: "CO",
        },
      });

      // Abrir checkout y manejar respuesta
      checkout.open(function (result) {
        const transaction = result.transaction;

        if (transaction.status === "APPROVED") {
          toast.success("¡Pago completado exitosamente!");
          setTimeout(() => {
            clearCart();
            if (onClose) onClose();
          }, 2000);
        } else if (transaction.status === "DECLINED") {
          toast.error("El pago fue rechazado. Por favor intenta nuevamente.");
          setLoading(false);
        } else if (transaction.status === "PENDING") {
          toast.info("El pago está pendiente de confirmación.");
          setLoading(false);
        } else if (transaction.status === "ERROR") {
          toast.error("Hubo un error procesando el pago.");
          setLoading(false);
        } else {
          // Para cualquier otro estado, mostrar mensaje informativo
          toast.info(`Estado del pago: ${transaction.status}`);
          setLoading(false);
        }
      });
    } catch (error) {
      toast.error(error.message || "Error al procesar el pago");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Datos para el pago
      </h3>

      {/* Vista previa de productos */}
      <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Productos a pagar:
        </h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {cart.map((item, index) => (
            <div key={index} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded p-2">
              {/* Imagen del producto */}
              <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden">
                {(() => {
                  const imageSrc = getProductImage(item);
                  const isDataUri =
                    imageSrc &&
                    typeof imageSrc === "string" &&
                    imageSrc.startsWith("data:");
                  return (
                    <Image
                      src={imageSrc}
                      alt={item.nombre}
                      fill
                      sizes="48px"
                      className="object-cover"
                      unoptimized={isDataUri}
                    />
                  );
                })()}
              </div>
              {/* Info del producto */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {item.nombre}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ${item.precio.toLocaleString()} × {item.cantidad}
                </p>
              </div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                ${(item.precio * item.cantidad).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label
            htmlFor="customer-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Nombre completo *
          </label>
          <input
            id="customer-name"
            type="text"
            name="name"
            value={customerData.name}
            onChange={handleChange}
            placeholder="Ingrese su nombre"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="customer-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Correo electrónico *
          </label>
          <input
            id="customer-email"
            type="email"
            name="email"
            value={customerData.email}
            onChange={handleChange}
            placeholder="Ingrese su correo electrónico"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Teléfono */}
        <div>
          <label
            htmlFor="customer-phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
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

        {/* Tipo de documento */}
        <div>
          <label
            htmlFor="customer-type-doc"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Tipo de documento *
          </label>
          <select
            id="customer-type-doc"
            name="typeDoc"
            value={customerData.typeDoc}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="NIT">NIT</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="PP">Pasaporte</option>
          </select>
        </div>

        {/* Número de documento */}
        <div>
          <label
            htmlFor="customer-number-doc"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Número de documento *
          </label>
          <input
            id="customer-number-doc"
            type="text"
            name="numberDoc"
            value={customerData.numberDoc}
            onChange={handleChange}
            placeholder="Ingrese su número de documento"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Dirección */}
        <div>
          <label
            htmlFor="customer-address"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Dirección *
          </label>
          <input
            id="customer-address"
            type="text"
            name="address"
            value={customerData.address}
            onChange={handleChange}
            placeholder="Ingrese su dirección"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Ciudad */}
        <div>
          <label
            htmlFor="customer-city"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Ciudad *
          </label>
          <input
            id="customer-city"
            type="text"
            name="city"
            value={customerData.city}
            onChange={handleChange}
            placeholder="Ingrese su ciudad"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Departamento/Región */}
        <div>
          <label
            htmlFor="customer-region"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Departamento/Región *
          </label>
          <input
            id="customer-region"
            type="text"
            name="region"
            value={customerData.region}
            onChange={handleChange}
            placeholder="Ej: Putumayo"
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

        {/* Información de Envíos */}
        <div className="mt-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                Política de Envíos
              </h3>

              {/* Envío gratis */}
              <div className="mb-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-md p-3">
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold text-green-800 dark:text-green-200 text-sm">
                    Envío GRATIS
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300 ml-7">
                  Para <strong>Valle de Sibundoy - Alto Putumayo</strong>
                </p>
              </div>

              {/* Otros destinos */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-md p-3">
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-5 h-5 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                    Otros destinos
                  </span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 ml-7">
                  El costo y método de envío se coordinará por WhatsApp después
                  del pago
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
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
                Pagar con Wompi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
