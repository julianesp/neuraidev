"use client";

import { useRef } from "react";
import { ArrowLeft, Download, Printer, Edit2 } from "lucide-react";
import Image from "next/image";

export default function VistaFactura({ factura, onVolver, onEditar }) {
  const facturaRef = useRef(null);

  const handleImprimir = () => window.print();
  const handleDescargarPDF = () => window.print();

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const fmt = (n) => parseFloat(n || 0).toLocaleString("es-CO");

  const metodoPagoLabel = {
    efectivo: "Efectivo",
    nequi: "Nequi",
    transferencia: "Transferencia bancaria",
    tarjeta: "Tarjeta de crédito / débito",
  };

  const subtotal =
    factura.subtotal ||
    [...(factura.servicios || []), ...(factura.productos || [])].reduce(
      (s, x) => s + parseFloat(x.precio || 0) * parseInt(x.cantidad || 0),
      0
    );

  return (
    <div>
      {/* ── Barra de acciones (no se imprime) ── */}
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
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Editar
          </button>
          <button
            onClick={handleImprimir}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button
            onClick={handleDescargarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          FACTURA  (todo lo que se imprime)
      ══════════════════════════════════════ */}
      <div
        id="factura-container"
        ref={facturaRef}
        className="bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none"
        style={{ maxWidth: "210mm", margin: "0 auto" }}
      >

        {/* ── HEADER ── */}
        <div className="flex items-stretch min-h-[130px] print:min-h-0">

          {/* Columna izquierda – logo + nombre */}
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

          {/* Columna derecha – datos del emisor */}
          <div
            className="flex-1 flex flex-col justify-center px-7 py-5 print:px-5 print:py-4"
            style={{ background: "#f8f7ff" }}
          >
            <div className="space-y-0.5 text-xs text-gray-600 print:text-[10px]">
              {factura.miContacto?.telefono && (
                <p>Tel: {factura.miContacto.telefono}</p>
              )}
              {factura.miContacto?.email && (
                <p>Email: {factura.miContacto.email}</p>
              )}
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
            Factura de Cobro
          </p>
          <div className="text-right">
            <p className="text-violet-200 font-mono font-bold text-base print:text-sm">
              No. {factura.numeroFactura}
            </p>
            <p className="text-violet-300 text-xs print:text-[10px]">
              {formatearFecha(factura.fecha)}
            </p>
          </div>
        </div>

        {/* ── INFO CLIENTE ── */}
        <div className="px-8 py-5 print:px-5 print:py-3" style={{ borderBottom: "2px solid #1e0a4b" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1 print:text-[10px]" style={{ color: "#1e0a4b" }}>
            Cliente:
          </p>
          <p className="font-bold text-gray-800 text-base print:text-sm">
            {factura.cliente.nombre}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-gray-600 print:text-[10px]">
            {factura.cliente.identificacion && (
              <p>
                {factura.cliente.identificacion.length > 10 ? "NIT" : "C.C."}: {factura.cliente.identificacion}
              </p>
            )}
            {factura.cliente.direccion && <p>Dirección: {factura.cliente.direccion}</p>}
            {factura.cliente.telefono && <p>Tel: {factura.cliente.telefono}</p>}
            {factura.cliente.email && <p>Email: {factura.cliente.email}</p>}
          </div>
        </div>

        {/* ── TABLA DE ÍTEMS ── */}
        <div className="px-8 py-5 print:px-5 print:py-3">

          {/* Encabezado de tabla */}
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
              {/* Servicios */}
              {(factura.servicios || []).map((s, i) => (
                <tr
                  key={`s-${i}`}
                  style={{ background: i % 2 === 0 ? "#faf9ff" : "#ffffff", borderBottom: "1px solid #e5e7eb" }}
                >
                  <td className="px-3 py-2.5 text-gray-800 print:px-2 print:py-1.5">
                    {s.descripcion}
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-600 print:px-2 print:py-1.5">
                    {s.cantidad} Hrs
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-600 print:px-2 print:py-1.5">
                    ${fmt(s.precio)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-gray-800 print:px-2 print:py-1.5">
                    ${fmt(parseFloat(s.precio) * parseInt(s.cantidad || 1))}
                  </td>
                </tr>
              ))}
              {/* Productos */}
              {(factura.productos || []).map((p, i) => (
                <tr
                  key={`p-${i}`}
                  style={{
                    background:
                      ((factura.servicios?.length || 0) + i) % 2 === 0 ? "#faf9ff" : "#ffffff",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <td className="px-3 py-2.5 text-gray-800 print:px-2 print:py-1.5">
                    {p.nombre}
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-600 print:px-2 print:py-1.5">
                    {p.cantidad} Und
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-600 print:px-2 print:py-1.5">
                    ${fmt(p.precio)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-gray-800 print:px-2 print:py-1.5">
                    ${fmt(parseFloat(p.precio) * parseInt(p.cantidad || 1))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── TOTALES ── */}
          <div className="mt-4 flex justify-end print:mt-2">
            <div className="w-72 print:w-60">
              {/* Subtotal */}
              <div className="flex justify-between items-center py-1.5 text-sm print:text-xs" style={{ borderBottom: "1px solid #e5e7eb" }}>
                <span className="text-gray-500 font-medium">SUBTOTAL:</span>
                <span className="text-gray-800 font-semibold">${fmt(subtotal)}</span>
              </div>

              {/* Descuento si aplica */}
              {parseFloat(factura.descuentoMonto) > 0 && (
                <div className="flex justify-between items-center py-1.5 text-sm print:text-xs" style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <span className="text-emerald-600 font-medium">
                    DESCUENTO ({factura.descuentoPorcentaje}%):
                  </span>
                  <span className="text-emerald-600 font-semibold">-${fmt(factura.descuentoMonto)}</span>
                </div>
              )}

              {/* Total */}
              <div
                className="flex justify-between items-center px-4 py-3 mt-2 rounded-lg print:px-3 print:py-2 print:mt-1"
                style={{ background: "#1e0a4b" }}
              >
                <span className="text-white font-bold text-sm uppercase tracking-wide print:text-xs">
                  Total a Pagar
                </span>
                <span className="text-white font-black text-lg print:text-sm">
                  ${fmt(factura.total)}
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
              {metodoPagoLabel[factura.metodoPago] || factura.metodoPago}
            </p>
            {factura.notas && (
              <p>
                <span className="font-bold">Notas: </span>
                {factura.notas}
              </p>
            )}
            <p className="mt-1 print:mt-0.5">
              <span className="font-bold">Servicio prestado a: </span>
              {factura.cliente.nombre}
            </p>
          </div>

          {/* ── Firma / nombre del emisor ── */}
          <div className="mt-8 text-right print:mt-6">
            <p className="font-bold text-gray-800 text-base print:text-sm">
              Julián España
            </p>
            <p className="text-gray-500 text-[11px] mt-0.5 print:text-[9px]">
              Ingeniero de software, desarrollador web y técnico en sistemas
            </p>
          </div>
        </div>

      </div>

      {/* ── Estilos de impresión ── */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          nav, header, footer, aside, .print\\:hidden, button {
            display: none !important;
          }
          #factura-container,
          #factura-container * { visibility: visible !important; }
          html, body {
            height: auto !important;
            overflow: hidden !important;
          }
          #factura-container {
            position: absolute;
            left: 0; top: 0;
            width: 100%; max-width: 100% !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
          }
          @page { size: A4; margin: 8mm 12mm; }
          #factura-container,
          #factura-container * { page-break-inside: avoid !important; }
          #factura-container { page-break-after: avoid !important; }
        }
      `}</style>
    </div>
  );
}
