"use client";

import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const CartPageItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    await updateQuantity(item.id, newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setIsUpdating(true);
      await removeFromCart(item.id);
      setIsUpdating(false);
    }
  };

  const precio = parseFloat(item.producto.precio);
  const subtotal = precio * item.cantidad;
  const imagen = item.producto.imagenes?.[0]?.url || item.producto.imagenPrincipal;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${isUpdating ? 'opacity-50' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Imagen del producto */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
            {imagen ? (
              <Image
                src={imagen}
                alt={item.producto.nombre}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.producto.nombre}
              </h3>
              <p className="text-gray-600 mb-2">
                Categoría: <span className="capitalize">{item.producto.categoria.replace('-', ' ')}</span>
              </p>
              <p className="text-xl font-bold text-gray-900">
                ${precio.toLocaleString()} COP
              </p>
              {item.producto.stock <= 5 && (
                <p className="text-sm text-orange-600 mt-1">
                  ⚠️ Solo quedan {item.producto.stock} unidades
                </p>
              )}
            </div>

            {/* Controles de cantidad */}
            <div className="flex flex-col lg:items-end gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(item.cantidad - 1)}
                    disabled={isUpdating || item.cantidad <= 1}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={item.producto.stock}
                    value={item.cantidad}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= item.producto.stock) {
                        handleQuantityChange(value);
                      }
                    }}
                    disabled={isUpdating}
                    className="w-16 px-2 py-2 text-center border-0 focus:ring-0 disabled:bg-gray-50"
                  />
                  <button
                    onClick={() => handleQuantityChange(item.cantidad + 1)}
                    disabled={isUpdating || item.cantidad >= item.producto.stock}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  (Máx: {item.producto.stock})
                </span>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <p className="text-sm text-gray-600">Subtotal:</p>
                <p className="text-xl font-bold text-gray-900">
                  ${subtotal.toLocaleString()} COP
                </p>
              </div>
            </div>
          </div>

          {/* Botón eliminar */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 disabled:opacity-50 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar producto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyCartPage = () => (
  <div className="text-center py-16">
    <div className="max-w-md mx-auto">
      <svg className="mx-auto h-24 w-24 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 48 48">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 118 0v4M8 11l1 10a2 2 0 002 2h26a2 2 0 002-2l1-10H8z" />
      </svg>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
      <p className="text-gray-600 mb-8">
        ¡Descubre nuestra increíble selección de productos y encuentra algo que te encante!
      </p>
      <Link
        href="/accesorios"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 15h8a2 2 0 002-2V9a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 002 2z" />
        </svg>
        Explorar productos
      </Link>
    </div>
  </div>
);

const CartSummarySection = ({ subtotal, itemCount, onCheckout }) => {
  const envio = subtotal > 100000 ? 0 : 15000;
  const total = subtotal + envio;

  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen del pedido</h2>

      <div className="space-y-4">
        <div className="flex justify-between text-base">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</span>
          <span>${subtotal.toLocaleString()} COP</span>
        </div>

        <div className="flex justify-between text-base">
          <span>Envío</span>
          <span>
            {envio === 0 ? (
              <span className="text-green-600 font-semibold">¡Gratis!</span>
            ) : (
              `$${envio.toLocaleString()} COP`
            )}
          </span>
        </div>

        {subtotal > 80000 && subtotal < 100000 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 ¡Agrega <strong>${(100000 - subtotal).toLocaleString()} COP</strong> más para obtener envío gratis!
            </p>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>${total.toLocaleString()} COP</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-lg transition-colors"
        >
          Proceder al checkout
        </button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            🔒 Compra 100% segura y protegida
          </p>
          <p className="text-xs text-gray-400">
            Aceptamos todas las tarjetas de crédito y débito
          </p>
        </div>
      </div>
    </div>
  );
};

export default function CarritoPage() {
  const { items, itemCount, subtotal, loading, clearCart } = useCart();
  const router = useRouter();

  // Configurar metadatos del lado del cliente
  useEffect(() => {
    document.title = 'Carrito de compras | Neurai.dev';

    // Crear o actualizar meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = 'Revisa los productos en tu carrito de compras. Modifica cantidades, calcula envío y procede al checkout de forma segura.';

    // Crear o actualizar meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = 'carrito, compras, checkout, envío, productos, Neurai.dev';
  }, []);

  const handleCheckout = () => {
    // TODO: Implementar navegación al checkout
    console.log('Proceder al checkout desde página');
    // router.push('/checkout');
  };

  const handleClearCart = async () => {
    if (confirm('¿Estás seguro de que quieres vaciar completamente el carrito?')) {
      await clearCart();
    }
  };

  const handleContinueShopping = () => {
    router.push('/accesorios');
  };

  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Carrito de compras</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Carrito de compras
              {itemCount > 0 && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
                </span>
              )}
            </h1>

            {items.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={handleContinueShopping}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Seguir comprando
                </button>
                <button
                  onClick={handleClearCart}
                  className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenido */}
        {items.length === 0 ? (
          <EmptyCartPage />
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-6 mb-8 lg:mb-0">
              {items.map(item => (
                <CartPageItem key={item.id} item={item} />
              ))}
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <CartSummarySection
                subtotal={subtotal}
                itemCount={itemCount}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}