"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingBag, Calendar, ChevronDown, ChevronUp, Package, TrendingDown, Pencil } from "lucide-react";
import Link from "next/link";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function agruparPorMes(compras) {
  const grupos = {};
  for (const c of compras) {
    const fecha = new Date(c.fecha_compra);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(c);
  }
  return Object.entries(grupos).sort(([a], [b]) => b.localeCompare(a));
}

function labelMes(key) {
  const [year, month] = key.split('-');
  return `${MESES[parseInt(month) - 1]} ${year}`;
}

const itemVacio = () => ({ producto_nombre: '', cantidad: 1, precio_unitario: '' });

export default function ComprasPage() {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [mesesAbiertos, setMesesAbiertos] = useState({});

  // Formulario
  const [items, setItems] = useState([itemVacio()]);
  const [proveedor, setProveedor] = useState('');
  const [notas, setNotas] = useState('');
  const [fechaCompra, setFechaCompra] = useState(() => new Date().toISOString().split('T')[0]);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);

  useEffect(() => {
    cargarCompras();
  }, []);

  async function cargarCompras() {
    try {
      setLoading(true);
      const res = await fetch('/api/compras');
      if (!res.ok) throw new Error('Error cargando compras');
      const data = await res.json();
      const lista = data.compras || [];
      setCompras(lista);
      // Extraer proveedores únicos no vacíos
      const unicos = [...new Set(lista.map(c => c.proveedor).filter(Boolean))].sort();
      setProveedores(unicos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function actualizarItem(index, campo, valor) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [campo]: valor } : item));
  }

  function agregarItem() {
    setItems(prev => [...prev, itemVacio()]);
  }

  function eliminarItem(index) {
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  const totalCompra = items.reduce((s, item) => {
    const cant = parseInt(item.cantidad) || 0;
    const precio = parseFloat(item.precio_unitario) || 0;
    return s + cant * precio;
  }, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      const itemsValidos = items.filter(i => i.producto_nombre.trim());
      if (itemsValidos.length === 0) throw new Error('Agrega al menos un producto');

      const res = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsValidos.map(i => ({
            producto_nombre: i.producto_nombre.trim(),
            cantidad: parseInt(i.cantidad) || 1,
            precio_unitario: parseFloat(i.precio_unitario) || 0,
          })),
          proveedor: proveedor.trim() || null,
          notas: notas.trim() || null,
          fecha_compra: fechaCompra,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      setExito(true);
      setItems([itemVacio()]);
      setProveedor('');
      setNotas('');
      setFechaCompra(new Date().toISOString().split('T')[0]);
      setTimeout(() => setExito(false), 3000);
      await cargarCompras();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  const totalGastado = compras.reduce((s, c) => s + (c.subtotal || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-orange-500" /> Registro de Compras
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Registra lo que compras para revender y calcula tu ganancia real
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total invertido</p>
          <p className="text-xl font-bold text-orange-600">${totalGastado.toLocaleString('es-CO')}</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <button
          type="button"
          onClick={() => setMostrarFormulario(v => !v)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-500" /> Nueva Compra
          </span>
          {mostrarFormulario ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {mostrarFormulario && (
          <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4 border-t border-gray-100 dark:border-gray-700">

            {/* Fecha, proveedor y notas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de compra *</label>
                <input
                  type="date"
                  value={fechaCompra}
                  onChange={e => setFechaCompra(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor (opcional)</label>
                <input
                  type="text"
                  list="proveedores-list"
                  value={proveedor}
                  onChange={e => setProveedor(e.target.value)}
                  placeholder="Nombre del proveedor o tienda"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
                <datalist id="proveedores-list">
                  {proveedores.map(p => <option key={p} value={p} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas (opcional)</label>
                <input
                  type="text"
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Ej: Compra en Éxito, mayorista..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Tabla de productos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Productos comprados</label>
                <button
                  type="button"
                  onClick={agregarItem}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar producto
                </button>
              </div>

              <div className="space-y-2">
                {/* Cabecera */}
                <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
                  <div className="col-span-6">Nombre del producto</div>
                  <div className="col-span-2 text-center">Cantidad</div>
                  <div className="col-span-3">Precio compra c/u</div>
                  <div className="col-span-1"></div>
                </div>

                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-12 md:col-span-6">
                      <input
                        type="text"
                        value={item.producto_nombre}
                        onChange={e => actualizarItem(i, 'producto_nombre', e.target.value)}
                        placeholder="Nombre del producto"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={e => actualizarItem(i, 'cantidad', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-center focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div className="col-span-7 md:col-span-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.precio_unitario}
                          onChange={e => actualizarItem(i, 'precio_unitario', e.target.value)}
                          placeholder="0"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {items.length > 1 && (
                        <button type="button" onClick={() => eliminarItem(i)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total a invertir:</span>
              <span className="text-xl font-bold text-orange-600">${totalCompra.toLocaleString('es-CO')}</span>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
            {exito && <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">✅ Compra registrada exitosamente</p>}

            <button
              type="submit"
              disabled={guardando}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
            >
              {guardando ? 'Guardando...' : '💾 Registrar Compra'}
            </button>
          </form>
        )}
      </div>

      {/* Historial agrupado por mes */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500">Cargando historial...</p>
        </div>
      ) : compras.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Aún no hay compras registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agruparPorMes(compras).map(([mesKey, comprasMes]) => {
            const totalMes = comprasMes.reduce((s, c) => s + (c.subtotal || 0), 0);
            const totalUnidades = comprasMes.reduce((s, c) => s + (c.cantidad || 0), 0);
            const abierto = mesesAbiertos[mesKey] !== false;

            return (
              <div key={mesKey} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                {/* Cabecera mes */}
                <button
                  type="button"
                  onClick={() => setMesesAbiertos(prev => ({ ...prev, [mesKey]: !abierto }))}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">{labelMes(mesKey)}</p>
                      <p className="text-xs text-gray-500">{comprasMes.length} registro{comprasMes.length !== 1 ? 's' : ''} · {totalUnidades} unidades</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total invertido</p>
                      <p className="font-bold text-orange-600">${totalMes.toLocaleString('es-CO')}</p>
                    </div>
                    {abierto ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>

                {abierto && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {comprasMes.map((compra, i) => (
                      <div key={compra.id || i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Package className="w-4 h-4 text-orange-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{compra.producto_nombre}</p>
                              <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(compra.fecha_compra).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {compra.proveedor && <span>📦 {compra.proveedor}</span>}
                                {compra.notas && <span>📝 {compra.notas}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4 flex flex-col items-end gap-1.5">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">${(compra.subtotal || 0).toLocaleString('es-CO')}</p>
                            <p className="text-xs text-gray-500">{compra.cantidad} u × ${(compra.precio_unitario || 0).toLocaleString('es-CO')}</p>
                            <Link
                              href={`/dashboard/compras/editar/${compra.id}`}
                              className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            >
                              <Pencil className="w-3 h-3" /> Editar
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pie del mes */}
                    <div className="px-4 py-3 bg-orange-50 dark:bg-orange-900/10 flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <TrendingDown className="w-4 h-4 text-orange-500" /> Total invertido en {labelMes(mesKey)}
                      </span>
                      <span className="font-bold text-orange-600 text-lg">${totalMes.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
