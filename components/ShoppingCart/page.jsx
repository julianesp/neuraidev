"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { getProductImage, PLACEHOLDER_IMAGE } from "@/lib/constants";
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

  // Envío gratis al Alto Putumayo solo desde este monto.
  const ENVIO_GRATIS_MINIMO = 50000;
  const totalCarrito = getTotalPrice();
  const calificaEnvioGratis = totalCarrito >= ENVIO_GRATIS_MINIMO;
  const faltaParaEnvioGratis = ENVIO_GRATIS_MINIMO - totalCarrito;

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

  const totalPropios = itemsPropios.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const bajoMinimo = totalPropios < 5000;

  return (
    <>
      {/* Overlay: fade + backdrop-blur. Montado siempre para poder animar la
          salida del drawer; se vuelve inerte con pointer-events cuando cierra. */}
      <div
        onClick={toggleCart}
        aria-hidden={!isOpen}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ zIndex: 2100 }}
      />

      {/* Drawer lateral derecho (una sola columna) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`${styles.drawer} fixed right-0 inset-y-0 h-full w-full max-w-md flex flex-col bg-white dark:bg-gray-900 shadow-2xl will-change-transform ${
          isOpen ? styles.drawerOpen : styles.drawerClosed
        }`}
        style={{ zIndex: 2101 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Tu carrito
              {cart.length > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  ({cart.length} {cart.length === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={toggleCart}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar carrito"
            title="Cerrar carrito"
          >
            <X size={22} />
          </button>
        </div>

        {cart.length === 0 ? (
          /* Estado vacío */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 px-6 text-center">
            <ShoppingBag size={56} className="mb-4 opacity-60" />
            <p className="text-lg font-medium">Tu carrito está vacío</p>
            <p className="text-sm mt-1">Agrega productos para empezar tu compra.</p>
          </div>
        ) : (
          <>
            {/* Lista de productos (scrolleable) — se oculta durante el checkout
                para que el formulario de pago disponga de todo el alto y pueda
                hacer scroll cómodamente. */}
            <div
              className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-950/40 ${
                showCheckout ? "hidden" : ""
              }`}
            >
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${item.variacion}-${index}`}
                  className={`${styles.itemCard} flex gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl`}
                >
                  {/* Imagen */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getProductImage(item)}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.src !== PLACEHOLDER_IMAGE) {
                          e.currentTarget.src = PLACEHOLDER_IMAGE;
                        }
                      }}
                    />
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                        {item.nombre}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id, item.variacion)}
                        className="p-1.5 -mr-1 -mt-1 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                        aria-label="Eliminar del carrito"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {item.variacion && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.variacion}
                      </p>
                    )}

                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-blue-600 dark:text-blue-400 font-bold">
                        ${item.precio.toLocaleString("es-CO")}
                      </p>
                      {item.precio_original && item.precio_original !== item.precio && (
                        <p className="text-xs text-gray-400 line-through">
                          ${item.precio_original.toLocaleString("es-CO")}
                        </p>
                      )}
                    </div>

                    {item.stock !== undefined && item.stock <= 5 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                        ¡Últimas {item.stock} unidades!
                      </p>
                    )}

                    {/* Controles de cantidad + subtotal */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.variacion, item.cantidad - 1)
                          }
                          className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-semibold w-7 text-center text-gray-900 dark:text-white">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => {
                            if (item.stock !== undefined && item.cantidad >= item.stock) {
                              toast.warning(
                                `No hay más existencias disponibles de "${item.nombre}". Stock máximo: ${item.stock}`,
                                { title: "Stock agotado", duration: 4000 },
                              );
                              return;
                            }
                            updateQuantity(item.id, item.variacion, item.cantidad + 1);
                          }}
                          disabled={item.stock !== undefined && item.cantidad >= item.stock}
                          className={`p-1.5 rounded-md text-gray-700 dark:text-gray-300 transition-colors ${
                            item.stock !== undefined && item.cantidad >= item.stock
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:bg-white dark:hover:bg-gray-600"
                          }`}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${(item.precio * item.cantidad).toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout: ocupa toda el área scrolleable del drawer para que el
                formulario de pago se pueda desplazar por completo. */}
            {showCheckout ? (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="mb-3 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1"
                >
                  ← Volver
                </button>
                <EpaycoCheckout onClose={() => setShowCheckout(false)} />
              </div>
            ) : (
              /* Footer fijo: resumen + acciones */
              <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 space-y-3">
                  {/* Envíos */}
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/60 px-3 py-2">
                    {calificaEnvioGratis ? (
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <span className="font-semibold text-green-600 dark:text-green-400">✓ Envío GRATIS</span>{" "}
                        al Alto Putumayo
                      </p>
                    ) : (
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        Añade{" "}
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ${faltaParaEnvioGratis.toLocaleString("es-CO")}
                        </span>{" "}
                        más para <strong>envío GRATIS</strong> (mínimo $
                        {ENVIO_GRATIS_MINIMO.toLocaleString("es-CO")})
                      </p>
                    )}
                    <p className="text-[11px] text-blue-600/70 dark:text-blue-300/70 mt-0.5">
                      Otros destinos: se coordina por WhatsApp
                    </p>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${getTotalPrice().toLocaleString("es-CO")}
                    </span>
                  </div>

                  {/* Aviso de mezcla */}
                  {hayMezcla && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
                      ⚠️ Tu carrito tiene productos de <strong>Neurai</strong> y de{" "}
                      <strong>tiendas externas</strong>. Cada grupo se paga por separado.
                    </div>
                  )}

                  {/* Aviso bajo mínimo ePayco */}
                  {itemsPropios.length > 0 && bajoMinimo && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                      <p className="font-semibold">⚠️ Total menor al mínimo de ePayco ($5.000)</p>
                      <p>
                        Agrega otro producto, o paga{" "}
                        <strong>${totalPropios.toLocaleString("es-CO")}</strong> por Nequi al{" "}
                        <strong>317 450 3604</strong> y envía el comprobante por WhatsApp.
                      </p>
                    </div>
                  )}

                  {/* Botón pago ePayco/Nequi */}
                  {itemsPropios.length > 0 && (
                    <button
                      onClick={() => !bajoMinimo && setShowPaymentModal(true)}
                      disabled={bajoMinimo}
                      className={`w-full font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 group ${
                        bajoMinimo
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                      </svg>
                      {hayMezcla
                        ? `Pagar Neurai (${itemsPropios.length} producto${itemsPropios.length > 1 ? "s" : ""})`
                        : "Proceder al Pago"}
                    </button>
                  )}

                  {/* Botón WhatsApp para tiendas */}
                  {itemsDeTienda.length > 0 && (
                    <button
                      onClick={handleCheckoutTienda}
                      className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
                    className="w-full text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-medium py-1.5 transition-colors"
                  >
                    Vaciar carrito
                  </button>
              </div>
            )}
          </>
        )}
      </aside>

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
