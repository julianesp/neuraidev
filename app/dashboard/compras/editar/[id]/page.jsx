"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShoppingBag, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditarCompraPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const [productoNombre, setProductoNombre] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [notas, setNotas] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`/api/compras/${id}`);
        if (!res.ok) throw new Error('Compra no encontrada');
        const data = await res.json();

        setProductoNombre(data.producto_nombre || '');
        setCantidad(data.cantidad || 1);
        setPrecioUnitario(data.precio_unitario ?? '');
        setProveedor(data.proveedor || '');
        setNotas(data.notas || '');
        // Convert ISO to YYYY-MM-DD for date input
        setFechaCompra(data.fecha_compra ? data.fecha_compra.split('T')[0] : '');
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [id]);

  const subtotal = (parseInt(cantidad) || 0) * (parseFloat(precioUnitario) || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      const res = await fetch(`/api/compras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_nombre: productoNombre,
          cantidad: parseInt(cantidad),
          precio_unitario: parseFloat(precioUnitario),
          proveedor: proveedor.trim() || null,
          notas: notas.trim() || null,
          fecha_compra: fechaCompra,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      router.push('/dashboard/compras');
    } catch (e) {
      setError(e.message);
      setGuardando(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-gray-500">Cargando compra...</p>
      </div>
    );
  }

  if (error && !productoNombre) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/dashboard/compras" className="text-orange-500 hover:underline">Volver al historial</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/compras"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-500" /> Editar Compra
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Modifica los detalles de esta compra</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del producto *
            </label>
            <input
              type="text"
              value={productoNombre}
              onChange={e => setProductoNombre(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nombre del producto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cantidad *
              </label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-center focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Precio unitario *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioUnitario}
                  onChange={e => setPrecioUnitario(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de compra *
            </label>
            <input
              type="date"
              value={fechaCompra}
              onChange={e => setFechaCompra(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proveedor (opcional)
            </label>
            <input
              type="text"
              value={proveedor}
              onChange={e => setProveedor(e.target.value)}
              placeholder="Nombre del proveedor o tienda"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas (opcional)
            </label>
            <input
              type="text"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ej: Compra en Éxito, mayorista..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Subtotal preview */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="text-xl font-bold text-orange-600">${subtotal.toLocaleString('es-CO')}</span>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard/compras"
              className="flex-1 py-3 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
