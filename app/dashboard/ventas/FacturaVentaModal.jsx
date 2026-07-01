"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Printer, Download, MessageCircle } from "lucide-react";
import Image from "next/image";

/**
 * Modal de factura imprimible para una venta agrupada del historial.
 * Reutiliza el diseño de components/dashboard/facturas/VistaFactura.jsx
 * pero alimentado directamente por un grupo de ventas (mismo comprador).
 *
 * Props:
 *   grupo: {
 *     cliente_nombre, cliente_telefono, cliente_email,
 *     fecha_venta, metodo_pago, notas,
 *     items: [{ producto_nombre, cantidad, precio_venta }],
 *     numeroFactura, totalVenta
 *   }
 *   onClose: () => void
 */
export default function FacturaVentaModal({ grupo, onClose }) {
  // El modal se renderiza en un portal a <body> para que el overlay sea hijo
  // directo del body; así la regla de impresión que oculta el resto de la
  // página (body > *:not(#factura-overlay)) funciona de forma fiable.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // Aviso "Próximamente disponible" para el envío por WhatsApp
  const [mostrarProximamente, setMostrarProximamente] = useState(false);

  if (!grupo || !montado) return null;

  const fmt = (n) => parseFloat(n || 0).toLocaleString("es-CO");

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const metodoPagoLabel = {
    efectivo: "Efectivo",
    nequi: "Nequi",
    transferencia: "Transferencia bancaria",
    tarjeta: "Tarjeta de crédito / débito",
  };

  const subtotal = grupo.items.reduce(
    (s, x) => s + parseFloat(x.precio_venta || 0) * parseInt(x.cantidad || 0),
    0
  );

  // Al "Guardar como PDF", el navegador usa document.title como nombre por
  // defecto del archivo. Lo cambiamos temporalmente para incluir el nombre
  // del cliente y lo restauramos al terminar de imprimir.
  const handleImprimir = () => {
    const slug = (grupo.cliente_nombre || "cliente-ocasional")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // quitar acentos
      .trim()
      .replace(/[^\w\s-]/g, "")        // quitar caracteres no válidos
      .replace(/\s+/g, "-")            // espacios -> guiones
      .toLowerCase();

    const nombreArchivo = `factura-${slug}-${grupo.numeroFactura}`;
    const tituloOriginal = document.title;
    document.title = nombreArchivo;

    const restaurar = () => {
      document.title = tituloOriginal;
      window.removeEventListener("afterprint", restaurar);
    };
    window.addEventListener("afterprint", restaurar);

    window.print();
  };

  // El envío por WhatsApp aún no está disponible: solo mostramos un aviso.
  const handleEnviarWhatsApp = () => {
    setMostrarProximamente(true);
  };

  return createPortal(
    <>
    <div
      id="factura-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Barra de acciones (no se imprime) ── */}
        <div className="mb-4 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow"
          >
            <X className="w-5 h-5" />
            Cerrar
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleEnviarWhatsApp}
              title="Enviar resumen de la factura por WhatsApp al cliente"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow"
            >
              <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
            </button>
            <button
              onClick={handleImprimir}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow"
            >
              <Download className="w-4 h-4" /> Imprimir / Descargar PDF
            </button>
          </div>
        </div>

        {/* ══════════════ FACTURA (todo lo que se imprime) ══════════════ */}
        <div
          id="factura-container"
          className="bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none"
          style={{ maxWidth: "210mm", margin: "0 auto" }}
        >
          {/* ── HEADER ── */}
          <div className="flex items-stretch min-h-[130px] print:min-h-0">
            <div
              className="flex flex-col justify-center px-8 py-6 print:px-5 print:py-4"
              style={{ width: "42%", background: "linear-gradient(160deg,#1e0a4b 0%,#0d1e6b 50%,#062060 100%)" }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-lg p-0.5 shadow flex-shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="neurai.dev"
                    width={54}
                    height={54}
                    className="rounded-md object-contain print:w-9 print:h-9"
                  />
                </div>
                <div>
                  <p className="text-white font-black text-2xl leading-none tracking-tight print:text-lg">
                    neurai<span style={{ color: "#a78bfa" }}>.dev</span>
                  </p>
                  <p className="text-slate-300 text-xs mt-1 leading-tight print:text-[10px]">
                    Ingeniería de Software
                  </p>
                </div>
              </div>
            </div>

            <div
              className="flex-1 flex flex-col justify-center px-7 py-5 print:px-5 print:py-4"
              style={{ background: "#f8f7ff" }}
            >
              <div className="space-y-0.5 text-xs text-gray-600 print:text-[10px]">
                <p>Colón, Putumayo</p>
                <p>neurai.dev</p>
              </div>
            </div>
          </div>

          {/* ── BANDA: Título factura + número + fecha ── */}
          <div
            className="flex items-center justify-between px-8 py-3 print:px-5 print:py-2"
            style={{ background: "#1e0a4b" }}
          >
            <p className="text-white font-black text-lg tracking-wide uppercase print:text-sm">
              Factura de Venta
            </p>
            <div className="text-right">
              <p className="text-violet-200 font-mono font-bold text-base print:text-sm">
                {grupo.numeroFactura}
              </p>
              <p className="text-violet-300 text-xs print:text-[10px]">
                {formatearFecha(grupo.fecha_venta)}
              </p>
            </div>
          </div>

          {/* ── INFO CLIENTE ── */}
          <div className="px-8 py-5 print:px-5 print:py-3" style={{ borderBottom: "2px solid #1e0a4b" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1 print:text-[10px]" style={{ color: "#1e0a4b" }}>
              Cliente:
            </p>
            <p className="font-bold text-gray-800 text-base print:text-sm">
              {grupo.cliente_nombre || "Cliente ocasional"}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-gray-600 print:text-[10px]">
              {grupo.cliente_telefono && <p>Tel: {grupo.cliente_telefono}</p>}
              {grupo.cliente_email && <p>Email: {grupo.cliente_email}</p>}
            </div>
          </div>

          {/* ── TABLA DE ÍTEMS ── */}
          <div className="px-8 py-5 print:px-5 print:py-3">
            <table className="w-full text-sm print:text-xs">
              <thead>
                <tr style={{ background: "#1e0a4b" }}>
                  <th className="text-left text-white font-semibold px-3 py-2.5 print:px-2 print:py-1.5" style={{ width: "44%" }}>
                    DESCRIPCIÓN
                  </th>
                  <th className="text-center text-white font-semibold px-3 py-2.5 print:px-2 print:py-1.5" style={{ width: "13%" }}>
                    CANTIDAD
                  </th>
                  <th className="text-right text-white font-semibold px-3 py-2.5 print:px-2 print:py-1.5" style={{ width: "20%" }}>
                    PRECIO UNIT.
                  </th>
                  <th className="text-right text-white font-semibold px-3 py-2.5 print:px-2 print:py-1.5 rounded-tr-sm" style={{ width: "23%" }}>
                    TOTAL ($)
                  </th>
                </tr>
              </thead>
              <tbody>
                {grupo.items.map((p, i) => (
                  <tr
                    key={i}
                    style={{ background: i % 2 === 0 ? "#faf9ff" : "#ffffff", borderBottom: "1px solid #e5e7eb" }}
                  >
                    <td className="px-3 py-2.5 text-gray-800 print:px-2 print:py-1.5">
                      {p.producto_nombre}
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-600 print:px-2 print:py-1.5">
                      {p.cantidad} Und
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-600 print:px-2 print:py-1.5">
                      ${fmt(p.precio_venta)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-gray-800 print:px-2 print:py-1.5">
                      ${fmt(parseFloat(p.precio_venta) * parseInt(p.cantidad || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── TOTALES ── */}
            <div className="mt-4 flex justify-end print:mt-2">
              <div className="w-72 print:w-60">
                <div className="flex justify-between items-center py-1.5 text-sm print:text-xs" style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <span className="text-gray-500 font-medium">SUBTOTAL:</span>
                  <span className="text-gray-800 font-semibold">${fmt(subtotal)}</span>
                </div>
                <div
                  className="flex justify-between items-center px-4 py-3 mt-2 rounded-lg print:px-3 print:py-2 print:mt-1"
                  style={{ background: "#1e0a4b" }}
                >
                  <span className="text-white font-bold text-sm uppercase tracking-wide print:text-xs">
                    Total a Pagar
                  </span>
                  <span className="text-white font-black text-lg print:text-sm">
                    ${fmt(subtotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── DATOS DE PAGO / PIE ── */}
          <div
            className="px-8 py-5 print:px-5 print:py-3"
            style={{ background: "#f8f7ff", borderTop: "2px solid #1e0a4b" }}
          >
            <div className="flex flex-col gap-2 text-xs text-gray-700 print:text-[10px] print:gap-1">
              <p>
                <span className="font-bold">Método de pago: </span>
                {metodoPagoLabel[grupo.metodo_pago] || grupo.metodo_pago}
              </p>
              {grupo.notas && (
                <p>
                  <span className="font-bold">Notas: </span>
                  {grupo.notas}
                </p>
              )}
            </div>

            {/* ── Firma / nombre del emisor ── */}
            <div className="mt-8 text-right print:mt-6">
              <p className="font-bold text-gray-800 text-base print:text-sm">
                Julián España
              </p>
              <div className="text-gray-500 text-[11px] mt-0.5 print:text-[9px] flex flex-col">
                <span>Ingeniero de software</span>
                <span>Desarrollador web</span>
                <span>Técnico en sistemas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Estilos de impresión ── */}
      <style jsx global>{`
        @media print {
          /* 1) Sacar del layout todo lo que no sea el overlay de la factura.
                Al ser el overlay hijo directo de <body> (portal), esto elimina
                el alto del resto de la página y evita hojas en blanco. */
          body > *:not(#factura-overlay) {
            display: none !important;
          }
          /* 2) Ocultar visualmente cualquier resto, sin romper la factura */
          body * {
            visibility: hidden !important;
          }
          #factura-container,
          #factura-container * {
            visibility: visible !important;
          }
          /* 3) Colapsar el overlay fixed para que no ocupe pantalla completa */
          #factura-overlay {
            position: static !important;
            inset: auto !important;
            display: block !important;
            width: auto !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #factura-overlay > div {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          /* 4) Colocar la factura al inicio de la hoja */
          #factura-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: #fff !important;
          }
          @page { size: A4; margin: 8mm 12mm; }
        }
      `}</style>
    </div>

    {/* Aviso "Próximamente disponible" para el envío por WhatsApp */}
    {mostrarProximamente && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 print:hidden"
        onClick={() => setMostrarProximamente(false)}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Próximamente disponible
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            El envío de la factura por WhatsApp estará disponible muy pronto.
          </p>
          <button
            onClick={() => setMostrarProximamente(false)}
            className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    )}
    </>,
    document.body
  );
}
