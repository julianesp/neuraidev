"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

const itemVacio = () => ({ producto_nombre: '', cantidad: 1, precio_compra: '', precio_venta: '' });

export default function EditarVentaPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Producto original (editable)
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

  // Productos adicionales a agregar
  const [extras, setExtras] = useState([]);

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

  function actualizarExtra(i, campo, valor) {
    setExtras(prev => prev.map((item, idx) => idx === i ? { ...item, [campo]: valor } : item));
  }

  // Totales del producto original
  const subtotalVenta = (parseFloat(form.precio_venta) || 0) * (parseInt(form.cantidad) || 0);
  const subtotalCompra = (parseFloat(form.precio_compra) || 0) * (parseInt(form.cantidad) || 0);
  const gananciaOriginal = subtotalVenta - subtotalCompra;

  // Totales de extras
  const totalExtrasVenta = extras.reduce((s, e) => s + (parseFloat(e.precio_venta) || 0) * (parseInt(e.cantidad) || 0), 0);
  const totalExtrasCompra = extras.reduce((s, e) => s + (parseFloat(e.precio_compra) || 0) * (parseInt(e.cantidad) || 0), 0);

  // Gran total
  const granTotalVenta = subtotalVenta + totalExtrasVenta;
  const granTotalGanancia = gananciaOriginal + (totalExtrasVenta - totalExtrasCompra);
  const granMargen = granTotalVenta > 0 ? (granTotalGanancia / granTotalVenta) * 100 : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // 1. Actualizar venta original
      const res = await fetch(`/api/ventas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      // 2. Insertar productos extras como nuevas ventas
      const extrasValidos = extras.filter(e => e.producto_nombre.trim());
      for (const extra of extrasValidos) {
        const resExtra = await fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            producto_nombre_manual: extra.producto_nombre.trim(),
            cantidad: parseInt(extra.cantidad) || 1,
            precio_venta: parseFloat(extra.precio_venta) || 0,
            precio_compra: parseFloat(extra.precio_compra) || 0,
            cliente_nombre: form.cliente_nombre || null,
            cliente_telefono: form.cliente_telefono || null,
            cliente_email: form.cliente_email || null,
            metodo_pago: form.metodo_pago,
            comprobante_pago: form.comprobante_pago || null,
            notas: form.notas || null,
          }),
        });
        if (!resExtra.ok) {
          const errData = await resExtra.json();
          throw new Error(`Error al agregar "${extra.producto_nombre}": ${errData.error}`);
        }
      }

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
          <p className="text-sm text-gray-500 dark:text-gray-400">Modifica el producto o agrega más al mismo cliente</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Producto original */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Producto vendido</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
            <input type="text" required value={form.producto_nombre} onChange={set('producto_nombre')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cantidad *</label>
              <input type="number" min="1" required value={form.cantidad} onChange={set('cantidad')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio compra *</label>
              <input type="number" min="0" step="0.01" required value={form.precio_compra} onChange={set('precio_compra')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio venta *</label>
              <input type="number" min="0" step="0.01" required value={form.precio_venta} onChange={set('precio_venta')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Productos adicionales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Productos adicionales</h2>
            <button type="button" onClick={() => setExtras(prev => [...prev, itemVacio()])}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 transition-colors">
              <Plus className="w-4 h-4" /> Agregar producto
            </button>
          </div>

          {extras.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
              Haz clic en "Agregar producto" para incluir más productos a esta venta
            </p>
          ) : (
            <div className="space-y-3">
              {extras.map((item, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Producto {i + 2}</span>
                    <button type="button" onClick={() => setExtras(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input type="text" value={item.producto_nombre}
                    onChange={e => actualizarExtra(i, 'producto_nombre', e.target.value)}
                    placeholder="Nombre del producto" required={extras.length > 0}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
                      <input type="number" min="1" value={item.cantidad}
                        onChange={e => actualizarExtra(i, 'cantidad', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Precio compra</label>
                      <input type="number" min="0" step="0.01" value={item.precio_compra}
                        onChange={e => actualizarExtra(i, 'precio_compra', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Precio venta</label>
                      <input type="number" min="0" step="0.01" value={item.precio_venta}
                        onChange={e => actualizarExtra(i, 'precio_venta', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen total */}
        {(form.precio_venta || extras.length > 0) && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
            <p className="text-sm font-semibold mb-3">Resumen total de la venta</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 rounded-lg p-2.5 text-center">
                <p className="text-xs opacity-80">Total venta</p>
                <p className="font-bold">${granTotalVenta.toLocaleString('es-CO')}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2.5 text-center">
                <p className="text-xs opacity-80">Ganancia</p>
                <p className="font-bold">${granTotalGanancia.toLocaleString('es-CO')}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2.5 text-center">
                <p className="text-xs opacity-80">Margen</p>
                <p className="font-bold">{granMargen.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

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
          <textarea value={form.notas} onChange={set('notas')} rows={2} placeholder="Notas adicionales..."
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
            {saving ? 'Guardando...' : extras.length > 0 ? `Guardar (${1 + extras.length} productos)` : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
