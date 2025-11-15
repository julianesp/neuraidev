"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { getProductImage } from "@/lib/constants";
// TEMPORALMENTE DESHABILITADO: ePayco
// import EpaycoCheckout from "./EpaycoCheckout";

export default function ShoppingCart() {
  const {
    cart,
    isOpen,
    toggleCart,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    clearCart,
  } = useCart();
  const toast = useToast();
  // TEMPORALMENTE DESHABILITADO: ePayco
  // const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.warning("Tu carrito está vacío", {
        title: "Carrito Vacío",
        duration: 3000,
      });
      return;
    }

    // Construir mensaje para WhatsApp con mejor presentación
    let mensaje = "🛒 *PEDIDO DESDE NEURAI.DEV*\n";
    mensaje += "━━━━━━━━━━━━━━━━━━━━\n\n";
    mensaje += "Hola! Quiero realizar el siguiente pedido:\n\n";

    // Listar productos
    cart.forEach((item, index) => {
      mensaje += `📦 *Producto ${index + 1}*\n`;
      mensaje += `┣ *Nombre:* ${item.nombre}\n`;
      mensaje += `┣ *Cantidad:* ${item.cantidad} unidad${item.cantidad > 1 ? 'es' : ''}\n`;
      mensaje += `┣ *Precio unitario:* $${item.precio.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;

      if (item.variacion) {
        mensaje += `┣ *Variación:* ${item.variacion}\n`;
      }

      const subtotal = item.precio * item.cantidad;
      mensaje += `┗ *Subtotal:* $${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
    });

    // Resumen del pedido
    mensaje += "━━━━━━━━━━━━━━━━━━━━\n";
    mensaje += "📋 *RESUMEN DEL PEDIDO*\n\n";

    const cantidadTotal = cart.reduce((sum, item) => sum + item.cantidad, 0);
    mensaje += `• Total de productos: ${cantidadTotal}\n`;
    mensaje += `• Total a pagar: *$${getTotalPrice().toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*\n\n`;

    mensaje += "━━━━━━━━━━━━━━━━━━━━\n\n";
    mensaje += "Quisiera coordinar el medio de pago y la entrega. ¡Gracias! 😊";

    const mensajeCodificado = encodeURIComponent(mensaje);
    const numeroWhatsApp = "573174503604";

    // Abrir WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
    window.open(urlWhatsApp, "_blank");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        style={{ zIndex: 2500 }}
        onClick={toggleCart}
      />

      {/* Panel del carrito */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
        style={{ zIndex: 2600 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag size={24} />
            Carrito de Compras
          </h2>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag size={64} className="mb-4" />
              <p className="text-lg">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${item.variacion}-${index}`}
                  className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Imagen del producto */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md">
                    {(() => {
                      const imageSrc = getProductImage(item);
                      const isDataUri = imageSrc && typeof imageSrc === 'string' && imageSrc.startsWith('data:');
                      return (
                        <Image
                          src={imageSrc}
                          alt={item.nombre}
                          fill
                          className="object-cover rounded-md"
                          unoptimized={isDataUri}
                        />
                      );
                    })()}
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {item.nombre}
                    </h3>
                    {item.variacion && (
                      <p className="text-xs text-gray-500">{item.variacion}</p>
                    )}
                    <p className="text-blue-600 font-bold mt-1">
                      ${item.precio.toFixed(2)}
                    </p>

                    {/* Indicador de stock */}
                    {item.stock !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {item.stock} {item.stock <= 5 && "⚠️"}
                      </p>
                    )}

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.variacion,
                            item.cantidad - 1,
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-semibold px-2">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.variacion,
                            item.cantidad + 1,
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeFromCart(item.id, item.variacion)}
                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded transition-colors self-start"
                    aria-label="Eliminar del carrito"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con total y botones */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>

            {/* TEMPORALMENTE DESHABILITADO: ePayco checkout */}
            {/* {showCheckout ? (
              <div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="mb-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  ← Volver a opciones de pago
                </button>
                <EpaycoCheckout onClose={() => setShowCheckout(false)} />
              </div>
            ) : ( */}
              <>
                {/* TEMPORALMENTE DESHABILITADO: Botón de pago con ePayco */}
                {/* <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                  Pagar con Tarjeta/PSE
                </button> */}

                {/* Botón de pago por WhatsApp */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Pagar por WhatsApp
                </button>

                {/* Botón limpiar carrito */}
                <button
                  onClick={() => {
                    clearCart();
                    toast.info("Carrito vaciado", {
                      title: "Carrito Limpio",
                      duration: 2000,
                    });
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Vaciar Carrito
                </button>
              </>
            {/* )} */}
          </div>
        )}
      </div>
    </>
  );
}
