"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Download,
  Mail,
  ArrowRight,
  Package,
  Calendar,
  MessageCircle,
  Home,
  Share2,
  Star,
} from "lucide-react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailResent, setEmailResent] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Obtener referencia de la orden desde los parámetros de URL
    const reference = searchParams.get("ref");

    if (reference) {
      // Consultar la orden desde la API
      fetch(`/api/orders/get-by-reference?reference=${reference}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.order) {
            setOrderData(data.order);
          }
        })
        .catch((error) => console.error("Error cargando orden:", error))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // Función para descargar factura
  const handleDownloadInvoice = async () => {
    if (!orderData?.numero_orden) {
      alert("No se encontró información de la orden");
      return;
    }

    setDownloading(true);
    try {
      // Abrir la página de factura en una nueva pestaña
      window.open(`/factura/${orderData.numero_orden}`, '_blank');
    } catch (error) {
      console.error("Error descargando factura:", error);
      alert("Error al descargar la factura. Por favor, intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  };

  // Función para reenviar confirmación
  const handleResendConfirmation = async () => {
    if (!orderData?.correo_cliente && !orderData?.customer_email) {
      alert("No se encontró el correo electrónico");
      return;
    }

    setResendingEmail(true);
    try {
      const response = await fetch('/api/orders/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: orderData.numero_orden
        })
      });

      if (response.ok) {
        setEmailResent(true);
        setTimeout(() => setEmailResent(false), 3000);
      } else {
        alert("Error al reenviar el correo. Por favor, intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error reenviando confirmación:", error);
      alert("Error al reenviar el correo. Por favor, intenta de nuevo.");
    } finally {
      setResendingEmail(false);
    }
  };

  // Función para compartir
  const handleShare = async () => {
    const shareData = {
      title: '¡Acabo de comprar en Neurai.dev!',
      text: 'Encontré productos increíbles en Neurai.dev. ¡Échale un vistazo!',
      url: 'https://neurai.dev'
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(shareData.url);
        alert('¡Enlace copiado al portapapeles!');
      }
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  // Función para ir a reseñas
  const handleReview = () => {
    // Redirigir a la página de contacto o formulario de reseñas
    window.location.href = `https://wa.me/573174503604?text=Hola,%20me%20gustaría%20dejar%20una%20reseña%20sobre%20mi%20compra%20${orderData?.numero_orden || ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  const orderNumber = orderData?.numero_orden || "SIN-ORDEN";
  const currentDate = orderData?.created_at
    ? new Date(orderData.created_at).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

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
              Gracias por confiar en Neurai.dev
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
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={downloading || !orderData}
                    className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {downloading ? "Descargando..." : "Descargar Factura"}
                  </button>

                  <button
                    onClick={handleResendConfirmation}
                    disabled={resendingEmail || !orderData || emailResent}
                    className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {emailResent ? "✓ Enviado" : resendingEmail ? "Enviando..." : "Reenviar Confirmación"}
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
              <a
                href="https://wa.me/573174503604?text=Hola,%20tengo%20una%20pregunta%20sobre%20mi%20pedido"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contactar por WhatsApp
              </a>
            </div>

            {/* Continuar comprando */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">¡Sigue explorando!</h3>
              <p className="text-blue-100 text-sm mb-4">
                Descubre más productos que podrían interesarte.
              </p>
              <Link
                href="/"
                className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Continuar Comprando
              </Link>
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
                <button
                  onClick={handleReview}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Star className="w-4 h-4" />
                  Reseña
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Share2 className="w-4 h-4" />
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
            © 2025 Neurai.dev. Todos los derechos reservados.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Tienda Online de Tecnología y Servicios Profesionales
          </p>
        </div>
      </footer>
    </div>
  );
}

// Componente wrapper con Suspense
export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
