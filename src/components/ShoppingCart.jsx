"use client";

import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    await updateQuantity(item.id, newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    await removeFromCart(item.id);
    setIsUpdating(false);
  };

  const precio = parseFloat(item.producto.precio);
  const subtotal = precio * item.cantidad;
  const imagen = item.producto.imagenes?.[0]?.url || item.producto.imagenPrincipal;

  return (
    <div className={`border-b pb-4 mb-4 ${isUpdating ? 'opacity-50' : ''}`}>
      <div className="flex items-center space-x-4">
        {/* Imagen del producto */}
        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded overflow-hidden">
          {imagen ? (
            <Image
              src={imagen}
              alt={item.producto.nombre}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {item.producto.nombre}
          </h3>
          <p className="text-sm text-gray-500">
            ${precio.toLocaleString()} COP
          </p>
          {item.producto.stock <= 5 && (
            <p className="text-xs text-orange-600">
              Solo quedan {item.producto.stock} unidades
            </p>
          )}
        </div>

        {/* Controles de cantidad */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuantityChange(item.cantidad - 1)}
            disabled={isUpdating || item.cantidad <= 1}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>

          <span className="w-8 text-center font-medium">{item.cantidad}</span>

          <button
            onClick={() => handleQuantityChange(item.cantidad + 1)}
            disabled={isUpdating || item.cantidad >= item.producto.stock}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            ${subtotal.toLocaleString()} COP
          </p>
        </div>

        {/* Botón eliminar */}
        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="text-red-400 hover:text-red-600 disabled:opacity-50"
          title="Eliminar producto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const EmptyCart = () => (
  <div className="text-center py-12">
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 118 0v4M8 11l1 10a2 2 0 002 2h26a2 2 0 002-2l1-10H8z" />
    </svg>
    <h3 className="mt-2 text-sm font-medium text-gray-900">Tu carrito está vacío</h3>
    <p className="mt-1 text-sm text-gray-500">
      ¡Empieza agregando algunos productos increíbles!
    </p>
    <div className="mt-6">
      <Link
        href="/accesorios"
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 15h8a2 2 0 002-2V9a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 002 2z" />
        </svg>
        Explorar productos
      </Link>
    </div>
  </div>
);

const CartSummary = ({ subtotal, itemCount, onCheckout }) => {
  const envio = 15000; // Costo fijo de envío
  const total = subtotal + envio;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen del pedido</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal ({itemCount} productos)</span>
          <span>${subtotal.toLocaleString()} COP</span>
        </div>

        <div className="flex justify-between">
          <span>Envío</span>
          <span>${envio.toLocaleString()} COP</span>
        </div>

        <div className="border-t pt-2 flex justify-between font-medium text-base">
          <span>Total</span>
          <span>${total.toLocaleString()} COP</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full mt-4 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
      >
        Proceder al checkout
      </button>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Envío seguro y protegido
      </p>
    </div>
  );
};

export const ShoppingCart = ({ isOpen, onClose }) => {
  const { items, itemCount, subtotal, loading, clearCart } = useCart();

  const handleCheckout = () => {
    onClose();
    window.location.href = '/checkout';
  };

  const handleClearCart = async () => {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      await clearCart();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 md:bg-transparent"
        onClick={onClose}
      />

      {/* Panel del carrito - Responsive positioning */}
      <div className="absolute bg-white dark:bg-gray-800 shadow-xl bottom-0 left-0 right-0 top-1/3 rounded-t-2xl md:top-16 md:right-4 md:left-auto md:bottom-auto md:w-96 md:max-h-[80vh] md:rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Carrito de compras
                {itemCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({itemCount} productos)
                  </span>
                )}
              </h2>
              {itemCount > 0 && (
                <Link
                  href="/carrito"
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-1"
                  onClick={onClose}
                >
                  Ver página completa →
                </Link>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : items.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="p-4">
                {/* Botón limpiar carrito */}
                {items.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Vaciar carrito
                    </button>
                  </div>
                )}

                {/* Items del carrito */}
                <div className="space-y-4">
                  {items.map(item => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer con resumen */}
          {items.length > 0 && (
            <div className="border-t p-4">
              <CartSummary
                subtotal={subtotal}
                itemCount={itemCount}
                onCheckout={handleCheckout}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};