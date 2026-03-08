"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { ShoppingCart, Plus, Minus, AlertTriangle, X } from "lucide-react";
import ProductColorPicker from "./ProductColorPicker";
import PaymentMethodModal from "./PaymentMethodModal";
import NequiPaymentModal from "./NequiPaymentModal";
import { getSupabaseBrowserClient } from "@/lib/db";
import { createProductRepository } from "@/lib/repositories/ProductRepository";
import { InsufficientStockError } from "@/lib/errors/AppErrors";

export default function AddToCartButton({ producto }) {
  const { addToCart, checkStock, cart } = useCart();
  const toast = useToast();
  const [cantidad, setCantidad] = useState(1);
  const [variacionSeleccionada, setVariacionSeleccionada] = useState(null);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stockDisponible, setStockDisponible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNoStockModal, setShowNoStockModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showNequiModal, setShowNequiModal] = useState(false);
  const [colorParaNequi, setColorParaNequi] = useState(null);

  // Usar la nueva arquitectura (Repository Pattern)
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const productRepo = useMemo(() => createProductRepository(supabase), [supabase]);

  // Obtener colores disponibles desde metadata
  const coloresDisponibles = producto.metadata?.colores_disponibles || [];

  // Normalizar datos del producto para manejar diferentes formatos
  const productData = {
    id: producto.id,
    nombre: producto.title || producto.nombre || "Producto",
    precio: parseFloat(
      (producto.price || producto.precio || 0)
        .toString()
        .replace(/[^\d.-]/g, ""),
    ),
    imagen: Array.isArray(producto.images)
      ? producto.images[0]
      : Array.isArray(producto.imagenes)
        ? producto.imagenes[0]
        : producto.imagen || "/placeholder.jpg",
    imagenes: Array.isArray(producto.images)
      ? producto.images
      : Array.isArray(producto.imagenes)
        ? producto.imagenes
        : producto.imagen
          ? [producto.imagen]
          : [],
    categoria: producto.categoria || "general",
  };

  // Cargar stock disponible al montar el componente usando Repository
  useEffect(() => {
    const fetchStock = async () => {
      try {
        // Usar ProductRepository en lugar de checkStock directo
        const stock = await productRepo.checkStock(producto.id);
        setStockDisponible(stock);
      } catch (error) {
        console.error("Error al cargar stock:", error);
        // Fallback al método viejo si falla
        try {
          const stock = await checkStock(producto.id);
          setStockDisponible(stock);
        } catch (fallbackError) {
          console.error("Error en fallback:", fallbackError);
          setStockDisponible(0);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [producto.id, productRepo, checkStock]);

  // Manejar el modal de sin stock (cerrar con Escape y prevenir scroll)
  useEffect(() => {
    if (showNoStockModal) {
      // Prevenir scroll del body
      document.body.style.overflow = "hidden";

      // Cerrar con tecla Escape
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          setShowNoStockModal(false);
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [showNoStockModal]);

  // Detectar si el producto tiene variaciones (por ejemplo, color)
  const tieneVariaciones =
    producto.variaciones && producto.variaciones.length > 0;

  // Abrir modal de selección de método de pago
  const handleOpenPaymentModal = async () => {
    try {
      // Usar ProductRepository para verificar stock
      const stockActual = await productRepo.checkStock(producto.id);

      // Calcular cuántos productos de este tipo ya están en el carrito
      const cantidadEnCarrito = cart.reduce((total, item) => {
        if (item.id === producto.id) {
          return total + item.cantidad;
        }
        return total;
      }, 0);

      const stockRestante = stockActual - cantidadEnCarrito;

      // Si no hay stock disponible, mostrar modal de sin stock
      if (stockRestante <= 0 || cantidad > stockRestante) {
        setShowNoStockModal(true);
        return;
      }

      // Abrir modal de selección de método de pago
      setShowPaymentMethodModal(true);
    } catch (error) {
      console.error("Error al verificar stock:", error);
      toast.error("Error al verificar disponibilidad");
    }
  };

  // Manejar selección de Nequi
  const handleSelectNequi = (color) => {
    setColorParaNequi(color);
    setColorSeleccionado(color);
    setShowPaymentMethodModal(false);
    setShowNequiModal(true);
  };

  // Manejar selección de ePayco (flujo normal al carrito)
  const handleSelectEpayco = async (color) => {
    if (color) {
      setColorSeleccionado(color);
    }

    setShowPaymentMethodModal(false);

    // Verificar si hay variaciones
    if (tieneVariaciones && !variacionSeleccionada) {
      toast.warning("Por favor selecciona una variación", {
        title: "Variación Requerida",
        duration: 4000,
      });
      return;
    }

    // Usar ProductRepository para verificar stock en tiempo real
    const stockActual = await productRepo.checkStock(producto.id);

    // Calcular cuántos productos de este tipo ya están en el carrito
    const cantidadEnCarrito = cart.reduce((total, item) => {
      if (
        item.id === producto.id &&
        JSON.stringify(item.variacion) === JSON.stringify(variacionSeleccionada || color)
      ) {
        return total + item.cantidad;
      }
      return total;
    }, 0);

    const stockRestante = stockActual - cantidadEnCarrito;

    // Si no hay stock disponible, mostrar modal
    if (stockRestante <= 0) {
      setShowNoStockModal(true);
      return;
    }

    // Si la cantidad solicitada excede el stock restante, mostrar modal
    if (cantidad > stockRestante) {
      setShowNoStockModal(true);
      return;
    }

    // Usar color seleccionado como variación si existe, sino usar variación normal
    const variacionFinal = color || variacionSeleccionada;

    const success = await addToCart(
      productData,
      cantidad,
      variacionFinal,
    );

    if (!success) {
      // Si addToCart falla, también mostrar el modal
      setShowNoStockModal(true);
      return;
    }

    // Actualizar stock disponible después de agregar
    setStockDisponible(stockActual - cantidad);

    // Mostrar mensaje de éxito
    toast.success(
      `${cantidad} ${cantidad > 1 ? "unidades agregadas" : "unidad agregada"} al carrito`,
      {
        title: "¡Producto Agregado!",
        duration: 3000,
      },
    );

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCantidad(1);
      setVariacionSeleccionada(null);
    }, 2000);
  };

  const incrementar = () => {
    if (stockDisponible !== null && cantidad >= stockDisponible) {
      toast.warning(`Solo hay ${stockDisponible} unidades disponibles`, {
        title: "Stock Limitado",
        duration: 3000,
      });
      return;
    }
    setCantidad((prev) => prev + 1);
  };

  const decrementar = () => setCantidad((prev) => (prev > 1 ? prev - 1 : 1));

  // Si aún está cargando el stock
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Si no hay stock disponible
  if (stockDisponible === 0) {
    return (
      <div className="space-y-3">
        <div className="w-full px-4 py-2.5 rounded-lg font-medium bg-gray-300 text-gray-600 text-center">
          Sin Stock Disponible
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes buzzInterval {
          0% { transform: translateX(0); }
          2% { transform: translateX(-3px); }
          4% { transform: translateX(3px); }
          6% { transform: translateX(-3px); }
          8% { transform: translateX(3px); }
          10% { transform: translateX(-3px); }
          12% { transform: translateX(3px); }
          14% { transform: translateX(0); }
          100% { transform: translateX(0); }
        }

        .buzz-interval {
          animation: buzzInterval 2s ease-in-out infinite;
        }
      `}</style>

      <div className="space-y-3">
        {/* Selector de variaciones si existen (NO colores, esos van en el modal) */}
        {tieneVariaciones && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Selecciona una opción:
          </div>
          <div className="flex flex-wrap gap-2">
            {producto.variaciones.map((variacion, index) => (
              <button
                key={index}
                onClick={() => setVariacionSeleccionada(variacion)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  variacionSeleccionada === variacion
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {variacion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Indicador de stock */}
      <div className="text-sm text-gray-600">
        <span
          className={
            stockDisponible <= 5 ? "text-orange-600 font-semibold" : ""
          }
        >
          {stockDisponible <= 5 ? "¡Últimas unidades! " : ""}
          Stock disponible: <strong>{stockDisponible}</strong>
        </span>
      </div>

      {/* Selector de cantidad */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Cantidad:</span>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={decrementar}
            className="p-2 hover:bg-gray-100 transition-colors"
            aria-label="Disminuir cantidad"
          >
            <Minus size={16} />
          </button>
          <span className="px-4 py-1 font-semibold min-w-[3ch] text-center">
            {cantidad}
          </span>
          <button
            onClick={incrementar}
            className="p-2 hover:bg-gray-100 transition-colors"
            aria-label="Aumentar cantidad"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Botón de agregar al carrito */}
      <button
        onClick={handleOpenPaymentModal}
        disabled={showSuccess}
        className={`w-full flex items-center justify-center gap-2 px-4 py-4 rounded-lg font-medium transition-all buzz-interval ${
          showSuccess
            ? "bg-green-500 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
        }`}
      >
        {showSuccess ? (
          <>
            <span>✓</span>
            <span>¡Agregado!</span>
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            <span>Agregar al Carrito</span>
          </>
        )}
      </button>

      {/* Modal de Sin Stock */}
      {showNoStockModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowNoStockModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setShowNoStockModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>

            {/* Icono de alerta */}
            <div className="flex justify-center mb-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-4">
                <AlertTriangle
                  size={48}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
            </div>

            {/* Título */}
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
              ¡Sin Stock Disponible!
            </h3>

            {/* Mensaje */}
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              Lo sentimos, ya no hay más unidades disponibles de{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                &ldquo;{productData.nombre}&rdquo;
              </span>{" "}
              en este momento.
            </p>

            {/* Información adicional */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-center text-orange-800 dark:text-orange-300">
                📦 Stock actual: <strong>{stockDisponible || 0}</strong>{" "}
                unidades
                <br />
                🛒 En tu carrito:{" "}
                <strong>
                  {cart.reduce((total, item) => {
                    if (item.id === producto.id) {
                      return total + item.cantidad;
                    }
                    return total;
                  }, 0)}
                </strong>{" "}
                unidades
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowNoStockModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Entendido
              </button>

              <a
                href={`https://wa.me/573174503604?text=${encodeURIComponent(
                  `Hola! 👋\n\nQuiero más unidades de este producto:\n\n📦 ${productData.nombre}\n💰 Precio: $${productData.precio.toLocaleString("es-CO")}\n\n¿Cuándo tendrán disponibilidad?`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Consultar disponibilidad
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selección de Método de Pago */}
      <PaymentMethodModal
        isOpen={showPaymentMethodModal}
        onClose={() => setShowPaymentMethodModal(false)}
        producto={producto}
        coloresDisponibles={coloresDisponibles}
        colorInicial={colorSeleccionado}
        cantidad={cantidad}
        descuento={5}
        onSelectNequi={handleSelectNequi}
        onSelectEpayco={handleSelectEpayco}
      />

      {/* Modal de Instrucciones Nequi */}
      <NequiPaymentModal
        isOpen={showNequiModal}
        onClose={() => setShowNequiModal(false)}
        producto={producto}
        colorSeleccionado={colorParaNequi}
        cantidad={cantidad}
        descuento={5}
        numeroNequi="3174503604"
        nombreNegocio="Neurai.dev"
      />
      </div>
    </>
  );
}
