"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Star, Gift, X, Package as PackageIcon, Plus, Trash2 } from 'lucide-react';

export default function NuevaVentaPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [productos, setProductos] = useState([]);

  // Lista de productos agregados a la venta
  const [itemsVenta, setItemsVenta] = useState([]);

  // Estado del formulario "agregar producto"
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [precioVenta, setPrecioVenta] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [mostrarListaProductos, setMostrarListaProductos] = useState(false);

  // Producto manual (no en inventario)
  const [esProductoManual, setEsProductoManual] = useState(false);
  const [nombreProductoManual, setNombreProductoManual] = useState('');

  // Clientes frecuentes
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarBusquedaCliente, setMostrarBusquedaCliente] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState("");

  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [metodoPago, setMetodoPago] = useState('nequi');
  const [comprobantePago, setComprobantePago] = useState('');
  const [notas, setNotas] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Cargar productos y clientes
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function cargarDatos() {
      try {
        // Cargar productos
        const resProductos = await fetch('/api/productos?disponible=true');
        if (resProductos.ok) {
          const dataProductos = await resProductos.json();
          setProductos(dataProductos.productos || []);
        }

        // Cargar clientes frecuentes
        const resClientes = await fetch('/api/clientes');
        if (resClientes.ok) {
          const dataClientes = await resClientes.json();
          setClientes(dataClientes.clientes || []);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error cargando datos');
      }
    }

    cargarDatos();
  }, [isLoaded, isSignedIn]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.producto-search-container')) {
        setMostrarListaProductos(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Seleccionar cliente frecuente
  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setClienteNombre(cliente.nombre);
    setClienteTelefono(cliente.telefono || '');
    setClienteEmail(cliente.email || '');
    setMostrarBusquedaCliente(false);
    setBusquedaCliente("");
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    (c.telefono && c.telefono.includes(busquedaCliente)) ||
    (c.identificacion && c.identificacion.includes(busquedaCliente))
  );

  // Seleccionar producto
  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setPrecioVenta(producto.precio || '');
    setPrecioCompra(producto.precio_compra || '');
    setBusquedaProducto(producto.nombre);
    setMostrarListaProductos(false);
  };

  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter(p => {
    if (!busquedaProducto) return true;
    const searchTerm = busquedaProducto.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(searchTerm) ||
      p.categoria?.toLowerCase().includes(searchTerm) ||
      p.slug?.toLowerCase().includes(searchTerm)
    );
  });

  // Resetear el formulario de "agregar producto"
  const resetFormularioProducto = () => {
    setProductoSeleccionado(null);
    setCantidad(1);
    setPrecioVenta('');
    setPrecioCompra('');
    setBusquedaProducto('');
    setMostrarListaProductos(false);
    setEsProductoManual(false);
    setNombreProductoManual('');
  };

  // Agregar el producto actual a la lista de la venta
  const agregarProducto = () => {
    setError(null);

    // Validar producto (del inventario o manual)
    if (!esProductoManual && !productoSeleccionado) {
      setError('Selecciona un producto o activa "Producto no en inventario"');
      return;
    }
    if (esProductoManual && !nombreProductoManual.trim()) {
      setError('Ingresa el nombre del producto');
      return;
    }
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    if (!precioVenta || parseFloat(precioVenta) <= 0) {
      setError('El precio de venta debe ser mayor a 0');
      return;
    }
    if (precioCompra === '' || parseFloat(precioCompra) < 0) {
      setError('El precio de compra es requerido');
      return;
    }

    // Validar stock del inventario considerando lo ya agregado
    if (!esProductoManual && productoSeleccionado) {
      const yaAgregado = itemsVenta
        .filter(i => i.producto_id === productoSeleccionado.id)
        .reduce((sum, i) => sum + i.cantidad, 0);
      if (yaAgregado + cantidad > (productoSeleccionado.stock ?? 0)) {
        setError(`Stock insuficiente para "${productoSeleccionado.nombre}". Disponible: ${productoSeleccionado.stock}, ya agregado: ${yaAgregado}`);
        return;
      }
    }

    const nuevoItem = {
      // ID local único para poder renderizar/eliminar
      _key: crypto.randomUUID(),
      producto_id: esProductoManual ? null : productoSeleccionado.id,
      nombre: esProductoManual ? nombreProductoManual.trim() : productoSeleccionado.nombre,
      es_manual: esProductoManual,
      cantidad,
      precio_venta: parseFloat(precioVenta),
      precio_compra: parseFloat(precioCompra),
    };

    setItemsVenta((prev) => [...prev, nuevoItem]);
    resetFormularioProducto();
  };

  // Eliminar un producto de la lista
  const eliminarProducto = (key) => {
    setItemsVenta((prev) => prev.filter((i) => i._key !== key));
  };

  // Calcular totales de un item
  const totalesItem = (item) => {
    const subtotalVenta = item.precio_venta * item.cantidad;
    const subtotalCompra = item.precio_compra * item.cantidad;
    return {
      subtotalVenta,
      subtotalCompra,
      ganancia: subtotalVenta - subtotalCompra,
    };
  };

  // Totales globales de la venta
  const subtotalVenta = itemsVenta.reduce((sum, i) => sum + i.precio_venta * i.cantidad, 0);
  const subtotalCompra = itemsVenta.reduce((sum, i) => sum + i.precio_compra * i.cantidad, 0);
  const gananciaTotal = subtotalVenta - subtotalCompra;
  const margenGanancia = subtotalVenta > 0 ? (gananciaTotal / subtotalVenta) * 100 : 0;

  // Registrar venta (una petición POST por cada producto de la lista)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (itemsVenta.length === 0) {
      setError('Agrega al menos un producto a la venta');
      return;
    }

    setLoading(true);

    try {
      const datosComunes = {
        cliente_nombre: clienteNombre || null,
        cliente_telefono: clienteTelefono || null,
        cliente_email: clienteEmail || null,
        metodo_pago: metodoPago,
        comprobante_pago: comprobantePago || null,
        notas: notas || null,
      };

      // Registrar cada producto como una venta independiente
      for (const item of itemsVenta) {
        const res = await fetch('/api/ventas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            producto_id: item.producto_id,
            producto_nombre_manual: item.es_manual ? item.nombre : null,
            cantidad: item.cantidad,
            precio_venta: item.precio_venta,
            precio_compra: item.precio_compra,
            ...datosComunes,
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(`Error al registrar "${item.nombre}": ${data.error || 'Error desconocido'}`);
        }
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
            {itemsVenta.length > 1 ? '¡Ventas Registradas!' : '¡Venta Registrada!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {itemsVenta.length > 1
              ? `Se registraron ${itemsVenta.length} productos correctamente`
              : 'La venta se ha registrado correctamente'}
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <p className="text-lg font-bold text-green-700 dark:text-green-400">
              Ganancia total: ${gananciaTotal.toLocaleString('es-CO')}
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
              href="/dashboard/ventas"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              ← Volver a Ventas
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🛒 Registrar Nueva Venta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Agrega uno o varios productos a la venta
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agregar producto */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Agregar producto
            </h2>

            {/* Toggle producto manual — prominente */}
            <button
              type="button"
              onClick={() => {
                const next = !esProductoManual;
                setEsProductoManual(next);
                if (next) {
                  setBusquedaProducto('');
                  setProductoSeleccionado(null);
                  setMostrarListaProductos(false);
                } else {
                  setNombreProductoManual('');
                  setPrecioVenta('');
                  setPrecioCompra('');
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 mb-4 transition-all ${
                esProductoManual
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <span className={`font-medium text-sm ${esProductoManual ? 'text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-300'}`}>
                📦 Producto <strong>no</strong> está en el inventario
              </span>
              <div className={`relative w-12 h-6 rounded-full transition-colors ${esProductoManual ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${esProductoManual ? 'left-7' : 'left-1'}`} />
              </div>
            </button>

            {esProductoManual ? (
              /* Campo manual */
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del producto/servicio *
                </label>
                <input
                  type="text"
                  value={nombreProductoManual}
                  onChange={(e) => setNombreProductoManual(e.target.value)}
                  placeholder="Ej: Reparación personalizada, Producto especial..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  💡 Este producto no se descontará del inventario
                </p>
              </div>
            ) : (
              /* Búsqueda de producto del inventario */
              <div className="mb-4 relative producto-search-container">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar producto *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) => {
                    setBusquedaProducto(e.target.value);
                    setMostrarListaProductos(true);
                    if (!e.target.value) {
                      setProductoSeleccionado(null);
                      setPrecioVenta('');
                      setPrecioCompra('');
                    }
                  }}
                  onFocus={() => setMostrarListaProductos(true)}
                  placeholder="Escribe para buscar producto..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoComplete="off"
                />
                {busquedaProducto && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusquedaProducto('');
                      setProductoSeleccionado(null);
                      setPrecioVenta('');
                      setPrecioCompra('');
                      setMostrarListaProductos(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Lista de productos filtrados */}
              {mostrarListaProductos && busquedaProducto && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {productosFiltrados.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron productos
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {productosFiltrados.map((producto) => (
                        <button
                          key={producto.id}
                          type="button"
                          onClick={() => seleccionarProducto(producto)}
                          className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <PackageIcon className="w-4 h-4 text-blue-500" />
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {producto.nombre}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className={`font-medium ${
                                  producto.stock > 10 ? 'text-green-600' :
                                  producto.stock > 0 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  Stock: {producto.stock}
                                </span>
                                {producto.categoria && (
                                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                    {producto.categoria}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                ${producto.precio?.toLocaleString('es-CO')}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              </div>
            )}

            {productoSeleccionado && !esProductoManual && (
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
                  max={esProductoManual ? undefined : (productoSeleccionado?.stock || undefined)}
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                />
              </div>
            </div>

            {/* Botón agregar a la venta */}
            <button
              type="button"
              onClick={agregarProducto}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Agregar a la venta
            </button>
          </div>

          {/* Lista de productos agregados */}
          {itemsVenta.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Productos en esta venta ({itemsVenta.length})
              </h2>
              <div className="space-y-3">
                {itemsVenta.map((item) => {
                  const t = totalesItem(item);
                  return (
                    <div
                      key={item._key}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <PackageIcon className={`w-4 h-4 ${item.es_manual ? 'text-orange-500' : 'text-blue-500'}`} />
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {item.nombre}
                          </p>
                          {item.es_manual && (
                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">
                              Manual
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <span>Cant: <strong>{item.cantidad}</strong></span>
                          <span>Venta: <strong>${item.precio_venta.toLocaleString('es-CO')}</strong></span>
                          <span>Compra: <strong>${item.precio_compra.toLocaleString('es-CO')}</strong></span>
                          <span className="text-green-600 dark:text-green-400">
                            Ganancia: <strong>${t.ganancia.toLocaleString('es-CO')}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          ${t.subtotalVenta.toLocaleString('es-CO')}
                        </span>
                        <button
                          type="button"
                          onClick={() => eliminarProducto(item._key)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resumen de ganancia */}
          {itemsVenta.length > 0 && (
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Cliente (Opcional)
              </h2>
              <button
                type="button"
                onClick={() => setMostrarBusquedaCliente(!mostrarBusquedaCliente)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                Buscar Cliente Frecuente
              </button>
            </div>

            {/* Cliente seleccionado */}
            {clienteSeleccionado && (
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      clienteSeleccionado.nivel_fidelidad === 'platino' ? 'bg-gradient-to-br from-gray-700 to-gray-900' :
                      clienteSeleccionado.nivel_fidelidad === 'oro' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      clienteSeleccionado.nivel_fidelidad === 'plata' ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      'bg-gradient-to-br from-orange-400 to-orange-600'
                    }`}>
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{clienteSeleccionado.nombre}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="capitalize font-medium text-purple-700 dark:text-purple-400">
                          Cliente {clienteSeleccionado.nivel_fidelidad}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {clienteSeleccionado.total_compras} compras
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setClienteSeleccionado(null);
                      setClienteNombre('');
                      setClienteTelefono('');
                      setClienteEmail('');
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Búsqueda de clientes */}
            {mostrarBusquedaCliente && !clienteSeleccionado && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, teléfono o identificación..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {clientesFiltrados.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No se encontraron clientes
                    </p>
                  ) : (
                    clientesFiltrados.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => seleccionarCliente(c)}
                        className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{c.nombre}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {c.telefono} {c.identificacion && `• ${c.identificacion}`}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            c.nivel_fidelidad === 'platino' ? 'bg-gray-700 text-white' :
                            c.nivel_fidelidad === 'oro' ? 'bg-yellow-500 text-white' :
                            c.nivel_fidelidad === 'plata' ? 'bg-gray-400 text-white' :
                            'bg-orange-500 text-white'
                          }`}>
                            {c.nivel_fidelidad}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

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
              href="/dashboard/ventas"
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || itemsVenta.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
            >
              {loading
                ? 'Registrando...'
                : `💾 Registrar Venta${itemsVenta.length > 1 ? ` (${itemsVenta.length} productos)` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
