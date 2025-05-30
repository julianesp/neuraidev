"use client";
import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Download,
  Mail,
  ArrowRight,
  Package,
  Calendar,
} from "lucide-react";

export default function ThankYouPage() {
  const [orderNumber] = useState(
    () => "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
  );
  const [currentDate] = useState(() =>
    new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header animado */}
      <div className="relative overflow-hidden bg-white shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-5"></div>
        <div className="relative px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-green-100 rounded-full animate-pulse">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ¡Compra Exitosa!
            </h1>
            <p className="text-xl text-gray-600">
              Gracias por tu confianza en nosotros
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Tarjeta principal de confirmación */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Orden Confirmada
                  </h2>
                  <p className="text-gray-600">
                    Tu pedido ha sido procesado exitosamente y pronto recibirás
                    un email de confirmación.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Número de orden</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">
                    {orderNumber}
                  </p>
                </div>
              </div>

              {/* Detalles del pedido */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha de compra</p>
                      <p className="font-medium text-gray-900">{currentDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Entrega estimada</p>
                      <p className="font-medium text-gray-900">
                        3-5 días hábiles
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Factura
                  </button>

                  <button className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium">
                    <Mail className="w-4 h-4 mr-2" />
                    Reenviar Confirmación
                  </button>
                </div>
              </div>
            </div>

            {/* Próximos pasos */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ¿Qué sigue ahora?
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      1
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Confirmación por email
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Recibirás un email con todos los detalles de tu compra en
                      los próximos minutos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Preparación del pedido
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Nuestro equipo comenzará a preparar tu pedido
                      inmediatamente.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      3
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Seguimiento de envío
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Te enviaremos el código de seguimiento cuando tu pedido
                      sea despachado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar con acciones adicionales */}
          <div className="space-y-6">
            {/* Soporte */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Nuestro equipo de soporte está aquí para ayudarte con cualquier
                pregunta.
              </p>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium">
                Contactar Soporte
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Continuar comprando */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">¡Sigue explorando!</h3>
              <p className="text-blue-100 text-sm mb-4">
                Descubre más productos que podrían interesarte.
              </p>
              <button className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium">
                Continuar Comprando
              </button>
            </div>

            {/* Compartir */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Comparte tu experiencia
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Ayuda a otros compradores compartiendo tu opinión.
              </p>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                  Reseña
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium">
                  Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer simple */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Tu Empresa. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
