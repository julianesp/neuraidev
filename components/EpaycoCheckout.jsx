"use client";

import { useState, useEffect } from "react";
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
    typeDoc: "CC",
    numberDoc: "",
    address: "",
    city: "",
    region: "",
  });

  // Cargar datos guardados del usuario al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('neuraidev_customer_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setCustomerData(prev => ({
            ...prev,
            ...parsed,
          }));
        } catch (error) {
          console.error('Error al cargar datos del cliente:', error);
        }
      }
    }
  }, []);

  // Guardar datos del cliente cuando cambien
  const saveCustomerData = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('neuraidev_customer_data', JSON.stringify(customerData));
      } catch (error) {
        console.error('Error al guardar datos del cliente:', error);
      }
    }
  };

  // Cargar script de ePayco dinámicamente
  const loadEpaycoScript = () => {
    return new Promise((resolve, reject) => {
      console.log('[ePayco] Verificando disponibilidad...');

      // Si ya está cargado, resolver inmediatamente
      if (typeof window !== "undefined" && window.ePayco && window.ePayco.checkout) {
        console.log('[ePayco] Ya está disponible y funcional');
        resolve(true);
        return;
      }

      // Remover cualquier script existente que pueda estar corrupto
      const existingScripts = document.querySelectorAll('script[src*="checkout.epayco.co"]');
      existingScripts.forEach(script => {
        console.log('[ePayco] Removiendo script existente...');
        script.remove();
      });

      // Limpiar window.ePayco si existe pero no es funcional
      if (window.ePayco && !window.ePayco.checkout) {
        console.log('[ePayco] Limpiando ventana de ePayco corrupta...');
        delete window.ePayco;
      }

      // Cargar el script dinámicamente
      console.log('[ePayco] Cargando script fresco...');
      const script = document.createElement('script');
      script.src = 'https://checkout.epayco.co/checkout.js';
      script.async = false; // Cambiado a false para carga sincrónica

      script.onload = () => {
        console.log('[ePayco] Script descargado, esperando inicialización...');
        // Esperar a que ePayco esté disponible
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          console.log(`[ePayco] Verificando inicialización... Intento ${attempts}/100`);

          if (window.ePayco && window.ePayco.checkout) {
            console.log('[ePayco] ✅ Inicializado correctamente!');
            clearInterval(checkInterval);
            resolve(true);
          } else if (attempts > 100) { // 10 segundos
            console.error('[ePayco] ❌ Timeout: No se inicializó en 10 segundos');
            clearInterval(checkInterval);
            reject(new Error("El script de ePayco no se inicializó correctamente. Por favor, verifica tu conexión a internet y recarga la página."));
          }
        }, 100);
      };

      script.onerror = (error) => {
        console.error('[ePayco] ❌ Error descargando script:', error);
        reject(new Error("No se pudo descargar el script de ePayco. Verifica tu conexión a internet."));
      };

      document.head.appendChild(script);
      console.log('[ePayco] Script agregado al DOM');
    });
  };

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
    const missingFields = [];

    if (!customerData.name || customerData.name.trim().length < 3) {
      missingFields.push("Nombre completo");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerData.email || !emailRegex.test(customerData.email)) {
      missingFields.push("Correo electrónico válido");
    }

    if (!customerData.phone || customerData.phone.length < 7) {
      missingFields.push("Teléfono");
    }

    if (!customerData.address || customerData.address.trim().length < 5) {
      missingFields.push("Dirección");
    }

    if (!customerData.city || customerData.city.trim().length < 3) {
      missingFields.push("Ciudad");
    }

    if (!customerData.region || customerData.region.trim().length < 3) {
      missingFields.push("Departamento/Región");
    }

    if (!customerData.numberDoc || customerData.numberDoc.trim().length < 6) {
      missingFields.push("Número de documento");
    }

    if (missingFields.length > 0) {
      toast.warning(
        `Faltan los siguientes campos obligatorios: ${missingFields.join(", ")}`,
        {
          title: "Completa el formulario",
          duration: 5000,
        }
      );
      return false;
    }

    return true;
  };

  // Procesar pago con ePayco
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

    setLoading(true);

    try {
      // Cargar script de ePayco si no está disponible
      if (!isEpaycoLoaded()) {
        console.log('[Checkout] ePayco no disponible, intentando cargar...');
        toast.info("Cargando sistema de pagos, por favor espera...", {
          duration: 3000,
        });
        await loadEpaycoScript();
        console.log('[Checkout] Script de ePayco cargado exitosamente');
      } else {
        console.log('[Checkout] ePayco ya está disponible');
      }
    } catch (scriptError) {
      console.error("[Checkout] Error cargando script de ePayco:", scriptError);
      toast.error(
        scriptError.message || "No se pudo cargar el sistema de pagos. Por favor recarga la página e intenta de nuevo.",
        {
          title: "Error de carga",
          duration: 7000,
        }
      );
      setLoading(false);
      return;
    }

    try {
      // Calcular total
      const total = getTotalPrice();

      // Generar referencia única
      const reference = `NRD-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      // Preparar descripción
      const description =
        cart.length === 1
          ? cart[0].nombre
          : `${cart.length} productos de Neurai.dev`;

      // Crear transacción en el backend y obtener configuración
      const response = await fetch("/api/payments/epayco/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
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

      const { config } = data;

      console.log('[Checkout] Configuración recibida:', config);

      // Guardar datos del cliente para futuros usos
      saveCustomerData();

      // Verificar una vez más que ePayco esté disponible
      if (!window.ePayco || !window.ePayco.checkout) {
        throw new Error("ePayco no está disponible en este momento");
      }

      console.log('[Checkout] Configurando checkout de ePayco...');

      // Crear handler de ePayco
      const handler = window.ePayco.checkout.configure(config);

      console.log('[Checkout] Abriendo checkout...');

      // Abrir checkout
      handler.open();

      console.log('[Checkout] Checkout abierto exitosamente');

      // Limpiar carrito y redirigir después de un delay
      // (ePayco manejará la redirección automáticamente según su configuración)
      setTimeout(() => {
        clearCart();
        setLoading(false);
      }, 2000);

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

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label
            htmlFor="epayco-customer-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Nombre completo *
          </label>
          <input
            id="epayco-customer-name"
            type="text"
            name="name"
            value={customerData.name}
            onChange={handleChange}
            placeholder="Ingrese su nombre"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="epayco-customer-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Correo electrónico *
          </label>
          <input
            id="epayco-customer-email"
            type="email"
            name="email"
            value={customerData.email}
            onChange={handleChange}
            placeholder="Ingrese su correo electrónico"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label
            htmlFor="epayco-customer-phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Teléfono *
          </label>
          <input
            id="epayco-customer-phone"
            type="tel"
            name="phone"
            value={customerData.phone}
            onChange={handleChange}
            placeholder="3001234567"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Tipo de documento */}
        <div>
          <label
            htmlFor="epayco-customer-type-doc"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Tipo de documento *
          </label>
          <select
            id="epayco-customer-type-doc"
            name="typeDoc"
            value={customerData.typeDoc}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
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
            htmlFor="epayco-customer-number-doc"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Número de documento *
          </label>
          <input
            id="epayco-customer-number-doc"
            type="text"
            name="numberDoc"
            value={customerData.numberDoc}
            onChange={handleChange}
            placeholder="Ingrese su número de documento"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Dirección */}
        <div>
          <label
            htmlFor="epayco-customer-address"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Dirección *
          </label>
          <input
            id="epayco-customer-address"
            type="text"
            name="address"
            value={customerData.address}
            onChange={handleChange}
            placeholder="Ingrese su dirección"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label
            htmlFor="epayco-customer-city"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Ciudad *
          </label>
          <input
            id="epayco-customer-city"
            type="text"
            name="city"
            value={customerData.city}
            onChange={handleChange}
            placeholder="Ingrese su ciudad"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Departamento/Región */}
        <div>
          <label
            htmlFor="epayco-customer-region"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Departamento/Región *
          </label>
          <input
            id="epayco-customer-region"
            type="text"
            name="region"
            value={customerData.region}
            onChange={handleChange}
            placeholder="Ej: Putumayo"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Resumen */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
            <span>Total a pagar:</span>
            <span className="text-green-600 dark:text-green-400">
              ${getTotalPrice().toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {cart.length} {cart.length === 1 ? "producto" : "productos"}
          </p>
        </div>

        {/* Información de Envíos */}
        <div className="mt-4 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
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
              <h3 className="font-bold text-green-900 dark:text-green-100 text-sm mb-2 flex items-center gap-2">
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
                    {getTotalPrice() >= 50000 ? "✓ Envío GRATIS" : "Envío gratis desde $50.000"}
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300 ml-7">
                  Para <strong>Valle de Sibundoy - Alto Putumayo</strong> en compras desde <strong>$50.000</strong>
                </p>
                {getTotalPrice() >= 50000 ? (
                  <p className="text-xs text-green-600 dark:text-green-400 ml-7 mt-1 font-medium">
                    ¡Tu compra califica para envío gratis!
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 ml-7 mt-1">
                    Te faltan ${(50000 - getTotalPrice()).toLocaleString("es-CO")} para envío gratis
                  </p>
                )}
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
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                Pagar con ePayco
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
