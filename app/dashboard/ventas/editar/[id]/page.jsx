"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditarVentaPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    producto_nombre: '',
    cantidad: 1,
    precio_venta: '',
    precio_compra: '',
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_email: '',
    metodo_pago: 'nequi',
    comprobante_pago: '',
    notas: '',
  });

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`/api/ventas/${id}`);
      if (!res.ok) throw new Error('Venta no encontrada');
      const data = await res.json();
      setForm({
        producto_nombre: data.producto_nombre || '',
        cantidad: data.cantidad || 1,
        precio_venta: data.precio_venta || '',
        precio_compra: data.precio_compra || '',
        cliente_nombre: data.cliente_nombre || '',
        cliente_telefono: data.cliente_telefono || '',
        cliente_email: data.cliente_email || '',
        metodo_pago: data.metodo_pago || 'nequi',
        comprobante_pago: data.comprobante_pago || '',
        notas: data.notas || '',
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const subtotalVenta = (parseFloat(form.precio_venta) || 0) * (parseInt(form.cantidad) || 0);
  const subtotalCompra = (parseFloat(form.precio_compra) || 0) * (parseInt(form.cantidad) || 0);
  const ganancia = subtotalVenta - subtotalCompra;
  const margen = subtotalVenta > 0 ? (ganancia / subtotalVenta) * 100 : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/ventas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      router.push('/dashboard/ventas');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/ventas" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Venta</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Modifica los datos de la venta</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Producto */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Producto</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del producto *</label>
            <input
              type="text" required value={form.producto_nombre} onChange={set('producto_nombre')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cantidad *</label>
              <input
                type="number" min="1" required value={form.cantidad} onChange={set('cantidad')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio compra *</label>
              <input
                type="number" min="0" step="0.01" required value={form.precio_compra} onChange={set('precio_compra')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio venta *</label>
              <input
                type="number" min="0" step="0.01" required value={form.precio_venta} onChange={set('precio_venta')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Resumen ganancia en tiempo real */}
          {form.precio_venta && form.precio_compra && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2.5 text-center">
                <p className="text-xs text-gray-500">Total venta</p>
                <p className="font-bold text-purple-600 text-sm">${subtotalVenta.toLocaleString('es-CO')}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 text-center">
                <p className="text-xs text-gray-500">Ganancia</p>
                <p className="font-bold text-green-600 text-sm">${ganancia.toLocaleString('es-CO')}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2.5 text-center">
                <p className="text-xs text-gray-500">Margen</p>
                <p className="font-bold text-yellow-600 text-sm">{margen.toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Cliente */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Cliente (opcional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="text" value={form.cliente_nombre} onChange={set('cliente_nombre')} placeholder="Nombre"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            <input type="tel" value={form.cliente_telefono} onChange={set('cliente_telefono')} placeholder="Teléfono"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            <input type="email" value={form.cliente_email} onChange={set('cliente_email')} placeholder="Email"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
        </div>

        {/* Pago */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Método de pago</h2>
          <div className="grid grid-cols-4 gap-2">
            {['nequi', 'efectivo', 'transferencia', 'tarjeta'].map(m => (
              <button key={m} type="button" onClick={() => setForm(prev => ({ ...prev, metodo_pago: m }))}
                className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  form.metodo_pago === m ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}>
                {m}
              </button>
            ))}
          </div>
          <input type="text" value={form.comprobante_pago} onChange={set('comprobante_pago')}
            placeholder="Número de comprobante (opcional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
        </div>

        {/* Notas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Notas</h2>
          <textarea value={form.notas} onChange={set('notas')} rows={3} placeholder="Notas adicionales..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <Link href="/dashboard/ventas"
            className="flex-1 py-3 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium">
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
