'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/**
 * Página que redirige automáticamente a ePayco mediante formulario POST
 */
export default function PagoEpaycoPage() {
  const formRef = useRef(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Obtener los datos de pago del sessionStorage
    const paymentDataStr = sessionStorage.getItem('epayco_payment_data');

    if (!paymentDataStr) {
      window.location.href = '/';
      return;
    }

    try {
      const data = JSON.parse(paymentDataStr);
      setPaymentData(data);

      // Esperar un momento para que el formulario se renderice
      setTimeout(() => {
        if (formRef.current) {
          // Limpiar sessionStorage antes de enviar
          sessionStorage.removeItem('epayco_payment_data');
          // Enviar el formulario
          formRef.current.submit();
        }
      }, 500);
    } catch (error) {
      console.error('❌ Error al parsear datos de pago:', error);
      window.location.href = '/';
    }
  }, []);

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirigiendo...</h1>
          <p>Si no eres redirigido automáticamente, <Link href="/" className="text-blue-600">haz clic aquí</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <h1 className="text-2xl font-bold mb-4">Redirigiendo a ePayco...</h1>
        <p className="text-gray-600">Por favor espera mientras te redirigimos a la pasarela de pago segura.</p>
      </div>

      {/* Formulario oculto que se auto-envía a ePayco */}
      <form
        ref={formRef}
        method="POST"
        action="https://checkout.epayco.co/checkout.php"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="public-key" value={paymentData.publicKey} />
        <input type="hidden" name="name" value={paymentData.name} />
        <input type="hidden" name="description" value={paymentData.description} />
        <input type="hidden" name="invoice" value={paymentData.invoice} />
        <input type="hidden" name="currency" value={paymentData.currency} />
        <input type="hidden" name="amount" value={paymentData.amount} />
        <input type="hidden" name="tax-base" value={paymentData.taxBase} />
        <input type="hidden" name="tax" value={paymentData.tax} />
        <input type="hidden" name="country" value={paymentData.country} />
        <input type="hidden" name="lang" value={paymentData.lang} />
        <input type="hidden" name="external" value={paymentData.external} />
        <input type="hidden" name="response-url" value={paymentData.responseUrl} />
        <input type="hidden" name="confirmation-url" value={paymentData.confirmationUrl} />
        <input type="hidden" name="method-confirmation" value={paymentData.methodConfirmation} />
        <input type="hidden" name="name-billing" value={paymentData.nameBilling} />
        <input type="hidden" name="address-billing" value={paymentData.addressBilling} />
        <input type="hidden" name="type-doc-billing" value={paymentData.typeDocBilling} />
        <input type="hidden" name="mobilephone-billing" value={paymentData.mobilephoneBilling} />
        <input type="hidden" name="number-doc-billing" value={paymentData.numberDocBilling} />
        <input type="hidden" name="email-billing" value={paymentData.emailBilling} />
        <input type="hidden" name="extra1" value={paymentData.extra1} />
        <input type="hidden" name="extra2" value={paymentData.extra2} />
        <input type="hidden" name="extra3" value={paymentData.extra3} />
        <input type="hidden" name="test" value={paymentData.test} />
        <input type="hidden" name="acepted" value="true" />
      </form>
    </div>
  );
}
