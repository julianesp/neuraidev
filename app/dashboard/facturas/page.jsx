"use client";

import { useState } from "react";
import { FileText, Plus, Search, Calendar, Download } from "lucide-react";
import FormularioFactura from "@/components/dashboard/facturas/FormularioFactura";
import VistaFactura from "@/components/dashboard/facturas/VistaFactura";

export default function FacturasPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [facturaPreview, setFacturaPreview] = useState(null);
  const [facturaEditando, setFacturaEditando] = useState(null);
  const [facturas, setFacturas] = useState([]);

  const handleGuardarFactura = (factura) => {
    if (facturaEditando) {
      // Editar factura existente
      setFacturas(facturas.map(f =>
        f.numeroFactura === facturaEditando.numeroFactura ? factura : f
      ));
    } else {
      // Agregar nueva factura
      setFacturas([factura, ...facturas]);
    }
    setFacturaPreview(factura);
    setFacturaEditando(null);
    setMostrarFormulario(false);
  };

  const handleNuevaFactura = () => {
    setFacturaPreview(null);
    setFacturaEditando(null);
    setMostrarFormulario(true);
  };

  const handleVerFactura = (factura) => {
    setFacturaPreview(factura);
    setMostrarFormulario(false);
  };

  const handleEditarFactura = (factura) => {
    setFacturaEditando(factura);
    setFacturaPreview(null);
    setMostrarFormulario(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Facturación
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Genera facturas profesionales para servicios y productos
            </p>
          </div>
          <button
            onClick={handleNuevaFactura}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      {mostrarFormulario ? (
        <FormularioFactura
          facturaInicial={facturaEditando}
          onGuardar={handleGuardarFactura}
          onCancelar={() => {
            setMostrarFormulario(false);
            setFacturaEditando(null);
          }}
        />
      ) : facturaPreview ? (
        <VistaFactura
          factura={facturaPreview}
          onVolver={() => setFacturaPreview(null)}
          onEditar={() => handleEditarFactura(facturaPreview)}
        />
      ) : (
        <>
          {/* Búsqueda y Filtros */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por cliente o número..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="">Todas las facturas</option>
                <option value="servicios">Solo Servicios</option>
                <option value="productos">Solo Productos</option>
                <option value="mixtas">Mixtas</option>
              </select>
            </div>
          </div>

          {/* Lista de Facturas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Facturas Recientes
              </h2>
            </div>

            {facturas.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay facturas aún
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Crea tu primera factura haciendo clic en "Nueva Factura"
                </p>
                <button
                  onClick={handleNuevaFactura}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Crear Primera Factura
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {facturas.map((factura, index) => (
                  <div
                    key={index}
                    onClick={() => handleVerFactura(factura)}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm font-semibold text-blue-600">
                            {factura.numeroFactura}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(factura.fecha).toLocaleDateString('es-CO')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {factura.cliente.nombre}
                        </h3>
                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {factura.servicios.length > 0 && (
                            <span>{factura.servicios.length} servicio(s)</span>
                          )}
                          {factura.productos.length > 0 && (
                            <span>{factura.productos.length} producto(s)</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${factura.total.toLocaleString('es-CO')}
                        </div>
                        <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          Descargar PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
