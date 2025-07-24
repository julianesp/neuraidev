"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUserAuth } from "../../../hooks/useUserAuth";

function BusinessPaymentContent() {
  const { isAuthenticated, user } = useUserAuth();
  const searchParams = useSearchParams();
  const [business, setBusiness] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const businessId = searchParams.get("businessId");
  const planId = searchParams.get("planId");

  useEffect(() => {
    if (businessId && planId) {
      fetchBusinessAndPlan();
    }
  }, [businessId, planId, fetchBusinessAndPlan]);

  const fetchBusinessAndPlan = useCallback(async () => {
    try {
      const token = localStorage.getItem("userToken");
      
      // Obtener información del negocio
      const businessResponse = await fetch(`/api/business/${businessId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      // Obtener información del plan
      const planResponse = await fetch(`/api/subscription-plans/${planId}`);
      
      if (businessResponse.ok && planResponse.ok) {
        const businessData = await businessResponse.json();
        const planData = await planResponse.json();
        
        setBusiness(businessData);
        setPlan(planData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [businessId, planId]);

  const handlePayment = async () => {
    setPaymentLoading(true);
    
    try {
      const token = localStorage.getItem("userToken");
      
      // Crear orden de pago en tu backend
      const response = await fetch("/api/business/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          businessId: businessId,
          planId: planId,
          amount: plan.price,
          currency: plan.currency || "COP"
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Configurar Epayco Checkout
        const handler = window.ePayco.checkout.configure({
          key: process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY || "491d6a0b6e992cf924edd8d3d088aff1", // Tu clave pública
          test: true // Cambiar a false en producción
        });

        const paymentData = {
          // Información del negocio (tu negocio)
          name: "NeuraIDev - Suscripción de Negocio",
          description: `Suscripción ${plan.name} para ${business.business_name}`,
          invoice: data.invoiceId,
          currency: plan.currency || "cop",
          amount: plan.price,
          tax_base: "0",
          tax: "0",
          country: "co",
          lang: "es",

          // Información del cliente
          external: "false",
          name_billing: user.username,
          address_billing: business.address || "No especificada",
          type_doc_billing: "cc",
          mobilephone_billing: business.phone || "",
          number_doc_billing: "12345678", // Deberías solicitar este dato

          // URLs de respuesta
          response: `${window.location.origin}/business/payment/response`,
          confirmation: `${window.location.origin}/api/business/payment-confirmation`,

          // Método de pago
          methodsDisable: ["EFECTY", "BALOTO", "PSE"] // Opcional: deshabilitar métodos
        };

        handler.open(paymentData);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar el pago");
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    // Cargar el script de Epayco
    const script = document.createElement("script");
    script.src = "https://checkout.epayco.co/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando información de pago...</p>
        </div>
      </div>
    );
  }

  if (!business || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error al cargar información
          </h1>
          <p className="text-gray-600">
            No se pudo cargar la información del negocio o plan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Completar Suscripción
            </h1>
            <p className="text-gray-600">
              Activa tu plan para comenzar a vender
            </p>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de la Compra
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Negocio:</span>
                <span className="font-medium">{business.business_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium">{plan.duration_days} días</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    ${new Intl.NumberFormat('es-CO').format(plan.price)} {plan.currency || 'COP'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Características del Plan */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Qué incluye tu plan:
            </h3>
            <ul className="space-y-2">
              {JSON.parse(plan.features || '[]').map((feature, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Trial Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Información importante:</strong> Tu trial de 14 días ya está activo. 
                  Este pago activará automáticamente tu suscripción cuando termine el período de prueba.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="text-center">
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {paymentLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </div>
              ) : (
                <>
                  💳 Pagar con ePayco
                  <div className="text-sm font-normal mt-1">
                    Tarjetas, PSE, Efecty y más
                  </div>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Pago seguro procesado por ePayco. Tus datos están protegidos.
            </p>
          </div>

          {/* Skip Payment Option */}
          <div className="text-center mt-6">
            <button
              onClick={() => window.location.href = '/business/dashboard'}
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              Continuar solo con el trial por ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BusinessPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <BusinessPaymentContent />
    </Suspense>
  );
}