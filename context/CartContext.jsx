"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

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

      const newItem = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagenes?.[0] || producto.imagen || null,
        imagenes: producto.imagenes || (producto.imagen ? [producto.imagen] : []),
        cantidad,
        variacion,
        categoria: producto.categoria,
        stock: producto.stock ?? 999,
        metadata: producto.metadata || {},
        seller_clerk_user_id: producto.seller_clerk_user_id || null,
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

  // Obtener precio total
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

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
