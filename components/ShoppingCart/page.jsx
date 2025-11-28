"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { getProductImage } from "@/lib/constants";
import EpaycoCheckout from "../EpaycoCheckout";
import styles from "./ShoppingCart.module.scss";

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
  const [showCheckout, setShowCheckout] = useState(false);

  // Debug: Log cart state
  // console.log(
  //   "[ShoppingCart] Render - isOpen:",
  //   isOpen,
  //   "cart length:",
  //   cart?.length,
  //   "cart:",
  //   cart,
  // );

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
      mensaje += `┣ *Cantidad:* ${item.cantidad} unidad${item.cantidad > 1 ? "es" : ""}\n`;
      mensaje += `┣ *Precio unitario:* $${item.precio.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;

      if (item.variacion) {
        mensaje += `┣ *Variación:* ${item.variacion}\n`;
      }

      const subtotal = item.precio * item.cantidad;
      mensaje += `┗ *Subtotal:* $${subtotal.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
    });

    // Resumen del pedido
    mensaje += "━━━━━━━━━━━━━━━━━━━━\n";
    mensaje += "📋 *RESUMEN DEL PEDIDO*\n\n";

    const cantidadTotal = cart.reduce((sum, item) => sum + item.cantidad, 0);
    mensaje += `• Total de productos: ${cantidadTotal}\n`;
    mensaje += `• Total a pagar: *$${getTotalPrice().toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*\n\n`;

    mensaje += "━━━━━━━━━━━━━━━━━━━━\n\n";
    mensaje += "Quisiera coordinar el medio de pago y la entrega. ¡Gracias! 😊";

    const mensajeCodificado = encodeURIComponent(mensaje);
    const numeroWhatsApp = "573174503604";

    // Abrir WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
    window.open(urlWhatsApp, "_blank");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        style={{ zIndex: 9998 }}
        onClick={toggleCart}
      />

      {/* Panel del carrito - SIMPLIFICADO PARA DEBUG */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "420px",
          // backgroundColor: "white",
          zIndex: 9999,
          boxShadow: "-4px 0 20px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            // darkMode: "bg-gray-900 border-gray-700",
          }}
          className="dark:bg-gray-700 bg-slate-400"
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShoppingBag size={24} className="dark:bg-gray-700" />
            Carrito de Compras ({cart.length} items)
          </h2>
          <button
            onClick={toggleCart}
            style={{
              padding: "8px",
              borderRadius: "50%",
              border: "none",
              // background: "#f3f4f6",
              cursor: "pointer",
              dark: "bg-gray-600",
            }}
            aria-label="Cerrar carrito"
            title="Cerrar carrito"
            // className="dark:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido del carrito */}
        <div
          className={`flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 ${styles.productosListados} `}
          data-aos="fade-down"
        >
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <ShoppingBag size={64} className="mb-4" />
              <p className="text-lg">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${item.variacion}-${index}`}
                  className="flex gap-3 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Imagen del producto */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-600 rounded-md overflow-hidden">
                    {(() => {
                      const imageSrc = getProductImage(item);
                      const isDataUri =
                        imageSrc &&
                        typeof imageSrc === "string" &&
                        imageSrc.startsWith("data:");
                      return (
                        <Image
                          src={imageSrc}
                          alt={item.nombre}
                          fill
                          sizes="60px"
                          className="object-cover rounded-md"
                          unoptimized={isDataUri}
                        />
                      );
                    })()}
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-white">
                      {item.nombre}
                    </h3>
                    {item.variacion && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.variacion}
                      </p>
                    )}
                    <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                      ${item.precio.toLocaleString("es-CO")}
                    </p>

                    {/* Indicador de stock */}
                    {item.stock !== undefined && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-semibold px-2 text-gray-900 dark:text-white">
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
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeFromCart(item.id, item.variacion)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors self-start text-gray-600 dark:text-gray-400"
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
          <div
            className={`border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-white dark:bg-gray-900  ${styles.carrito}`}
            data-aos="fade-up"
          >
            {/* Total */}
            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-gray-900 dark:text-white ">Total:</span>
              <span className="text-blue-600 dark:text-white">
                ${getTotalPrice().toLocaleString("es-CO")}
              </span>
            </div>

            {/* Información de envíos - Siempre visible */}
            <div className="mb-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    📦 Envíos
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-semibold text-green-600 dark:text-green-400">✓ GRATIS</span> en Valle de Sibundoy - Alto Putumayo
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Otros destinos: se coordina por WhatsApp
                  </p>
                </div>
              </div>
            </div>

            {showCheckout ? (
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="mb-3 text-sm text-blue-600 dark:text-white flex items-center gap-1 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10 -ml-2 pl-2"
                >
                  ← Volver a opciones de pago
                </button>
                <EpaycoCheckout onClose={() => setShowCheckout(false)} />
              </div>
            ) : (
              <>
                {/* Botón de pago con Tarjeta/PSE */}
                <button
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
            )}
          </div>
        )}
      </div>
    </>
  );
}
