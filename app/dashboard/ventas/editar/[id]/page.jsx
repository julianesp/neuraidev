"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Search, X, Package, Wrench, PencilLine } from 'lucide-react';

// tipo: 'producto' (de la tienda, descuenta stock) | 'servicio' (trabajo técnico) | 'manual'
const itemVacio = (tipo = 'producto') => ({
  tipo, producto_id: null, producto_nombre: '', cantidad: 1, precio_compra: tipo === 'servicio' ? '0' : '',
  precio_venta: '', numero_serie: '', stock: null, busqueda: '', abierto: false,
});

// Servicios técnicos frecuentes. El precio se escribe en cada venta.
const SERVICIOS_TECNICOS = [
  'Formateo de computador + instalación de Windows',
  'Formateo de computador + instalación de Linux',
  'Mantenimiento preventivo (limpieza interna y cambio de pasta térmica)',
  'Instalación de SSD / componente',
  'Instalación de programas',
  'Diagnóstico técnico',
];

const TIPOS = [
  { id: 'producto', label: 'Producto de la tienda', icon: Package },
  { id: 'servicio', label: 'Servicio técnico', icon: Wrench },
  { id: 'manual', label: 'Otro (manual)', icon: PencilLine },
];

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
    codigo_barras: '',
    numero_serie: '',
    notas: '',
  });

  // Fecha original: los extras la reutilizan para salir en la misma factura
  const [fechaVenta, setFechaVenta] = useState(null);

  // Productos adicionales a agregar
  const [extras, setExtras] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch('/api/productos?disponible=true')
      .then(r => (r.ok ? r.json() : { productos: [] }))
      .then(d => setProductos(d.productos || []))
      .catch(() => setProductos([]));
  }, []);

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
        codigo_barras: data.codigo_barras || '',
        numero_serie: data.numero_serie || '',
        notas: data.notas || '',
      });
      setFechaVenta(data.fecha_venta || null);
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

  function cambiarTipo(i, tipo) {
    setExtras(prev => prev.map((item, idx) => idx === i ? itemVacio(tipo) : item));
  }

  function seleccionarProducto(i, p) {
    setExtras(prev => prev.map((item, idx) => idx === i ? {
      ...item,
      producto_id: p.id,
      producto_nombre: p.nombre,
      precio_venta: p.precio ?? '',
      precio_compra: p.precio_compra ?? '',
      stock: p.stock ?? null,
      busqueda: p.nombre,
      abierto: false,
    } : item));
  }

  function productosFiltrados(texto) {
    const t = texto.trim().toLowerCase();
    if (!t) return productos.slice(0, 30);
    return productos.filter(p =>
      p.nombre?.toLowerCase().includes(t) ||
      p.categoria?.toLowerCase().includes(t) ||
      p.codigo_barras?.includes(t)
    ).slice(0, 30);
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
    setError(null);
    const sinElegir = extras.find(x => x.tipo === 'producto' && !x.producto_id);
    if (sinElegir) {
      setError('Elige un producto de la lista o cambia el tipo a "Otro (manual)"');
      return;
    }
    const sinStock = extras.find(x => x.tipo === 'producto' && x.stock != null && (parseInt(x.cantidad) || 0) > x.stock);
    if (sinStock) {
      setError(`Stock insuficiente de "${sinStock.producto_nombre}". Disponible: ${sinStock.stock}`);
      return;
    }
    setSaving(true);
    try {
      // 1. Actualizar venta original
      const res = await fetch(`/api/ventas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      // 2. Insertar productos extras como nuevas ventas (misma fecha que la original)
      const extrasValidos = extras.filter(e => e.producto_nombre.trim());
      for (const extra of extrasValidos) {
        const desdeTienda = extra.tipo === 'producto' && extra.producto_id;
        const resExtra = await fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            producto_id: desdeTienda ? extra.producto_id : null,
            producto_nombre_manual: desdeTienda ? null : extra.producto_nombre.trim(),
            numero_serie: extra.numero_serie || null,
            fecha_venta: fechaVenta,
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código de barras / EAN</label>
              <input type="text" value={form.codigo_barras} onChange={set('codigo_barras')} placeholder="Ej: 7702004003457"
                inputMode="numeric" autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">N° de serie / IMEI</label>
              <input type="text" value={form.numero_serie} onChange={set('numero_serie')} placeholder="Ej: 356938035643809"
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <p className="md:col-span-2 text-xs text-gray-500 dark:text-gray-400">
              🔒 Opcional. Respaldo frente a reclamos.
            </p>
          </div>
        </div>

        {/* Productos y servicios adicionales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-gray-900 dark:text-white">Productos y servicios adicionales</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => setExtras(prev => [...prev, itemVacio('producto')])}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                <Plus className="w-4 h-4" /> Producto
              </button>
              <button type="button" onClick={() => setExtras(prev => [...prev, itemVacio('servicio')])}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                <Wrench className="w-4 h-4" /> Servicio técnico
              </button>
            </div>
          </div>

          {extras.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
              Agrega productos de la tienda o servicios como el formateo. Saldrán en la misma factura.
            </p>
          ) : (
            <div className="space-y-3">
              {extras.map((item, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {TIPOS.map(({ id: t, label, icon: Icon }) => (
                        <button key={t} type="button" onClick={() => item.tipo !== t && cambiarTipo(i, t)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                            item.tipo === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                          }`}>
                          <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => setExtras(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1" aria-label="Quitar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.tipo === 'producto' && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={item.busqueda} autoComplete="off"
                        onChange={e => setExtras(prev => prev.map((x, idx) => idx === i
                          ? { ...x, busqueda: e.target.value, abierto: true, producto_id: null, producto_nombre: '', stock: null }
                          : x))}
                        onFocus={() => actualizarExtra(i, 'abierto', true)}
                        onBlur={() => setTimeout(() => actualizarExtra(i, 'abierto', false), 150)}
                        placeholder="Buscar producto de la tienda (nombre, categoría o código)..."
                        className="w-full pl-9 pr-9 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                      {item.busqueda && (
                        <button type="button" onClick={() => cambiarTipo(i, 'producto')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Limpiar">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {item.abierto && !item.producto_id && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                          {productosFiltrados(item.busqueda).length === 0 ? (
                            <p className="p-3 text-sm text-center text-gray-500">No se encontraron productos con stock</p>
                          ) : productosFiltrados(item.busqueda).map(p => (
                            <button key={p.id} type="button" onMouseDown={e => e.preventDefault()} onClick={() => seleccionarProducto(i, p)}
                              className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.nombre}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Stock: {p.stock}{p.categoria ? ` · ${p.categoria}` : ''}</p>
                              </div>
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 shrink-0">
                                ${Number(p.precio || 0).toLocaleString('es-CO')}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {item.producto_id && item.stock != null && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Stock disponible: {item.stock} (se descuenta al guardar)</p>
                      )}
                    </div>
                  )}

                  {item.tipo === 'servicio' && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {SERVICIOS_TECNICOS.map(nombre => (
                          <button key={nombre} type="button" onClick={() => actualizarExtra(i, 'producto_nombre', nombre)}
                            className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                              item.producto_nombre === nombre
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                            }`}>
                            {nombre}
                          </button>
                        ))}
                      </div>
                      <input type="text" value={item.producto_nombre}
                        onChange={e => actualizarExtra(i, 'producto_nombre', e.target.value)}
                        placeholder="Descripción del servicio (puedes editarla)" required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                  )}

                  {item.tipo === 'manual' && (
                    <input type="text" value={item.producto_nombre}
                      onChange={e => actualizarExtra(i, 'producto_nombre', e.target.value)}
                      placeholder="Nombre del producto (no está en la tienda)" required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
                      <input type="number" min="1" value={item.cantidad}
                        onChange={e => actualizarExtra(i, 'cantidad', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{item.tipo === 'servicio' ? 'Costo (repuestos)' : 'Precio compra'}</label>
                      <input type="number" min="0" step="0.01" value={item.precio_compra}
                        onChange={e => actualizarExtra(i, 'precio_compra', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{item.tipo === 'servicio' ? 'Precio cobrado' : 'Precio venta'}</label>
                      <input type="number" min="0" step="0.01" value={item.precio_venta}
                        onChange={e => actualizarExtra(i, 'precio_venta', e.target.value)}
                        placeholder="0" required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                  </div>

                  {item.tipo !== 'servicio' && (
                    <input type="text" value={item.numero_serie} autoComplete="off"
                      onChange={e => actualizarExtra(i, 'numero_serie', e.target.value)}
                      placeholder="N° de serie / IMEI (opcional, respaldo frente a reclamos)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen total */}
        {(form.precio_venta || extras.length > 0) && (
          <div className="bg-blue-600 rounded-xl p-4 text-white">
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
            {saving ? 'Guardando...' : extras.length > 0 ? `Guardar (${1 + extras.length} ítems)` : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
