"use client";

import { useState } from "react";
import { Plus, Trash2, Save, X, Search } from "lucide-react";

export default function FormularioFactura({ facturaInicial, onGuardar, onCancelar }) {
  const [miContacto, setMiContacto] = useState({
    telefono: facturaInicial?.miContacto?.telefono || "",
    email: facturaInicial?.miContacto?.email || "",
  });

  const [cliente, setCliente] = useState(facturaInicial?.cliente || {
    nombre: "",
    identificacion: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  const [servicios, setServicios] = useState(
    facturaInicial?.servicios.length > 0
      ? facturaInicial.servicios
      : [{ id: 1, descripcion: "", cantidad: "", precio: "" }]
  );

  const [productos, setProductos] = useState(facturaInicial?.productos || []);

  const [notas, setNotas] = useState(facturaInicial?.notas || "");
  const [metodoPago, setMetodoPago] = useState(facturaInicial?.metodoPago || "efectivo");

  // Generar número de factura
  const generarNumeroFactura = () => {
    // Si estamos editando, mantener el número original
    if (facturaInicial?.numeroFactura) {
      return facturaInicial.numeroFactura;
    }
    const fecha = new Date();
    const año = fecha.getFullYear();
    const numero = Math.floor(Math.random() * 9999) + 1;
    return `FACT-${año}-${String(numero).padStart(4, '0')}`;
  };

  const agregarServicio = () => {
    setServicios([
      ...servicios,
      { id: Date.now(), descripcion: "", cantidad: "", precio: "" }
    ]);
  };

  const eliminarServicio = (id) => {
    if (servicios.length > 1) {
      setServicios(servicios.filter(s => s.id !== id));
    }
  };

  const actualizarServicio = (id, campo, valor) => {
    setServicios(servicios.map(s =>
      s.id === id ? { ...s, [campo]: valor } : s
    ));
  };

  const agregarProducto = () => {
    setProductos([
      ...productos,
      { id: Date.now(), nombre: "", cantidad: "", precio: "" }
    ]);
  };

  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  const actualizarProducto = (id, campo, valor) => {
    setProductos(productos.map(p =>
      p.id === id ? { ...p, [campo]: valor } : p
    ));
  };

  const calcularTotal = () => {
    const totalServicios = servicios.reduce((sum, s) =>
      sum + (parseFloat(s.precio) || 0) * (parseInt(s.cantidad) || 0), 0
    );
    const totalProductos = productos.reduce((sum, p) =>
      sum + (parseFloat(p.precio) || 0) * (parseInt(p.cantidad) || 0), 0
    );
    return totalServicios + totalProductos;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const factura = {
      numeroFactura: generarNumeroFactura(),
      fecha: facturaInicial?.fecha || new Date().toISOString(),
      miContacto,
      cliente,
      servicios: servicios.filter(s => s.descripcion && s.precio > 0),
      productos: productos.filter(p => p.nombre && p.precio > 0),
      total: calcularTotal(),
      metodoPago,
      notas,
    };

    onGuardar(factura);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información de Contacto de neurai.dev */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-md p-6 border-2 border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-blue-600">📱</span> Tu Información de Contacto
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Esta información aparecerá en la factura para que el cliente pueda contactarte
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tu Número de Celular *
            </label>
            <input
              type="tel"
              required
              value={miContacto.telefono}
              onChange={(e) => setMiContacto({ ...miContacto, telefono: e.target.value })}
              placeholder="Ej: +57 300 123 4567"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tu Correo Corporativo *
            </label>
            <input
              type="email"
              required
              value={miContacto.email}
              onChange={(e) => setMiContacto({ ...miContacto, email: e.target.value })}
              placeholder="Ej: contacto@neurai.dev"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Información del Cliente */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Información del Cliente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre Completo / Razón Social *
            </label>
            <input
              type="text"
              required
              value={cliente.nombre}
              onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez o TechCorp S.A.S."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cédula / NIT
            </label>
            <input
              type="text"
              value={cliente.identificacion}
              onChange={(e) => setCliente({ ...cliente, identificacion: e.target.value })}
              placeholder="Ej: 1234567890"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={cliente.telefono}
              onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
              placeholder="Ej: 3001234567"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={cliente.email}
              onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
              placeholder="cliente@ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={cliente.direccion}
              onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
              placeholder="Calle 123 #45-67"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Servicios Prestados */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Servicios Técnicos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Describe los servicios prestados (formateo, instalación, reparación, etc.)
            </p>
          </div>
          <button
            type="button"
            onClick={agregarServicio}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Servicio
          </button>
        </div>

        {/* Etiquetas de columnas */}
        <div className="grid grid-cols-12 gap-3 mb-2 px-1">
          <div className="col-span-12 md:col-span-6">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
              Descripción del Servicio
            </label>
          </div>
          <div className="col-span-5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
              Cantidad
            </label>
          </div>
          <div className="col-span-5 md:col-span-3">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
              Precio Unitario
            </label>
          </div>
        </div>

        <div className="space-y-3">
          {servicios.map((servicio, index) => (
            <div key={servicio.id} className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-12 md:col-span-6">
                <input
                  type="text"
                  placeholder="Ej: Formateo de equipo + instalación Windows 11"
                  value={servicio.descripcion}
                  onChange={(e) => actualizarServicio(servicio.id, 'descripcion', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="col-span-5 md:col-span-2">
                <input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={servicio.cantidad}
                  onChange={(e) => actualizarServicio(servicio.id, 'cantidad', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="col-span-5 md:col-span-3">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="50000"
                  value={servicio.precio}
                  onChange={(e) => actualizarServicio(servicio.id, 'precio', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                {servicios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarServicio(servicio.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Productos Vendidos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Productos Vendidos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Agrega productos físicos vendidos al cliente (opcional)
            </p>
          </div>
          <button
            type="button"
            onClick={agregarProducto}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Producto
          </button>
        </div>

        {productos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No hay productos agregados. Haz clic en "Agregar Producto" si vendiste algún producto.
          </p>
        ) : (
          <>
            {/* Etiquetas de columnas */}
            <div className="grid grid-cols-12 gap-3 mb-2 px-1">
              <div className="col-span-12 md:col-span-6">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Nombre del Producto
                </label>
              </div>
              <div className="col-span-5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Cantidad
                </label>
              </div>
              <div className="col-span-5 md:col-span-3">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Precio Unitario
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {productos.map((producto) => (
                <div key={producto.id} className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-12 md:col-span-6">
                    <input
                      type="text"
                      placeholder="Ej: Cable HDMI 2.0 de 2 metros"
                      value={producto.nombre}
                      onChange={(e) => actualizarProducto(producto.id, 'nombre', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={producto.cantidad}
                      onChange={(e) => actualizarProducto(producto.id, 'cantidad', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="25000"
                      value={producto.precio}
                      onChange={(e) => actualizarProducto(producto.id, 'precio', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => eliminarProducto(producto.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Resumen y Pago */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Información de Pago
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Método de Pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="efectivo">Efectivo</option>
              <option value="nequi">Nequi</option>
              <option value="transferencia">Transferencia Bancaria</option>
              <option value="tarjeta">Tarjeta de Crédito/Débito</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Información adicional sobre la factura..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Total */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2 max-w-md ml-auto">
            <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white">
              <span>Total a Pagar:</span>
              <span className="text-blue-600">
                ${calcularTotal().toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={onCancelar}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Save className="w-5 h-5" />
          Generar Factura
        </button>
      </div>
    </form>
  );
}
