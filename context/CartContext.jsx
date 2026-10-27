"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useToast } from "@/contexts/ToastContext";
import { calcularDescuentosPromociones } from "@/lib/promociones";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  // Promociones vigentes (p. ej. "10% llevando 5 o más"): el descuento se
  // calcula con lo que hay en el carrito, igual que el checkout en el servidor.
  const [promociones, setPromociones] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetch("/api/promociones?activas=true")
      .then((r) => r.json())
      .then((d) => setPromociones(d.promociones || []))
      .catch(() => {});
  }, []);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem("neuraidev_cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (err) {
        console.error("Error al cargar carrito:", err);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("neuraidev_cart", JSON.stringify(cart));
  }, [cart]);

  // Verificar stock disponible
  const checkStock = async (productId) => {
    throw new Error('Not implemented: migrating to Cloudflare D1');
  };

  // Agregar producto al carrito
  const addToCart = async (producto, cantidad = 1, variacion = null) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.id === producto.id &&
          JSON.stringify(item.variacion) === JSON.stringify(variacion),
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          cantidad: newCart[existingItemIndex].cantidad + cantidad,
        };
        return newCart;
      }

      // Normalizar imágenes: el producto puede traer `imagenes` como array
      // de objetos {url}, array de strings, o un JSON string ("[...]").
      // También soporta `imagen_principal` (productos de la tabla D1).
      let imagenesArr = producto.imagenes;
      if (typeof imagenesArr === "string" && imagenesArr.trim().startsWith("[")) {
        try {
          imagenesArr = JSON.parse(imagenesArr);
        } catch {
          imagenesArr = null;
        }
      }
      if (!Array.isArray(imagenesArr)) {
        imagenesArr = producto.imagen ? [producto.imagen] : [];
      }
      const primeraImagen =
        producto.imagen_principal ||
        (imagenesArr[0] && typeof imagenesArr[0] === "object"
          ? imagenesArr[0].url
          : imagenesArr[0]) ||
        producto.imagen ||
        null;

      const newItem = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: primeraImagen,
        imagenes: imagenesArr,
        cantidad,
        variacion,
        categoria: producto.categoria,
        stock: producto.stock ?? 999,
        metadata: producto.metadata || {},
        // seller_clerk_user_id solo aplica a tiendas externas (tienen seller_whatsapp)
        seller_clerk_user_id: producto.seller_whatsapp ? (producto.seller_clerk_user_id || null) : null,
        seller_whatsapp: producto.seller_whatsapp || null,
        seller_nombre: producto.seller_nombre || null,
      };
      return [...prevCart, newItem];
    });

    return true;
  };

  // Remover producto del carrito
  const removeFromCart = (itemId, variacion = null) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.id === itemId &&
            JSON.stringify(item.variacion) === JSON.stringify(variacion)
          ),
      ),
    );
  };

  // Actualizar cantidad de un producto
  const updateQuantity = async (itemId, variacion, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, variacion);
      return true;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId &&
        JSON.stringify(item.variacion) === JSON.stringify(variacion)
          ? { ...item, cantidad: newQuantity }
          : item,
      ),
    );

    return true;
  };

  // Limpiar carrito
  const clearCart = () => {
    setCart([]);
  };

  // Obtener cantidad total de items
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cantidad, 0);
  };

  // Subtotal sin promociones
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  // Descuentos de promociones sobre los productos propios del carrito
  const promosCarrito = useMemo(
    () =>
      calcularDescuentosPromociones(
        cart
          .filter((item) => !item.seller_clerk_user_id)
          .map((item) => ({ id: item.id, cantidad: item.cantidad, precio: item.precio })),
        promociones,
      ),
    [cart, promociones],
  );

  // Total a pagar (con descuentos de promociones)
  const getTotalPrice = () => getSubtotal() - promosCarrito.total;

  // Abrir/cerrar carrito
  const toggleCart = () => {
    setIsOpen((prev) => !prev);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getSubtotal,
    descuentosPromociones: promosCarrito.descuentos,
    promociones,
    checkStock,
    isOpen,
    toggleCart,
    setIsOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
