"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PedidoConfirmadoContent() {
  const searchParams = useSearchParams();
  const numero = searchParams.get('numero');
  const estado = searchParams.get('estado');
  const mensaje = searchParams.get('mensaje');

  useEffect(() => {
    document.title = 'Pedido Confirmado | Neurai.dev';
  }, []);

  // Determinar el mensaje basado en el estado del pago
  const getPaymentStatusInfo = () => {
    if (!estado) {
      return {
        type: 'success',
        title: '¡Pedido confirmado!',
        message: 'Tu pedido ha sido procesado exitosamente'
      };
    }

    // Estados de ePayco
    switch (estado) {
      case '1': // Aceptada
        return {
          type: 'success',
          title: '¡Pago exitoso!',
          message: 'Tu pago ha sido procesado correctamente'
        };
      case '2': // Rechazada
      case '4': // Fallida
        return {
          type: 'error',
          title: 'Pago rechazado',
          message: 'Tu pago no pudo ser procesado. Puedes intentar con otro método de pago.'
        };
      case '3': // Pendiente
      case '8': // Iniciada
        return {
          type: 'warning',
          title: 'Pago pendiente',
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.'
        };
      default:
        return {
          type: 'info',
          title: 'Pedido creado',
          message: 'Tu pedido ha sido registrado correctamente'
        };
    }
  };

  const statusInfo = getPaymentStatusInfo();

  if (!numero) {
    return (
      <main className="min-h-screen py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido no encontrado</h1>
            <p className="text-gray-600 mb-6">
              No se pudo encontrar la información del pedido.
            </p>
            <Link
              href="/carrito"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          {/* Ícono dinámico basado en el estado */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            statusInfo.type === 'success' ? 'bg-green-100' :
            statusInfo.type === 'error' ? 'bg-red-100' :
            statusInfo.type === 'warning' ? 'bg-yellow-100' :
            'bg-blue-100'
          }`}>
            {statusInfo.type === 'success' && (
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {statusInfo.type === 'error' && (
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {statusInfo.type === 'warning' && (
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {statusInfo.type === 'info' && (
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* Mensaje principal */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {statusInfo.title}
          </h1>

          <p className="text-lg text-gray-600 mb-2">
            {statusInfo.message}
          </p>

          {mensaje && (
            <p className="text-sm text-gray-500 mb-4">
              Detalle: {decodeURIComponent(mensaje)}
            </p>
          )}

          <p className="text-gray-600 mb-8">
            Número de pedido: <span className="font-mono font-bold text-gray-900">{numero}</span>
          </p>

          {/* Información del proceso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-blue-900 mb-3">¿Qué sigue ahora?</h2>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-blue-200 text-blue-800 rounded-full text-center text-sm font-bold mr-3 mt-0.5">1</span>
                <span>Recibirás un email de confirmación con los detalles de tu pedido</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-blue-200 text-blue-800 rounded-full text-center text-sm font-bold mr-3 mt-0.5">2</span>
                <span>Nos contactaremos contigo para coordinar la entrega</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 bg-blue-200 text-blue-800 rounded-full text-center text-sm font-bold mr-3 mt-0.5">3</span>
                <span>Tu pedido será preparado y enviado según el método seleccionado</span>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">¿Necesitas ayuda?</h3>
            <p className="text-gray-600 text-sm mb-2">
              Si tienes alguna pregunta sobre tu pedido, puedes contactarnos:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>📧 Email: contacto@neurai.dev</li>
              <li>📱 WhatsApp: +57 300 123 4567</li>
              <li>🔍 Referencia: {numero}</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/accesorios"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Seguir comprando
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Volver al inicio
            </Link>
          </div>

          {/* Nota final */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Gracias por elegir Neurai.dev. Tu satisfacción es nuestra prioridad.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cargando información del pedido...</h1>
          <p className="text-gray-600">
            Por favor espera mientras verificamos los detalles de tu pedido.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PedidoConfirmadoContent />
    </Suspense>
  );
}