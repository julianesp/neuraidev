"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  stock: number;
  marca: string;
  imagenPrincipal?: string;
  disponible: boolean;
}

interface VentaItem {
  productoId: string;
  producto?: Producto;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
}

interface Cliente {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export default function VentasManager() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFilter, setProductosFilter] = useState('');
  const [ventaItems, setVentaItems] = useState<VentaItem[]>([]);
  const [cliente, setCliente] = useState<Cliente>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notas, setNotas] = useState('');
  const [descuentos, setDescuentos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Cargar productos
  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await fetch('/api/productos');
      if (response.ok) {
        const data = await response.json();
        setProductos(data.productos || []);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(p => 
    p.disponible && 
    p.stock > 0 &&
    (p.nombre.toLowerCase().includes(productosFilter.toLowerCase()) ||
     p.categoria.toLowerCase().includes(productosFilter.toLowerCase()) ||
     p.marca?.toLowerCase().includes(productosFilter.toLowerCase()))
  );

  // Agregar producto a la venta
  const agregarProducto = (producto: Producto) => {
    const itemExistente = ventaItems.find(item => item.productoId === producto.id);
    
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) {
        setVentaItems(ventaItems.map(item =>
          item.productoId === producto.id
            ? { 
                ...item, 
                cantidad: item.cantidad + 1, 
                subtotal: (item.cantidad + 1) * item.precioUnit 
              }
            : item
        ));
      } else {
        setMessage({ type: 'error', text: `Stock insuficiente para ${producto.nombre}` });
        setTimeout(() => setMessage(null), 3000);
      }
    } else {
      const nuevoItem: VentaItem = {
        productoId: producto.id,
        producto: producto,
        cantidad: 1,
        precioUnit: Number(producto.precio),
        subtotal: Number(producto.precio)
      };
      setVentaItems([...ventaItems, nuevoItem]);
    }
  };

  // Actualizar cantidad de item
  const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
    const item = ventaItems.find(item => item.productoId === productoId);
    if (!item?.producto) return;

    if (nuevaCantidad <= 0) {
      eliminarItem(productoId);
      return;
    }

    if (nuevaCantidad > item.producto.stock) {
      setMessage({ type: 'error', text: `Stock máximo: ${item.producto.stock}` });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setVentaItems(ventaItems.map(item =>
      item.productoId === productoId
        ? { 
            ...item, 
            cantidad: nuevaCantidad, 
            subtotal: nuevaCantidad * item.precioUnit 
          }
        : item
    ));
  };

  // Eliminar item de la venta
  const eliminarItem = (productoId: string) => {
    setVentaItems(ventaItems.filter(item => item.productoId !== productoId));
  };

  // Calcular totales
  const subtotal = ventaItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - descuentos;

  // Procesar venta
  const procesarVenta = async () => {
    if (ventaItems.length === 0) {
      setMessage({ type: 'error', text: 'Debe agregar al menos un producto' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!cliente.nombre.trim()) {
      setMessage({ type: 'error', text: 'Debe ingresar el nombre del cliente' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);

    try {
      const ventaData = {
        cliente: {
          nombre: cliente.nombre.trim(),
          email: cliente.email?.trim() || undefined,
          telefono: cliente.telefono?.trim() || undefined,
          direccion: cliente.direccion?.trim() || undefined
        },
        items: ventaItems.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnit: item.precioUnit
        })),
        metodoPago,
        notas: notas.trim() || undefined,
        descuentos
      };

      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ventaData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: `Venta registrada exitosamente: ${result.venta.numero}` });
        
        // Limpiar formulario
        setVentaItems([]);
        setCliente({ nombre: '', email: '', telefono: '', direccion: '' });
        setMetodoPago('efectivo');
        setNotas('');
        setDescuentos(0);
        
        // Actualizar lista de productos
        fetchProductos();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Error procesando la venta' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">💰 Nueva Venta</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selección de Productos */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">🛒 Productos Disponibles</h3>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={productosFilter}
              onChange={(e) => setProductosFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {productosFiltrados.slice(0, 20).map((producto) => (
              <div 
                key={producto.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => agregarProducto(producto)}
              >
                <div className="flex items-center space-x-3">
                  {producto.imagenPrincipal && (
                    <Image 
                      src={producto.imagenPrincipal} 
                      alt={producto.nombre}
                      className="w-12 h-12 object-cover rounded"
                      width={48}
                      height={48}
                      priority={false}
                    />
                  )}
                  <div>
                    <div className="font-medium text-sm">{producto.nombre}</div>
                    <div className="text-xs text-gray-500">{producto.categoria} • Stock: {producto.stock}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{formatPrice(producto.precio)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carrito de Compras */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">🛍️ Carrito de Compras</h3>
          
          {ventaItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay productos en el carrito</p>
          ) : (
            <div className="space-y-3">
              {ventaItems.map((item) => (
                <div key={item.productoId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {item.producto?.imagenPrincipal && (
                      <Image 
                        src={item.producto.imagenPrincipal} 
                        alt={item.producto.nombre}
                        className="w-10 h-10 object-cover rounded"
                        width={40}
                        height={40}
                        priority={false}
                      />
                    )}
                    <div>
                      <div className="font-medium text-sm">{item.producto?.nombre}</div>
                      <div className="text-xs text-gray-500">{formatPrice(item.precioUnit)} c/u</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      +
                    </button>
                    <div className="ml-4 text-green-600 font-medium min-w-[80px] text-right">
                      {formatPrice(item.subtotal)}
                    </div>
                    <button
                      onClick={() => eliminarItem(item.productoId)}
                      className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200 ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totales */}
          {ventaItems.length > 0 && (
            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Descuentos:</span>
                <input
                  type="number"
                  value={descuentos}
                  onChange={(e) => setDescuentos(Number(e.target.value) || 0)}
                  className="w-24 px-2 py-1 border rounded text-right"
                  min="0"
                  max={subtotal}
                />
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-green-600">{formatPrice(total)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Datos del Cliente y Finalizar Venta */}
      {ventaItems.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">👤 Datos del Cliente</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="cliente-nombre-input" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                id="cliente-nombre-input"
                value={cliente.nombre}
                onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="cliente-telefono-input" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                id="cliente-telefono-input"
                value={cliente.telefono}
                onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="cliente-email-input" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="cliente-email-input"
                value={cliente.email}
                onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="metodo-pago-input" className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select
                id="metodo-pago-input"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="nequi">Nequi</option>
                <option value="daviplata">Daviplata</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="cliente-direccion-input" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              type="text"
              id="cliente-direccion-input"
              value={cliente.direccion}
              onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="notas-adicionales-input" className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
            <textarea
              id="notas-adicionales-input"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setVentaItems([]);
                setCliente({ nombre: '', email: '', telefono: '', direccion: '' });
                setNotas('');
                setDescuentos(0);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={procesarVenta}
              disabled={loading || ventaItems.length === 0 || !cliente.nombre.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : `Finalizar Venta - ${formatPrice(total)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}