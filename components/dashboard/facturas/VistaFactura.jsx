"use client";

import { useRef } from "react";
import { ArrowLeft, Download, Printer, Edit2, Phone, Mail, Globe, MapPin, Cpu, Zap, Brain, Code2, CircuitBoard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <div>
      {/* ── Barra de acciones ── */}
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
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={handleImprimir}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors shadow"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={handleDescargarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* ── Factura ── */}
      <div
        id="factura-container"
        ref={facturaRef}
        className="bg-[#0a0e1a] shadow-2xl rounded-2xl overflow-hidden print:rounded-none print:shadow-none"
        style={{ maxWidth: "210mm", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}
      >

        {/* ══ HEADER ══ */}
        <div className="relative overflow-hidden print:overflow-visible">
          {/* Fondo con gradiente + malla de puntos */}
          <div
            className="absolute inset-0 print:hidden"
            style={{
              background: "linear-gradient(135deg, #0d1b4b 0%, #0a0e1a 40%, #1a0630 100%)",
            }}
          />
          {/* Grid decorativo */}
          <div
            className="absolute inset-0 opacity-10 print:hidden"
            style={{
              backgroundImage:
                "linear-gradient(rgba(99,102,241,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.4) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Círculos de brillo */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-violet-600 rounded-full opacity-10 blur-3xl print:hidden" />
          <div className="absolute -top-8 right-24 w-48 h-48 bg-cyan-500 rounded-full opacity-10 blur-3xl print:hidden" />

          <div className="relative px-8 pt-8 pb-6 print:px-6 print:pt-5 print:pb-4" style={{ background: "linear-gradient(135deg, #0d1b4b 0%, #0a0e1a 40%, #1a0630 100%)" }}>
            <div className="flex items-start justify-between gap-4">
              {/* Logo + nombre */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-500 rounded-xl blur-md opacity-50 print:hidden" />
                  <div className="relative bg-white rounded-xl p-0.5 shadow-lg">
                    <Image
                      src="/images/logo.png"
                      alt="neurai.dev"
                      width={64}
                      height={64}
                      className="rounded-lg object-contain print:w-10 print:h-10"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-black text-white tracking-tight print:text-xl">
                      neurai<span className="text-violet-400">.dev</span>
                    </h1>
                    <Brain className="w-5 h-5 text-cyan-400 print:hidden" />
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1 print:text-xs">
                    <Cpu className="w-3.5 h-3.5 print:hidden" />
                    Ingeniería de Software · Inteligencia Artificial
                  </p>
                </div>
              </div>

              {/* Número de factura */}
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 rounded-full px-3 py-1 mb-2">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-violet-300 text-xs font-semibold uppercase tracking-widest">Factura</span>
                </div>
                <div className="text-2xl font-black text-white font-mono print:text-base">
                  {factura.numeroFactura}
                </div>
                <div className="text-slate-400 text-sm mt-1 print:text-xs">
                  {formatearFecha(factura.fecha)}
                </div>
              </div>
            </div>

            {/* Línea divisora con gradiente */}
            <div className="mt-6 h-px print:mt-3" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,.6), rgba(34,211,238,.6), transparent)" }} />

            {/* Contacto */}
            <div className="mt-4 grid grid-cols-2 gap-2 print:mt-2">
              <div className="space-y-1.5 print:space-y-0.5">
                <Link
                  href={`tel:${factura.miContacto?.telefono}`}
                  className="flex items-center gap-2 text-slate-300 text-sm hover:text-cyan-400 transition-colors print:text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  {factura.miContacto?.telefono}
                </Link>
                <Link
                  href={`mailto:${factura.miContacto?.email}`}
                  className="flex items-center gap-2 text-slate-300 text-sm hover:text-violet-400 transition-colors print:text-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  {factura.miContacto?.email}
                </Link>
              </div>
              <div className="text-right space-y-1.5 print:space-y-0.5">
                <div className="flex items-center justify-end gap-2 text-slate-300 text-sm print:text-xs">
                  <Globe className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  neurai.dev
                </div>
                <div className="flex items-center justify-end gap-2 text-slate-300 text-sm print:text-xs">
                  <MapPin className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  Colombia
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ FACTURADO A ══ */}
        <div className="px-8 py-5 print:px-6 print:py-3" style={{ background: "#0f1424" }}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-violet-500 to-cyan-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Facturado a</span>
              </div>
              <p className="text-xl font-bold text-white print:text-base">{factura.cliente.nombre}</p>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
                {factura.cliente.identificacion && (
                  <span className="text-sm text-slate-400 print:text-xs">
                    {factura.cliente.identificacion.length > 10 ? "NIT" : "C.C."}: {factura.cliente.identificacion}
                  </span>
                )}
                {factura.cliente.telefono && (
                  <span className="text-sm text-slate-400 print:text-xs">Tel: {factura.cliente.telefono}</span>
                )}
                {factura.cliente.email && (
                  <span className="text-sm text-slate-400 print:text-xs">{factura.cliente.email}</span>
                )}
                {factura.cliente.direccion && (
                  <span className="text-sm text-slate-400 print:text-xs">{factura.cliente.direccion}</span>
                )}
              </div>
            </div>
            {/* Badge de estado */}
            <div className="flex-shrink-0 bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-4 py-2 text-center print:hidden">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Emitida</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ SERVICIOS ══ */}
        {factura.servicios?.length > 0 && (
          <div className="px-8 py-5 print:px-6 print:py-3" style={{ borderTop: "1px solid rgba(99,102,241,0.15)" }}>
            <div className="flex items-center gap-2 mb-4 print:mb-2">
              <Code2 className="w-4 h-4 text-violet-400 print:hidden" />
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Servicios Prestados</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
                  <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider print:pb-1">Descripción</th>
                  <th className="text-center pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 print:pb-1">Cant.</th>
                  <th className="text-right pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32 print:pb-1">Valor Unit.</th>
                  <th className="text-right pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32 print:pb-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {factura.servicios.map((s, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="py-3 text-white text-sm print:py-1.5 print:text-xs">{s.descripcion}</td>
                    <td className="py-3 text-center print:py-1.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-slate-300 text-xs font-bold print:w-auto print:h-auto print:bg-transparent print:text-xs">{s.cantidad}</span>
                    </td>
                    <td className="py-3 text-right text-slate-400 text-sm print:py-1.5 print:text-xs">${fmt(s.precio)}</td>
                    <td className="py-3 text-right font-bold text-cyan-400 text-sm print:py-1.5 print:text-xs">
                      ${fmt(s.cantidad * s.precio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ PRODUCTOS ══ */}
        {factura.productos?.length > 0 && (
          <div className="px-8 py-5 print:px-6 print:py-3" style={{ borderTop: "1px solid rgba(99,102,241,0.15)" }}>
            <div className="flex items-center gap-2 mb-4 print:mb-2">
              <CircuitBoard className="w-4 h-4 text-cyan-400 print:hidden" />
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Productos Vendidos</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(34,211,238,0.2)" }}>
                  <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider print:pb-1">Producto</th>
                  <th className="text-center pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 print:pb-1">Cant.</th>
                  <th className="text-right pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32 print:pb-1">Valor Unit.</th>
                  <th className="text-right pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32 print:pb-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {factura.productos.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="py-3 text-white text-sm print:py-1.5 print:text-xs">{p.nombre}</td>
                    <td className="py-3 text-center print:py-1.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-slate-300 text-xs font-bold print:w-auto print:h-auto print:bg-transparent print:text-xs">{p.cantidad}</span>
                    </td>
                    <td className="py-3 text-right text-slate-400 text-sm print:py-1.5 print:text-xs">${fmt(p.precio)}</td>
                    <td className="py-3 text-right font-bold text-cyan-400 text-sm print:py-1.5 print:text-xs">
                      ${fmt(p.cantidad * p.precio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ TOTALES ══ */}
        <div className="px-8 py-6 print:px-6 print:py-4" style={{ borderTop: "1px solid rgba(99,102,241,0.15)", background: "#0a0e1a" }}>
          <div className="flex flex-col items-end gap-2 print:gap-1">
            {/* Subtotal */}
            {factura.descuentoMonto > 0 && (
              <div className="flex items-center gap-8 text-sm print:text-xs">
                <span className="text-slate-500 uppercase tracking-wider font-semibold">Subtotal</span>
                <span className="text-slate-400 w-36 text-right">${fmt(factura.subtotal)} COP</span>
              </div>
            )}
            {/* Descuento */}
            {factura.descuentoMonto > 0 && (
              <div className="flex items-center gap-8 text-sm print:text-xs">
                <span className="text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 print:hidden" />
                  Descuento ({factura.descuentoPorcentaje}%)
                </span>
                <span className="text-emerald-400 w-36 text-right">-${fmt(factura.descuentoMonto)} COP</span>
              </div>
            )}

            {/* Total */}
            <div
              className="mt-2 flex items-center gap-8 rounded-xl px-5 py-3 print:mt-1 print:px-3 print:py-2"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))", border: "1px solid rgba(99,102,241,0.3)" }}
            >
              <span className="text-slate-300 font-bold uppercase tracking-wider text-sm print:text-xs">Total a Pagar</span>
              <span
                className="font-black text-2xl print:text-base"
                style={{ background: "linear-gradient(90deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                ${fmt(factura.total)} COP
              </span>
            </div>

            {/* Método de pago */}
            <div className="flex items-center gap-2 mt-1 print:mt-0.5">
              <span className="text-slate-600 text-xs uppercase tracking-wider">Pago:</span>
              <span className="text-slate-400 text-xs font-semibold capitalize">
                {metodoPagoLabel[factura.metodoPago] || factura.metodoPago}
              </span>
            </div>
          </div>

          {/* Notas */}
          {factura.notas && (
            <div className="mt-5 print:mt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Notas</p>
              <p className="text-slate-400 text-sm print:text-xs">{factura.notas}</p>
            </div>
          )}
        </div>

        {/* ══ PIE DE PÁGINA ══ */}
        <div
          className="px-8 py-5 print:px-6 print:py-3 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0d1b4b 0%, #0a0e1a 50%, #1a0630 100%)" }}
        >
          <div className="absolute inset-0 opacity-5 print:hidden" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.4) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 print:gap-1">
              <Brain className="w-4 h-4 text-violet-400 print:hidden" />
              <span className="text-violet-300 text-xs font-semibold print:text-xs">Powered by AI · neurai.dev</span>
            </div>
            <div className="text-center flex-1">
              <p className="text-slate-500 text-xs print:text-xs">Gracias por confiar en neurai.dev</p>
            </div>
            <p className="text-slate-600 text-xs print:text-xs">Documento electrónico válido</p>
          </div>
        </div>
      </div>

      {/* ── Estilos de impresión ── */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          nav, header, footer, aside, .print\\:hidden, button { display: none !important; }
          #factura-container, #factura-container * { visibility: visible !important; }
          #factura-container {
            position: absolute;
            left: 0; top: 0;
            width: 100%; max-width: 100% !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            color: #111 !important;
          }
          #factura-container * {
            color: #111 !important;
            border-color: #ddd !important;
            background: transparent !important;
            -webkit-text-fill-color: inherit !important;
          }
          @page { size: A4; margin: 8mm 12mm; }
        }
      `}</style>
    </div>
  );
}
