"use client";

import React from "react";
import NequiPaymentBadge, {
  NequiDiscountFloatingBanner,
  PriceComparison,
} from "@/components/NequiPaymentBadge";
import NequiPaymentButton, {
  NequiPaymentButtonCompact,
} from "@/components/NequiPaymentButton";

export default function NequiPaymentDemo() {
  const productoEjemplo = {
    nombre: "Auriculares Bluetooth Premium",
    precio: 89900,
    imagen: "https://via.placeholder.com/400x300",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            💜 Demo: Sistema de Pago con Nequi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vista previa de todos los componentes de pago con Nequi
          </p>
        </div>

        <div className="space-y-8">
          {/* Banner */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Banner de Descuento
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Banner llamativo para mostrar en páginas de productos
            </p>
            <NequiPaymentBadge descuento={5} variant="banner" />
          </section>

          {/* Badge */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Badge Pequeño
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Para mostrar en tarjetas de producto
            </p>
            <NequiPaymentBadge descuento={5} variant="badge" />
          </section>

          {/* Card */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Card Informativa
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Información detallada del beneficio
            </p>
            <NequiPaymentBadge descuento={5} variant="card" />
          </section>

          {/* Price Comparison */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Comparador de Precios
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Muestra la diferencia entre ePayco y Nequi
            </p>
            <PriceComparison precio={productoEjemplo.precio} descuento={5} />
          </section>

          {/* Payment Button */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Botón de Pago Completo
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Botón principal con todo el flujo de pago
            </p>
            <NequiPaymentButton
              producto={productoEjemplo}
              descuento={5}
              numeroNequi="3174503604"
              nombreNegocio="Neurai.dev"
            />
          </section>

          {/* Compact Button */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Botones Compactos (Lado a Lado)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Para usar junto a otros métodos de pago
            </p>
            <div className="flex gap-3">
              <NequiPaymentButtonCompact
                producto={productoEjemplo}
                descuento={5}
                numeroNequi="3174503604"
              />
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200">
                ePayco
              </button>
            </div>
          </section>

          {/* Ejemplo Completo */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Ejemplo Completo - Página de Producto
            </h2>
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
              {/* Banner */}
              <NequiPaymentBadge descuento={5} variant="banner" />

              {/* Producto */}
              <div className="my-6">
                <img
                  src={productoEjemplo.imagen}
                  alt="Producto"
                  className="w-full rounded-lg mb-4"
                />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {productoEjemplo.nombre}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Auriculares premium con cancelación de ruido activa, batería
                  de 20 horas y Bluetooth 5.0
                </p>
              </div>

              {/* Comparador */}
              <PriceComparison precio={productoEjemplo.precio} descuento={5} />

              {/* Botones de pago */}
              <div className="space-y-3 mt-6">
                <NequiPaymentButton
                  producto={productoEjemplo}
                  descuento={5}
                  numeroNequi="3174503604"
                  nombreNegocio="Neurai.dev"
                />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200">
                  Pagar con ePayco - $
                  {productoEjemplo.precio.toLocaleString("es-CO")}
                </button>
              </div>
            </div>
          </section>

          {/* Info */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">
              ℹ️ Información de Implementación
            </h2>
            <p className="mb-4">
              Para usar estos componentes en tu aplicación, lee la
              documentación completa en:
            </p>
            <code className="bg-white/20 px-3 py-1 rounded">
              CONFIGURACION-NEQUI-DESCUENTO.md
            </code>
          </section>
        </div>

        {/* Banner flotante demo */}
        <NequiDiscountFloatingBanner descuento={5} />
      </div>
    </div>
  );
}
