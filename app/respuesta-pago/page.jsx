"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Componente interno que usa useSearchParams
 */
function RespuestaPagoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener parámetros de la URL enviados por ePayco
    const refPayco = searchParams.get("ref_payco") || searchParams.get("x_ref_payco");
    const transactionId = searchParams.get("x_transaction_id");
    const amount = searchParams.get("x_amount");
    const currency = searchParams.get("x_currency_code");
    const signature = searchParams.get("x_signature");
    const approvalCode = searchParams.get("x_approval_code");
    const transactionState = searchParams.get("x_transaction_state");
    const response = searchParams.get("x_response");
    const responseText = searchParams.get("x_response_reason_text");

    // Códigos de estado de ePayco:
    // 1 o "Aceptada" = Transacción aprobada
    // 2 o "Rechazada" = Transacción rechazada
    // 3 o "Pendiente" = Transacción pendiente
    // 4 o "Fallida" = Transacción fallida

    const data = {
      refPayco,
      transactionId,
      amount,
      currency,
      signature,
      approvalCode,
      transactionState,
      response,
      responseText,
    };

    // Log solo en desarrollo
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("[DEV] Datos de respuesta de ePayco recibidos");
    }

    setPaymentData(data);
    setLoading(false);
  }, [searchParams]);

  // Determinar el estado del pago
  const getPaymentStatus = () => {
    if (!paymentData) return null;

    const state = paymentData.transactionState;

    if (state === "Aceptada" || state === "1") {
      return {
        type: "success",
        icon: "✅",
        title: "¡Pago exitoso!",
        message: "Tu transacción ha sido procesada correctamente.",
        color: "green",
      };
    } else if (state === "Rechazada" || state === "2") {
      return {
        type: "error",
        icon: "❌",
        title: "Pago rechazado",
        message: paymentData.responseText || "La transacción fue rechazada.",
        color: "red",
      };
    } else if (state === "Pendiente" || state === "3") {
      return {
        type: "warning",
        icon: "⏳",
        title: "Pago pendiente",
        message: "Tu pago está en proceso de verificación. Te notificaremos cuando se confirme.",
        color: "yellow",
      };
    } else {
      return {
        type: "error",
        icon: "⚠️",
        title: "Pago fallido",
        message: "Hubo un error al procesar tu pago.",
        color: "red",
      };
    }
  };

  const status = getPaymentStatus();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Procesando respuesta...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No se recibió información de pago.</p>
          <Link
            href="/"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Icono y título */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{status.icon}</div>
          <h1
            className={`text-3xl font-bold mb-2 ${
              status.color === "green"
                ? "text-green-600 dark:text-green-400"
                : status.color === "red"
                ? "text-red-600 dark:text-red-400"
                : "text-yellow-600 dark:text-yellow-400"
            }`}
          >
            {status.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{status.message}</p>
        </div>

        {/* Detalles de la transacción */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Detalles de la transacción
          </h2>
          <div className="space-y-3">
            {paymentData.refPayco && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Referencia:</span>
                <span className="font-mono text-sm text-gray-900 dark:text-white">
                  {paymentData.refPayco}
                </span>
              </div>
            )}
            {paymentData.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">ID de transacción:</span>
                <span className="font-mono text-sm text-gray-900 dark:text-white">
                  {paymentData.transactionId}
                </span>
              </div>
            )}
            {paymentData.amount && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  ${parseFloat(paymentData.amount).toFixed(2)} {paymentData.currency || "COP"}
                </span>
              </div>
            )}
            {paymentData.approvalCode && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Código de aprobación:</span>
                <span className="font-mono text-sm text-gray-900 dark:text-white">
                  {paymentData.approvalCode}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4">
          {status.type === "success" && (
            <>
              <Link
                href="/"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center"
              >
                Volver al inicio
              </Link>
              <Link
                href="/accesorios"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors text-center"
              >
                Seguir comprando
              </Link>
            </>
          )}

          {status.type === "error" && (
            <>
              <button
                onClick={() => router.back()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Reintentar pago
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors text-center"
              >
                Volver al inicio
              </Link>
            </>
          )}

          {status.type === "warning" && (
            <Link
              href="/"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center"
            >
              Volver al inicio
            </Link>
          )}
        </div>

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              {status.type === "success" && (
                <p>
                  Recibirás un correo electrónico con los detalles de tu compra. Si tienes
                  alguna pregunta, no dudes en contactarnos.
                </p>
              )}
              {status.type === "error" && (
                <p>
                  Si crees que esto es un error, por favor contacta con nosotros a través de
                  WhatsApp o correo electrónico.
                </p>
              )}
              {status.type === "warning" && (
                <p>
                  Los pagos pendientes pueden tardar hasta 24 horas en confirmarse. Te
                  notificaremos por correo cuando se confirme.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de loading para el Suspense
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}

/**
 * Página de respuesta después del pago con ePayco
 * URL: /respuesta-pago
 *
 * ePayco redirige aquí con parámetros en la URL después del pago
 */
export default function RespuestaPago() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RespuestaPagoContent />
    </Suspense>
  );
}
