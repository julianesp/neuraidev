"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentResponseContent() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener parámetros de respuesta de ePayco
    const ref_payco = searchParams.get('ref_payco');
    const response = searchParams.get('x_response');
    const transaction_id = searchParams.get('x_transaction_id');
    const amount = searchParams.get('x_amount');
    const invoice = searchParams.get('x_id_invoice');

    console.warn('Respuesta de pago:', {
      ref_payco,
      response,
      transaction_id,
      amount,
      invoice
    });

    // Determinar el estado del pago
    if (response === 'Aceptada' || response === '1') {
      setPaymentStatus('success');
    } else if (response === 'Rechazada' || response === '2') {
      setPaymentStatus('failed');
    } else if (response === 'Pendiente' || response === '3') {
      setPaymentStatus('pending');
    } else {
      setPaymentStatus('unknown');
    }

    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Procesando respuesta del pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          
          {paymentStatus === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Pago Exitoso! 🎉
              </h1>
              <p className="text-gray-600 mb-6">
                Tu suscripción ha sido activada correctamente. Comenzará automáticamente cuando termine tu período de prueba.
              </p>
              <div className="space-y-3">
                <Link 
                  href="/business/dashboard"
                  className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Ir al Dashboard
                </Link>
                <Link 
                  href="/businesses"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Ver Negocios
                </Link>
              </div>
            </>
          )}

          {paymentStatus === 'failed' && (
            <>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Pago Rechazado ❌
              </h1>
              <p className="text-gray-600 mb-6">
                Tu pago no pudo ser procesado. No te preocupes, tu trial de 14 días sigue activo.
              </p>
              <div className="space-y-3">
                <Link 
                  href={`/business/payment?businessId=${searchParams.get('x_extra1')}&planId=${searchParams.get('x_extra2')}`}
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Intentar de Nuevo
                </Link>
                <Link 
                  href="/business/dashboard"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Continuar con Trial
                </Link>
              </div>
            </>
          )}

          {paymentStatus === 'pending' && (
            <>
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Pago Pendiente ⏳
              </h1>
              <p className="text-gray-600 mb-6">
                Tu pago está siendo procesado. Te notificaremos cuando se complete.
              </p>
              <div className="space-y-3">
                <Link 
                  href="/business/dashboard"
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Ir al Dashboard
                </Link>
              </div>
            </>
          )}

          {paymentStatus === 'unknown' && (
            <>
              <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Estado Desconocido
              </h1>
              <p className="text-gray-600 mb-6">
                No pudimos determinar el estado de tu pago. Por favor, contacta soporte.
              </p>
              <div className="space-y-3">
                <Link 
                  href="/business/dashboard"
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Ir al Dashboard
                </Link>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              ID de Transacción: {searchParams.get('x_transaction_id') || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResponsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando respuesta del pago...</p>
        </div>
      </div>
    }>
      <PaymentResponseContent />
    </Suspense>
  );
}