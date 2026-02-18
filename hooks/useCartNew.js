/**
 * useCartNew - Hook modernizado con la nueva arquitectura
 *
 * Este hook reemplazará eventualmente a CartContext.jsx
 *
 * BENEFICIOS vs CartContext viejo:
 * - Separación de responsabilidades (Service Layer)
 * - Errores tipados y claros
 * - Lógica testeable
 * - Más fácil de mantener
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSupabaseBrowserClient } from '@/lib/db';
import { createProductRepository } from '@/lib/repositories/ProductRepository';
import { createCartService } from '@/lib/services/CartService';
import { useToast } from '@/contexts/ToastContext';
import {
  ProductNotFoundError,
  InsufficientStockError,
} from '@/lib/errors/AppErrors';

/**
 * Hook de carrito con nueva arquitectura
 */
export function useCartNew() {
  // Estado
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dependencias
  const toast = useToast();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  // Servicios (memo para evitar recrearlos en cada render)
  const productRepo = useMemo(
    () => createProductRepository(supabase),
    [supabase]
  );
  const cartService = useMemo(
    () => createCartService(productRepo),
    [productRepo]
  );

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('neuraidev_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed);

        // Opcional: Sincronizar con la BD para actualizar precios/stock
        cartService.syncCart(parsed).then(({ cart: syncedCart }) => {
          if (JSON.stringify(syncedCart) !== JSON.stringify(parsed)) {
            setCart(syncedCart);
            console.log('[useCartNew] Carrito sincronizado con la BD');
          }
        });
      } catch (error) {
        console.error('[useCartNew] Error al cargar carrito:', error);
        localStorage.removeItem('neuraidev_cart');
      }
    }
  }, [cartService]);

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
    setIsLoading(true);

    try {
      const result = await cartService.addToCart(cart, productInfo);
      setCart(result.cart);

      toast.success(`${result.addedItem.nombre} agregado al carrito`, {
        title: 'Producto agregado',
        duration: 3000,
      });

      return result;
    } catch (error) {
      console.error('[useCartNew.addToCart] Error:', error);

      if (error instanceof ProductNotFoundError) {
        toast.error('Producto no encontrado', {
          title: 'Error',
          duration: 4000,
        });
      } else if (error instanceof InsufficientStockError) {
        toast.warning(
          `Stock insuficiente. Solo quedan ${error.availableStock} unidades`,
          {
            title: 'Sin stock',
            duration: 4000,
          }
        );
      } else {
        toast.error('Error al agregar al carrito. Por favor intenta de nuevo', {
          title: 'Error',
          duration: 4000,
        });
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Actualizar cantidad de un producto
   */
  const updateQuantity = async (productId, variacion, newQuantity) => {
    setIsLoading(true);

    try {
      const result = await cartService.updateQuantity(
        cart,
        productId,
        variacion,
        newQuantity
      );
      setCart(result.cart);
      return result;
    } catch (error) {
      console.error('[useCartNew.updateQuantity] Error:', error);

      if (error instanceof InsufficientStockError) {
        toast.warning(
          `Stock insuficiente. Solo quedan ${error.availableStock} unidades`,
          {
            title: 'Sin stock',
            duration: 4000,
          }
        );
      } else {
        toast.error('Error al actualizar cantidad', {
          duration: 3000,
        });
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Eliminar producto del carrito
   */
  const removeFromCart = (productId, variacion = null) => {
    try {
      const result = cartService.removeFromCart(cart, productId, variacion);
      setCart(result.cart);

      toast.info('Producto eliminado del carrito', {
        duration: 2000,
      });

      return result;
    } catch (error) {
      console.error('[useCartNew.removeFromCart] Error:', error);
      toast.error('Error al eliminar producto', {
        duration: 3000,
      });
      throw error;
    }
  };

  /**
   * Limpiar carrito
   */
  const clearCart = () => {
    try {
      const result = cartService.clearCart();
      setCart(result.cart);
      return result;
    } catch (error) {
      console.error('[useCartNew.clearCart] Error:', error);
      throw error;
    }
  };

  /**
   * Calcular precio total
   */
  const getTotalPrice = () => {
    return cartService.calculateTotal(cart);
  };

  /**
   * Obtener número total de items
   */
  const getTotalItems = () => {
    return cartService.getTotalItems(cart);
  };

  /**
   * Validar stock de todos los productos
   */
  const validateCartStock = async () => {
    setIsLoading(true);

    try {
      const validation = await cartService.validateCartStock(cart);

      if (!validation.valid) {
        // Mostrar errores al usuario
        validation.invalidItems.forEach((item) => {
          toast.warning(`${item.productName}: ${item.error}`, {
            title: 'Verificar stock',
            duration: 5000,
          });
        });
      }

      return validation;
    } catch (error) {
      console.error('[useCartNew.validateCartStock] Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle del carrito (UI)
   */
  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  return {
    // Estado
    cart,
    isOpen,
    isLoading,

    // Acciones
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleCart,

    // Cálculos
    getTotalPrice,
    getTotalItems,

    // Validaciones
    validateCartStock,
  };
}
