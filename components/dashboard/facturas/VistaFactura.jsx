"use client";

import { useRef } from "react";
import { ArrowLeft, Download, Printer, Edit2 } from "lucide-react";
import Image from "next/image";

export default function VistaFactura({ factura, onVolver, onEditar }) {
  const facturaRef = useRef(null);

  const handleImprimir = () => {
    window.print();
  };

  const handleDescargarPDF = async () => {
    // Implementación básica usando window.print con CSS print
    // Para una solución más robusta, puedes usar jsPDF o react-to-pdf
    window.print();
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Botones de Acción - No se imprimen */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <div className="flex gap-3">
          <button
            onClick={onEditar}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Edit2 className="w-5 h-5" />
            Editar
          </button>
          <button
            onClick={handleImprimir}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </button>
          <button
            onClick={handleDescargarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Factura - Se imprime */}
      <div
        id="factura-container"
        ref={facturaRef}
        className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none"
        style={{ maxWidth: '210mm', margin: '0 auto' }}
      >
        {/* Encabezado con Logo */}
        <div className="bg-blue-600 text-white p-8 print:p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg p-2 print:p-1">
                <Image
                  src="/images/logo.png"
                  alt="neurai.dev"
                  width={60}
                  height={60}
                  className="object-contain print:w-10 print:h-10"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold print:text-xl">neurai.dev</h1>
                <p className="text-blue-100 mt-1 print:text-sm print:mt-0">Soluciones Tecnológicas</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100 print:text-xs">Factura</div>
              <div className="text-2xl font-bold print:text-lg">{factura.numeroFactura}</div>
              <div className="text-sm text-blue-100 mt-1 print:text-xs print:mt-0">
                {formatearFecha(factura.fecha)}
              </div>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-black px-8 py-5 border-b print:px-4 print:py-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white text-lg print:text-sm">
                Teléfono: {factura.miContacto?.telefono || '+57 XXX XXX XXXX'}
              </p>
              <p className="text-white text-lg mt-1 print:text-sm print:mt-0">
                Email: {factura.miContacto?.email || 'contacto@neurai.dev'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white text-lg print:text-sm">Web: neurai.dev</p>
              <p className="text-white text-lg mt-1 print:text-sm print:mt-0">Colombia</p>
            </div>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="p-8 border-b print:p-4 print:pb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3 print:text-xs print:mb-1">
            Facturado a:
          </h2>
          <div className="space-y-1 print:space-y-0">
            <p className="text-xl font-bold text-gray-900 print:text-base">
              {factura.cliente.nombre}
            </p>
            {factura.cliente.identificacion && (
              <p className="text-gray-600 print:text-xs">
                {factura.cliente.identificacion.length > 10 ? 'NIT' : 'CC'}: {factura.cliente.identificacion}
              </p>
            )}
            {factura.cliente.telefono && (
              <p className="text-gray-600 print:text-xs">Tel: {factura.cliente.telefono}</p>
            )}
            {factura.cliente.email && (
              <p className="text-gray-600 print:text-xs">Email: {factura.cliente.email}</p>
            )}
            {factura.cliente.direccion && (
              <p className="text-gray-600 print:text-xs">Dir: {factura.cliente.direccion}</p>
            )}
          </div>
        </div>

        {/* Servicios */}
        {factura.servicios.length > 0 && (
          <div className="p-8 border-b print:p-4 print:pb-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 print:text-sm print:mb-2">
              Servicios Prestados
            </h2>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 text-sm font-semibold text-gray-700 print:py-1 print:text-xs">
                    Descripción
                  </th>
                  <th className="text-center py-2 text-sm font-semibold text-gray-700 w-20 print:py-1 print:text-xs">
                    Cant.
                  </th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 w-32 print:py-1 print:text-xs">
                    Valor Unit.
                  </th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 w-32 print:py-1 print:text-xs">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {factura.servicios.map((servicio, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 text-gray-800 print:py-1 print:text-xs">{servicio.descripcion}</td>
                    <td className="py-3 text-center text-gray-600 print:py-1 print:text-xs">
                      {servicio.cantidad}
                    </td>
                    <td className="py-3 text-right text-gray-600 print:py-1 print:text-xs">
                      ${parseFloat(servicio.precio).toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900 print:py-1 print:text-xs">
                      ${(servicio.cantidad * servicio.precio).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Productos */}
        {factura.productos.length > 0 && (
          <div className="p-8 border-b print:p-4 print:pb-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 print:text-sm print:mb-2">
              Productos Vendidos
            </h2>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 text-sm font-semibold text-gray-700 print:py-1 print:text-xs">
                    Producto
                  </th>
                  <th className="text-center py-2 text-sm font-semibold text-gray-700 w-20 print:py-1 print:text-xs">
                    Cant.
                  </th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 w-32 print:py-1 print:text-xs">
                    Valor Unit.
                  </th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 w-32 print:py-1 print:text-xs">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {factura.productos.map((producto, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 text-gray-800 print:py-1 print:text-xs">{producto.nombre}</td>
                    <td className="py-3 text-center text-gray-600 print:py-1 print:text-xs">
                      {producto.cantidad}
                    </td>
                    <td className="py-3 text-right text-gray-600 print:py-1 print:text-xs">
                      ${parseFloat(producto.precio).toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900 print:py-1 print:text-xs">
                      ${(producto.cantidad * producto.precio).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totales */}
        <div className="p-8 print:p-4">
          <div className="flex justify-end">
            <div className="w-80 space-y-3 print:space-y-1">
              <div className="flex justify-between text-2xl font-bold text-gray-900 print:text-base">
                <span>Total a Pagar:</span>
                <span className="text-blue-600">
                  ${factura.total.toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="pt-2 text-sm text-gray-600 border-t border-gray-200 mt-3 print:text-xs print:pt-1 print:mt-1">
                <p className="font-semibold">Método de pago:</p>
                <p className="capitalize">{factura.metodoPago}</p>
              </div>
            </div>
          </div>

          {/* Notas */}
          {factura.notas && (
            <div className="mt-6 pt-6 border-t print:mt-3 print:pt-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 print:text-xs print:mb-1">Notas:</h3>
              <p className="text-gray-600 text-sm print:text-xs">{factura.notas}</p>
            </div>
          )}
        </div>

        {/* Pie de página */}
        <div className="bg-gray-50 dark:bg-gray-800 px-8 py-6 border-t print:px-4 print:py-3">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 print:text-xs">
            Gracias por confiar en neurai.dev
          </p>
          <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-2 print:mt-1">
            Esta factura fue generada electrónicamente y es válida sin firma
          </p>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          /* Ocultar todo excepto la factura */
          body * {
            visibility: hidden;
          }

          /* Ocultar navbar, header, footer y elementos de navegación */
          nav,
          header,
          footer,
          .navbar,
          [role="navigation"],
          aside,
          .sidebar,
          /* Ocultar elementos específicos del dashboard */
          [class*="sidebar"],
          [class*="nav"],
          [class*="menu"],
          /* Ocultar botones de acción */
          .print\\:hidden,
          button:not(.no-print) {
            display: none !important;
            visibility: hidden !important;
          }

          /* Mostrar solo la factura */
          #factura-container,
          #factura-container * {
            visibility: visible !important;
          }

          #factura-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100% !important;
            background: white;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body {
            background: white;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          html, body {
            height: auto;
            overflow: hidden;
          }

          .print\\:shadow-none {
            box-shadow: none !important;
          }

          .print\\:rounded-none {
            border-radius: 0 !important;
          }

          @page {
            size: A4;
            margin: 5mm 10mm;
          }

          /* Evitar saltos de página innecesarios */
          #factura-container {
            page-break-inside: avoid;
            page-break-after: avoid;
          }

          #factura-container > div {
            page-break-inside: avoid;
          }

          /* Optimizar espacios verticales */
          .print\\:p-4 {
            padding: 8px 16px !important;
          }

          .print\\:py-3 {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
          }

          .print\\:pb-3 {
            padding-bottom: 6px !important;
          }

          .print\\:space-y-0 > * + * {
            margin-top: 0 !important;
          }

          .print\\:space-y-1 > * + * {
            margin-top: 2px !important;
          }
        }
      `}</style>
    </div>
  );
}
