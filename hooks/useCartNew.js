/**
 * useCartNew - Hook modernizado con la nueva arquitectura
 *
 * NOTE: Supabase removed — pending migration to Cloudflare D1.
 * Functions that required Supabase throw 'Not implemented' until migrated.
 */

'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import {
  ProductNotFoundError,
  InsufficientStockError,
} from '@/lib/errors/AppErrors';

/**
 * Hook de carrito con nueva arquitectura
 */
export function useCartNew() {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('neuraidev_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed);
      } catch (error) {
        console.error('[useCartNew] Error al cargar carrito:', error);
        localStorage.removeItem('neuraidev_cart');
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (cart.length >= 0) {
      localStorage.setItem('neuraidev_cart', JSON.stringify(cart));
    }
  }, [cart]);

  /**
   * Agregar producto al carrito
   */
  const addToCart = async (productInfo) => {
    throw new Error('Not implemented: migrating to Cloudflare D1');
  };

  /**
   * Actualizar cantidad de un producto
   */
  const updateQuantity = async (productId, variacion, newQuantity) => {
    throw new Error('Not implemented: migrating to Cloudflare D1');
  };

  /**
   * Eliminar producto del carrito
   */
  const removeFromCart = (productId, variacion = null) => {
    throw new Error('Not implemented: migrating to Cloudflare D1');
  };

  /**
   * Limpiar carrito
   */
  const clearCart = () => {
    setCart([]);
  };

  /**
   * Calcular precio total
   */
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  /**
   * Obtener número total de items
   */
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cantidad, 0);
  };

  /**
   * Validar stock de todos los productos
   */
  const validateCartStock = async () => {
    throw new Error('Not implemented: migrating to Cloudflare D1');
  };

  /**
   * Toggle del carrito (UI)
   */
  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  return {
    cart,
    isOpen,
    isLoading,

    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleCart,

    getTotalPrice,
    getTotalItems,

    validateCartStock,
  };
}
