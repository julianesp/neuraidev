"use client";

import { useEffect, useState } from "react";

export default function TestEpayco() {
  const [epaycoStatus, setEpaycoStatus] = useState("Verificando...");
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    addLog("Iniciando verificación de ePayco...");

    // Verificar si el script está en el DOM
    const scripts = document.querySelectorAll('script[src*="epayco"]');
    addLog(`📄 Scripts de ePayco encontrados en el DOM: ${scripts.length}`);
    scripts.forEach((script, index) => {
      addLog(`   Script ${index + 1}: ${script.src}`);
    });

    // Verificar todos los scripts en la página
    const allScripts = document.querySelectorAll('script[src]');
    addLog(`📄 Total de scripts externos: ${allScripts.length}`);

    const checkEpayco = () => {
      if (typeof window !== 'undefined') {
        if (window.ePayco) {
          addLog("✅ window.ePayco está disponible");
          setEpaycoStatus("✅ ePayco cargado correctamente");

          if (window.ePayco.checkout) {
            addLog("✅ window.ePayco.checkout está disponible");
          } else {
            addLog("❌ window.ePayco.checkout NO está disponible");
          }

          return true;
        } else {
          addLog("❌ window.ePayco NO está disponible");
          return false;
        }
      }
      return false;
    };

    // Verificar inmediatamente
    if (checkEpayco()) return;

    // Verificar cada segundo durante 30 segundos
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      addLog(`Intento ${attempts}/30 de verificación...`);

      if (checkEpayco()) {
        clearInterval(interval);
      } else if (attempts >= 30) {
        setEpaycoStatus("❌ ePayco no se cargó después de 30 segundos");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadScriptManually = () => {
    addLog("🔄 Intentando cargar script manualmente...");

    // Verificar si ya existe
    const existing = document.querySelector('script[src*="checkout.epayco.co"]');
    if (existing) {
      addLog("⚠️ Script ya existe en el DOM, removiendo...");
      existing.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.epayco.co/checkout.js';
    script.async = true;

    script.onload = () => {
      addLog("✅ Script descargado exitosamente");

      // Esperar a que se inicialice
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.ePayco) {
          addLog(`✅ ePayco inicializado después de ${attempts} intentos`);
          setEpaycoStatus("✅ ePayco cargado correctamente");
          clearInterval(checkInterval);
        } else if (attempts > 50) {
          addLog("❌ ePayco no se inicializó después de 5 segundos");
          clearInterval(checkInterval);
        }
      }, 100);
    };

    script.onerror = (error) => {
      addLog("❌ Error al descargar el script");
      console.error(error);
    };

    document.head.appendChild(script);
    addLog("📌 Script agregado al head del documento");
  };

  const testCheckout = () => {
    addLog("Intentando abrir checkout de prueba...");

    if (!window.ePayco || !window.ePayco.checkout) {
      addLog("❌ Error: ePayco no está disponible");
      return;
    }

    try {
      const handler = window.ePayco.checkout.configure({
        key: process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY || 'test-key',
        test: true,
        name: "Producto de Prueba",
        description: "Prueba de checkout",
        invoice: `TEST-${Date.now()}`,
        currency: "COP",
        amount: "10000",
        tax_base: "8403",
        tax: "1597",
        country: "CO",
        lang: "es",
        external: "false",
        response: `${window.location.origin}/test-epayco`,
        confirmation: `${window.location.origin}/api/payments/epayco/confirmation`,
        name_billing: "Test User",
        address_billing: "Test Address",
        type_doc_billing: "CC",
        mobilephone_billing: "3001234567",
        number_doc_billing: "123456789",
        email_billing: "test@example.com",
      });

      addLog("✅ Handler configurado correctamente");
      handler.open();
      addLog("✅ Checkout abierto");
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Test de ePayco
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Estado: {epaycoStatus}
          </h2>

          <div className="flex gap-4">
            <button
              onClick={loadScriptManually}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Cargar Script Manualmente
            </button>

            <button
              onClick={testCheckout}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Probar Checkout
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Logs de Debugging
          </h2>

          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p>No hay logs todavía...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setLogs([])}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
          >
            Limpiar Logs
          </button>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Instrucciones
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200 text-sm">
            <li>Esta página verifica automáticamente si el script de ePayco se carga</li>
            <li>Revisa los logs para ver el estado de la carga</li>
            <li>Una vez que ePayco esté disponible, prueba el botón "Probar Checkout"</li>
            <li>Abre la consola del navegador (F12) para ver logs adicionales</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
