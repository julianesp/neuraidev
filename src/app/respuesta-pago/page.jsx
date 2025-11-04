"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

function PaymentResponseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener parámetros de la URL enviados por ePayco
    const ref_payco = searchParams.get("ref_payco");
    const x_transaction_id = searchParams.get("x_transaction_id");
    const x_amount = searchParams.get("x_amount");
    const x_currency_code = searchParams.get("x_currency_code");
    const x_approval_code = searchParams.get("x_approval_code");
    const x_response = searchParams.get("x_response");
    const x_response_reason_text = searchParams.get("x_response_reason_text");
    const x_cod_transaction_state = searchParams.get("x_cod_transaction_state");
    const x_transaction_state = searchParams.get("x_transaction_state");
    const x_invoice = searchParams.get("x_extra3");

    setPaymentInfo({
      ref_payco,
      transaction_id: x_transaction_id,
      amount: x_amount,
      currency: x_currency_code,
      approval_code: x_approval_code,
      response: x_response,
      response_reason: x_response_reason_text,
      transaction_code: x_cod_transaction_state,
      transaction_state: x_transaction_state,
      invoice: x_invoice,
    });

    setLoading(false);
  }, [searchParams]);

  const getStatusInfo = () => {
    if (!paymentInfo || !paymentInfo.transaction_code) {
      return {
        icon: <AlertCircle size={64} className="text-gray-400" />,
        title: "Información no disponible",
        message: "No se encontró información sobre el pago",
        color: "gray",
      };
    }

    // Códigos de estado de ePayco:
    // 1 = Aceptada
    // 2 = Rechazada
    // 3 = Pendiente
    // 4 = Fallida
    switch (paymentInfo.transaction_code) {
      case "1":
        return {
          icon: <CheckCircle size={64} className="text-green-500" />,
          title: "¡Pago Exitoso!",
          message: "Tu pago ha sido procesado correctamente",
          color: "green",
        };
      case "2":
        return {
          icon: <XCircle size={64} className="text-red-500" />,
          title: "Pago Rechazado",
          message:
            paymentInfo.response_reason ||
            "Tu pago fue rechazado. Por favor intenta nuevamente.",
          color: "red",
        };
      case "3":
        return {
          icon: <Clock size={64} className="text-yellow-500" />,
          title: "Pago Pendiente",
          message: "Tu pago está siendo procesado. Te notificaremos cuando se complete.",
          color: "yellow",
        };
      case "4":
        return {
          icon: <XCircle size={64} className="text-red-500" />,
          title: "Pago Fallido",
          message:
            paymentInfo.response_reason ||
            "Hubo un error al procesar tu pago. Por favor intenta nuevamente.",
          color: "red",
        };
      default:
        return {
          icon: <AlertCircle size={64} className="text-gray-400" />,
          title: "Estado Desconocido",
          message: "No pudimos determinar el estado de tu pago",
          color: "gray",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando información del pago...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Icono de estado */}
        <div className="flex justify-center mb-6">{statusInfo.icon}</div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-center mb-4">
          {statusInfo.title}
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 text-center mb-6">{statusInfo.message}</p>

        {/* Información del pago */}
        {paymentInfo && paymentInfo.transaction_id && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            {paymentInfo.invoice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Número de Orden:</span>
                <span className="font-medium">{paymentInfo.invoice}</span>
              </div>
            )}
            {paymentInfo.transaction_id && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ID de Transacción:</span>
                <span className="font-medium text-xs">
                  {paymentInfo.transaction_id}
                </span>
              </div>
            )}
            {paymentInfo.amount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monto:</span>
                <span className="font-medium">
                  ${parseFloat(paymentInfo.amount).toLocaleString("es-CO")}{" "}
                  {paymentInfo.currency || "COP"}
                </span>
              </div>
            )}
            {paymentInfo.approval_code && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Código de Aprobación:</span>
                <span className="font-medium">{paymentInfo.approval_code}</span>
              </div>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Volver al Inicio
          </Link>

          {paymentInfo &&
            (paymentInfo.transaction_code === "2" ||
              paymentInfo.transaction_code === "4") && (
              <button
                onClick={() => router.back()}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Intentar Nuevamente
              </button>
            )}
        </div>

        {/* Información de ayuda */}
        {paymentInfo && paymentInfo.transaction_code === "3" && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Los pagos pendientes pueden tardar hasta
              24 horas en procesarse. Recibirás un email de confirmación cuando
              se complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentResponsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <PaymentResponseContent />
    </Suspense>
  );
}
