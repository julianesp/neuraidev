"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NuevaVentaPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [precioVenta, setPrecioVenta] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');

  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [metodoPago, setMetodoPago] = useState('nequi');
  const [comprobantePago, setComprobantePago] = useState('');
  const [notas, setNotas] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Cargar productos
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function cargarProductos() {
      try {
        const res = await fetch('/api/productos?disponible=true');
        if (!res.ok) throw new Error('Error cargando productos');
        const data = await res.json();
        setProductos(data.productos || []);
      } catch (err) {
        console.error('Error:', err);
        setError('Error cargando productos');
      }
    }

    cargarProductos();
  }, [isLoaded, isSignedIn]);

  // Cuando se selecciona un producto
  const handleProductoChange = (e) => {
    const productoId = e.target.value;
    const producto = productos.find(p => p.id === productoId);

    if (producto) {
      setProductoSeleccionado(producto);
      setPrecioVenta(producto.precio || '');
      setPrecioCompra(producto.precio_compra || '');
    } else {
      setProductoSeleccionado(null);
      setPrecioVenta('');
      setPrecioCompra('');
    }
  };

  // Calcular totales
  const subtotalVenta = (parseFloat(precioVenta) || 0) * cantidad;
  const subtotalCompra = (parseFloat(precioCompra) || 0) * cantidad;
  const gananciaTotal = subtotalVenta - subtotalCompra;
  const margenGanancia = subtotalVenta > 0 ? (gananciaTotal / subtotalVenta) * 100 : 0;

  // Registrar venta
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!productoSeleccionado) {
        throw new Error('Debes seleccionar un producto');
      }

      if (cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      if (!precioVenta || parseFloat(precioVenta) <= 0) {
        throw new Error('El precio de venta debe ser mayor a 0');
      }

      if (!precioCompra || parseFloat(precioCompra) < 0) {
        throw new Error('El precio de compra es requerido');
      }

      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          producto_id: productoSeleccionado.id,
          cantidad,
          precio_venta: parseFloat(precioVenta),
          precio_compra: parseFloat(precioCompra),
          cliente_nombre: clienteNombre || null,
          cliente_telefono: clienteTelefono || null,
          cliente_email: clienteEmail || null,
          metodo_pago: metodoPago,
          comprobante_pago: comprobantePago || null,
          notas: notas || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar la venta');
      }

      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/ventas');
      }, 2000);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return <div className="p-6">Cargando...</div>;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Venta Registrada!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            La venta se ha registrado correctamente
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <p className="text-lg font-bold text-green-700 dark:text-green-400">
              Ganancia: ${gananciaTotal.toLocaleString('es-CO')}
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirigiendo al historial...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard/ganancias"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              ← Volver
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🛒 Registrar Nueva Venta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Completa los datos de la venta
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleccionar producto */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Producto
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar producto *
              </label>
              <select
                value={productoSeleccionado?.id || ''}
                onChange={handleProductoChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">-- Selecciona un producto --</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (Stock: {p.stock}) - ${p.precio?.toLocaleString('es-CO')}
                  </option>
                ))}
              </select>
            </div>

            {productoSeleccionado && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  📦 {productoSeleccionado.nombre}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Precio venta:</span>
                    <span className="font-bold text-gray-900 dark:text-white ml-2">
                      ${(productoSeleccionado.precio || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                    <span className="font-bold text-gray-900 dark:text-white ml-2">
                      {productoSeleccionado.stock} unidades
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  max={productoSeleccionado?.stock || 1}
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio Compra *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precioCompra}
                  onChange={(e) => setPrecioCompra(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio Venta *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Resumen de ganancia */}
          {productoSeleccionado && (
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-bold mb-4">💰 Resumen de Ganancia</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal venta:</span>
                  <span className="font-bold">${subtotalVenta.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo total:</span>
                  <span className="font-bold">-${subtotalCompra.toLocaleString('es-CO')}</span>
                </div>
                <div className="border-t border-green-400 pt-2 mt-2">
                  <div className="flex justify-between text-xl">
                    <span className="font-bold">GANANCIA:</span>
                    <span className="font-bold">${gananciaTotal.toLocaleString('es-CO')}</span>
                  </div>
                  <p className="text-sm text-green-100 text-right">
                    Margen: {margenGanancia.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cliente (opcional) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Cliente (Opcional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Nombre del cliente"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="tel"
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                placeholder="Teléfono"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="email"
                value={clienteEmail}
                onChange={(e) => setClienteEmail(e.target.value)}
                placeholder="Email"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Método de pago */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Método de Pago
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {['nequi', 'efectivo', 'transferencia', 'tarjeta'].map((metodo) => (
                <button
                  key={metodo}
                  type="button"
                  onClick={() => setMetodoPago(metodo)}
                  className={`px-4 py-3 rounded-lg font-medium capitalize transition-colors ${
                    metodoPago === metodo
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {metodo}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={comprobantePago}
              onChange={(e) => setComprobantePago(e.target.value)}
              placeholder="Número de comprobante o referencia (opcional)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Notas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Notas
            </h2>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales sobre la venta..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <Link
              href="/dashboard/ganancias"
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !productoSeleccionado}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
            >
              {loading ? 'Registrando...' : '💾 Registrar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
