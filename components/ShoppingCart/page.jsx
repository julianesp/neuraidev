"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { getProductImage } from "@/lib/constants";
import EpaycoCheckout from "../EpaycoCheckout";
import CartPaymentMethodModal from "../CartPaymentMethodModal";
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Detectar si el carrito tiene items de tiendas externas (no del sitio principal)
  const itemsDeTienda = cart.filter((item) => item.seller_clerk_user_id);
  const itemsPropios = cart.filter((item) => !item.seller_clerk_user_id);
  const hayMezcla = itemsDeTienda.length > 0 && itemsPropios.length > 0;
  const soloTienda = itemsDeTienda.length > 0 && itemsPropios.length === 0;

  // Debug: Log cart state
  // console.log(
  //   "[ShoppingCart] Render - isOpen:",
  //   isOpen,
  //   "cart length:",
  //   cart?.length,
  //   "cart:",
  //   cart,
  // );

  // Construir y enviar pedido al WhatsApp de una tienda
  const enviarPedidoWhatsApp = async (items, whatsapp, nombreTienda) => {
    let numero = whatsapp.replace(/\D/g, "");
    // Si no tiene código de país, asumir Colombia (+57)
    if (!numero.startsWith("57")) numero = `57${numero}`;

    let mensaje = `🛒 *PEDIDO - ${(nombreTienda || "Tienda").toUpperCase()}*\n`;
    mensaje += "━━━━━━━━━━━━━━━━━━━━\n\n";
    mensaje += "Hola! Quiero realizar el siguiente pedido:\n\n";

    items.forEach((item, index) => {
      mensaje += `📦 *Producto ${index + 1}*\n`;
      mensaje += `┣ *Nombre:* ${item.nombre}\n`;
      mensaje += `┣ *Cantidad:* ${item.cantidad} unidad${item.cantidad > 1 ? "es" : ""}\n`;
      mensaje += `┣ *Precio unitario:* $${item.precio.toLocaleString("es-CO")}\n`;
      if (item.variacion) mensaje += `┣ *Variación:* ${item.variacion}\n`;
      mensaje += `┗ *Subtotal:* $${(item.precio * item.cantidad).toLocaleString("es-CO")}\n\n`;
    });

    const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
    mensaje += "━━━━━━━━━━━━━━━━━━━━\n";
    mensaje += `📋 *Total a pagar: $${total.toLocaleString("es-CO")}*\n\n`;
    mensaje += "Quisiera coordinar el pago y la entrega. ¡Gracias! 😊";

    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const handleCheckoutTienda = async () => {
    if (itemsDeTienda.length === 0) return;

    // Agrupar items por tienda
    const porTienda = {};
    for (const item of itemsDeTienda) {
      const sid = item.seller_clerk_user_id;
      if (!porTienda[sid]) {
        porTienda[sid] = {
          items: [],
          whatsapp: item.seller_whatsapp,
          nombre: item.seller_nombre,
        };
      }
      porTienda[sid].items.push(item);
    }

    // Para tiendas sin whatsapp cacheado, consultarlo
    for (const sid of Object.keys(porTienda)) {
      if (!porTienda[sid].whatsapp) {
        try {
          const res = await fetch(`/api/tiendas/info?clerk_user_id=${sid}`);
          if (res.ok) {
            const data = await res.json();
            porTienda[sid].whatsapp = data.whatsapp;
            porTienda[sid].nombre = data.nombre;
          }
        } catch {}
      }

      if (!porTienda[sid].whatsapp) {
        toast.warning("Esta tienda no tiene WhatsApp registrado. Contáctalos directamente.", {
          title: "Sin WhatsApp",
          duration: 5000,
        });
        continue;
      }

      await enviarPedidoWhatsApp(
        porTienda[sid].items,
        porTienda[sid].whatsapp,
        porTienda[sid].nombre,
      );
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        style={{ zIndex: 1500 }}
        onClick={toggleCart}
      />

      {/* Panel del carrito */}
      <div
        className={styles.carrito_panel}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "90vh",
          width: "min(30vw, 1000px)",
          zIndex: 1501,
          boxShadow: "-4px 0 20px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          marginTop: "55px",
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
          className="bg-white dark:bg-gray-700 "
        >
          <h2
            // style={{
            //   fontSize: "20px",
            //   fontWeight: "bold",
            //   display: "flex",
            //   alignItems: "center",
            //   gap: "8px",
            // }}
            className={`${styles.carrito_title}`}
          >
            {/* <ShoppingBag size={24} className="dark:bg-gray-700 " /> */}
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

        {/* Contenido del carrito - Layout de 2 columnas */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-800">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center  text-gray-400 dark:text-gray-500">
              <ShoppingBag size={64} className="mb-4" />
              <p className="text-lg">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 lg:grid-cols-[1fr,400px] h-full ${styles.grid_container}`}>
              {/* Columna izquierda: Lista de productos */}
              <div
                className={`overflow-y-auto p-4 border-r border-gray-200 dark:border-gray-700 ${styles.productosListados}`}
                data-aos="fade-down"
              >
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white sticky top-0 bg-gray-50 dark:bg-gray-800 py-2 z-10">
                  Productos ({cart.length})
                </h3>
                <div className="space-y-3">
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
                              sizes="80px"
                              className="object-cover rounded-md"
                              unoptimized={isDataUri}
                            />
                          );
                        })()}
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                          {item.nombre}
                        </h3>
                        {item.variacion && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.variacion}
                          </p>
                        )}
                        <div className="mt-1">
                          <p className="text-blue-600 dark:text-blue-400 font-bold">
                            ${item.precio.toLocaleString("es-CO")}
                          </p>
                          {item.precio_original && item.precio_original !== item.precio && (
                            <p className="text-xs text-black dark:text-gray-400 opacity-60 line-through">
                              ${item.precio_original.toLocaleString("es-CO")}
                            </p>
                          )}
                        </div>

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
                          <span className="text-sm font-semibold px-3 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => {
                              // Validar si hay stock disponible
                              if (item.stock !== undefined && item.cantidad >= item.stock) {
                                toast.warning(
                                  `No hay más existencias disponibles de "${item.nombre}". Stock máximo: ${item.stock}`,
                                  {
                                    title: "Stock agotado",
                                    duration: 4000,
                                  }
                                );
                                return;
                              }
                              updateQuantity(
                                item.id,
                                item.variacion,
                                item.cantidad + 1,
                              );
                            }}
                            disabled={item.stock !== undefined && item.cantidad >= item.stock}
                            className={`p-1 rounded text-gray-700 dark:text-gray-300 ${
                              item.stock !== undefined && item.cantidad >= item.stock
                                ? "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
                                : "hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={14} />
                          </button>
                          <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                            = $
                            {(item.precio * item.cantidad).toLocaleString(
                              "es-CO",
                            )}
                          </span>
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
              </div>

              {/* Resumen: lo posicionamos fijo al lado izquierdo del viewport en desktop, relativo en móvil */}
              <div
                className={`bg-white dark:bg-gray-900 ${styles.carrito}`}
                style={{
                  position: "fixed",
                  left: 0,
                  top: "55px",
                  height: "calc(100dvh - 55px)",
                  width: "min(30vw, 420px)",
                  zIndex: 1502,
                  overflowY: "auto",
                  padding: "16px",
                }}
              >
                <div className="space-y-4">
                  {/* Resumen del pedido */}
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white md:absolute">
                      Resumen del Pedido
                    </h3>

                    {/* Subtotal */}
                    {/* <div className="space-y-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Productos ({cart.length})</span>
                        <span>${getTotalPrice().toLocaleString("es-CO")}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Envío</span>
                        <span className="font-semibold">GRATIS*</span>
                      </div>
                    </div> */}

                    {/* Total */}
                    <div className="flex items-center justify-between text-xl font-bold mb-4">
                      <span className="text-gray-900 dark:text-white">
                        
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        ${getTotalPrice().toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>

                  {/* Información de envíos */}
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
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
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          📦 Envíos
                        </p>
                        {getTotalPrice() >= 50000 ? (
                          <>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                ✓ GRATIS
                              </span>{" "}
                              en Valle de Sibundoy - Alto Putumayo
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ¡Tu compra supera los $50.000!
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                              Envío gratis al Alto Putumayo en compras desde{" "}
                              <span className="font-bold">$50.000</span>
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Te faltan{" "}
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                ${(50000 - getTotalPrice()).toLocaleString("es-CO")}
                              </span>{" "}
                              para envío gratis
                            </p>
                          </>
                        )}
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Otros destinos: se coordina por WhatsApp
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Área de checkout o botones */}
                  {showCheckout ? (
                    <div>
                      <button
                        onClick={() => setShowCheckout(false)}
                        className="mb-3 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1"
                      >
                        ← Volver
                      </button>
                      <EpaycoCheckout onClose={() => setShowCheckout(false)} />
                    </div>
                  ) : (
                    <div className="space-y-3">

                      {/* Aviso si hay mezcla de productos propios y de tiendas */}
                      {hayMezcla && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
                          ⚠️ Tu carrito tiene productos de <strong>Neurai</strong> y de <strong>tiendas externas</strong>. Cada grupo se paga por separado.
                        </div>
                      )}

                      {/* Botón pago ePayco/Nequi — solo si hay productos propios */}
                      {itemsPropios.length > 0 && (
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                          </svg>
                          {hayMezcla ? `Pagar Neurai (${itemsPropios.length} producto${itemsPropios.length > 1 ? "s" : ""})` : "Proceder al Pago"}
                          {!hayMezcla && <span className="text-xs opacity-80">(Nequi o ePayco)</span>}
                        </button>
                      )}

                      {/* Botón WhatsApp — solo si hay productos de tiendas */}
                      {itemsDeTienda.length > 0 && (
                        <button
                          onClick={handleCheckoutTienda}
                          className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          {hayMezcla
                            ? `Pedir por WhatsApp (${itemsDeTienda.length} producto${itemsDeTienda.length > 1 ? "s" : ""})`
                            : "Pedir por WhatsApp"}
                        </button>
                      )}

                      {/* Vaciar carrito */}
                      <button
                        onClick={() => {
                          clearCart();
                          toast.info("Carrito vaciado", { title: "Carrito Limpio", duration: 2000 });
                        }}
                        className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Vaciar Carrito
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Selección de Método de Pago */}
      <CartPaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cart={cart}
        totalPrice={getTotalPrice()}
        descuento={5}
        numeroNequi="3174503604"
        nombreNegocio="Neurai.dev"
        onSelectEpayco={() => {
          setShowPaymentModal(false);
          setShowCheckout(true);
        }}
      />
    </>
  );
}
