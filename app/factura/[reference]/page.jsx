"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Página de factura electrónica
 * URL: /factura/[reference]
 *
 * Permite visualizar y descargar la factura de una compra
 */
export default function FacturaPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const orderReference = params.reference;

  useEffect(() => {
    if (!orderReference) {
      setError("No se proporcionó una referencia de orden");
      setLoading(false);
      return;
    }

    // Generar la factura (o obtener la existente)
    generateInvoice();
  }, [orderReference]);

  const generateInvoice = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderReference }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error generando la factura");
      }

      setInvoice(data.invoice);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);

      const response = await fetch(
        `/api/invoices/download?reference=${orderReference}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error descargando la factura");
      }

      // Obtener el blob del PDF
      const blob = await response.blob();

      // Crear un enlace temporal y hacer clic para descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Factura_${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error descargando PDF:", err);
      alert("Error descargando el PDF: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Generando factura...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
            Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No se encontró la factura.
          </p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Banner superior */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Factura Electrónica</h1>
                <p className="text-blue-100">
                  No. {invoice.invoice_number}
                </p>
              </div>
              <div className="text-6xl">📄</div>
            </div>
          </div>

          {/* Contenido de la factura */}
          <div className="p-8">
            {/* Información general */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Información del cliente */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Información del Cliente
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Nombre:
                    </span>{" "}
                    {invoice.customer_name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Email:
                    </span>{" "}
                    {invoice.customer_email}
                  </p>
                  {invoice.customer_phone && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Teléfono:
                      </span>{" "}
                      {invoice.customer_phone}
                    </p>
                  )}
                  {invoice.customer_number_doc && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {invoice.customer_type_doc}:
                      </span>{" "}
                      {invoice.customer_number_doc}
                    </p>
                  )}
                </div>
              </div>

              {/* Información de la factura */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Detalles de la Factura
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Fecha:
                    </span>{" "}
                    {formatDate(invoice.issued_at)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Referencia:
                    </span>{" "}
                    {invoice.order_reference}
                  </p>
                  {invoice.transaction_id && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Transacción:
                      </span>{" "}
                      <span className="font-mono text-xs">
                        {invoice.transaction_id}
                      </span>
                    </p>
                  )}
                  {invoice.payment_method && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Método de pago:
                      </span>{" "}
                      <span className="uppercase">{invoice.payment_method}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de productos */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Productos
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totales */}
            <div className="flex justify-end mb-8">
              <div className="w-full md:w-1/2 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(invoice.subtotal)}
                  </span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Impuestos:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.tax)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-300 dark:border-gray-600">
                  <span className="text-blue-600 dark:text-blue-400">TOTAL:</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Descargando...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Descargar PDF</span>
                  </>
                )}
              </button>

              <Link
                href="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors text-center"
              >
                Volver al inicio
              </Link>
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
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Esta factura es válida como documento electrónico. Puedes
                  descargarla en formato PDF para tus registros contables. Si
                  tienes alguna pregunta, contáctanos en contacto@neurai.dev
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
