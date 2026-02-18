/**
 * CartService - Service Layer para lógica de carrito
 *
 * PROPÓSITO: Extraer TODA la lógica de negocio del carrito del Context
 *
 * ANTES (CartContext hacía):
 * - Estado UI (isOpen)
 * - Persistencia (localStorage)
 * - Validación de negocio (stock)
 * - Acceso a BD (Supabase)
 * - Migración de datos
 * - Notificaciones (toast)
 *
 * AHORA (CartService hace):
 * - SOLO lógica de negocio
 * - Validación
 * - Transformación de datos
 *
 * Context solo maneja: Estado UI
 */

import { Product } from '../models/Product';
import {
  ProductNotFoundError,
  InsufficientStockError,
  ValidationError,
} from '../errors/AppErrors';

export class CartService {
  constructor(productRepository) {
    this.productRepo = productRepository;
  }

  /**
   * Agrega un producto al carrito
   */
  async addToCart(currentCart, productInfo) {
    try {
      // 1. Obtener producto de la BD para asegurar datos frescos
      const product = await this.productRepo.findById(productInfo.id);

      if (!product) {
        throw new ProductNotFoundError(productInfo.id);
      }

      // 2. Validar stock disponible
      const requestedQuantity = productInfo.cantidad || 1;
      const existingItem = this._findCartItem(currentCart, product.id, productInfo.variacion);
      const totalQuantity = (existingItem?.cantidad || 0) + requestedQuantity;

      if (!Product.hasStock(product, totalQuantity)) {
        throw new InsufficientStockError(
          product.id,
          totalQuantity,
          product.stock
        );
      }

      // 3. Agregar o actualizar item en el carrito
      const newCart = this._mergeCartItem(currentCart, {
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: requestedQuantity,
        stock: product.stock,
        imagen: product.imagenPrincipal,
        imagenes: product.imagenes,
        variacion: productInfo.variacion || null,
        categoria: product.categoria,
      });

      return {
        success: true,
        cart: newCart,
        addedItem: product,
      };
    } catch (error) {
      console.error('[CartService.addToCart] Error:', error);
      throw error;
    }
  }

  /**
   * Actualiza la cantidad de un producto en el carrito
   */
  async updateQuantity(currentCart, productId, variacion, newQuantity) {
    try {
      // Validar cantidad mínima
      if (newQuantity < 1) {
        return this.removeFromCart(currentCart, productId, variacion);
      }

      // Verificar stock disponible
      const product = await this.productRepo.findById(productId);
      if (!product) {
        throw new ProductNotFoundError(productId);
      }

      if (!Product.hasStock(product, newQuantity)) {
        throw new InsufficientStockError(productId, newQuantity, product.stock);
      }

      // Actualizar cantidad
      const updatedCart = currentCart.map((item) => {
        if (item.id === productId && item.variacion === variacion) {
          return { ...item, cantidad: newQuantity };
        }
        return item;
      });

      return {
        success: true,
        cart: updatedCart,
      };
    } catch (error) {
      console.error('[CartService.updateQuantity] Error:', error);
      throw error;
    }
  }

  /**
   * Elimina un producto del carrito
   */
  removeFromCart(currentCart, productId, variacion = null) {
    const updatedCart = currentCart.filter((item) => {
      if (variacion) {
        return !(item.id === productId && item.variacion === variacion);
      }
      return item.id !== productId;
    });

    return {
      success: true,
      cart: updatedCart,
    };
  }

  /**
   * Limpia el carrito
   */
  clearCart() {
    return {
      success: true,
      cart: [],
    };
  }

  /**
   * Calcula el total del carrito
   */
  calculateTotal(cart) {
    return cart.reduce((total, item) => {
      return total + item.precio * item.cantidad;
    }, 0);
  }

  /**
   * Calcula el número total de items
   */
  getTotalItems(cart) {
    return cart.reduce((total, item) => total + item.cantidad, 0);
  }

  /**
   * Valida que todos los productos del carrito tengan stock
   */
  async validateCartStock(cart) {
    const validationResults = [];

    for (const item of cart) {
      try {
        const product = await this.productRepo.findById(item.id);

        if (!product) {
          validationResults.push({
            productId: item.id,
            valid: false,
            error: 'Producto no encontrado',
          });
          continue;
        }

        const hasStock = Product.hasStock(product, item.cantidad);
        validationResults.push({
          productId: item.id,
          productName: product.nombre,
          valid: hasStock,
          requestedQuantity: item.cantidad,
          availableStock: product.stock,
          error: hasStock ? null : 'Stock insuficiente',
        });
      } catch (error) {
        validationResults.push({
          productId: item.id,
          valid: false,
          error: error.message,
        });
      }
    }

    const allValid = validationResults.every((result) => result.valid);

    return {
      valid: allValid,
      results: validationResults,
      invalidItems: validationResults.filter((r) => !r.valid),
    };
  }

  /**
   * Sincroniza el carrito con la base de datos
   * (actualiza precios, verifica existencia, etc.)
   */
  async syncCart(cart) {
    const syncedCart = [];

    for (const item of cart) {
      try {
        const product = await this.productRepo.findById(item.id);

        if (!product) {
          console.warn(`[CartService] Producto ${item.id} no encontrado, removiendo del carrito`);
          continue;
        }

        // Actualizar con datos frescos de la BD
        syncedCart.push({
          ...item,
          nombre: product.nombre,
          precio: product.precio,
          stock: product.stock,
          imagen: product.imagenPrincipal,
          imagenes: product.imagenes,
          // Mantener la cantidad del carrito
          cantidad: Math.min(item.cantidad, product.stock),
        });
      } catch (error) {
        console.error(`[CartService] Error sincronizando producto ${item.id}:`, error);
        // En caso de error, mantener el item pero marcarlo
        syncedCart.push({
          ...item,
          _syncError: true,
        });
      }
    }

    return {
      success: true,
      cart: syncedCart,
      removedItems: cart.length - syncedCart.length,
    };
  }

  /**
   * Métodos privados
   */

  /**
   * Busca un item en el carrito
   */
  _findCartItem(cart, productId, variacion = null) {
    return cart.find((item) => {
      if (variacion) {
        return item.id === productId && item.variacion === variacion;
      }
      return item.id === productId;
    });
  }

  /**
   * Merge de item en el carrito (agregar o actualizar)
   */
  _mergeCartItem(cart, newItem) {
    const existingItemIndex = cart.findIndex((item) => {
      if (newItem.variacion) {
        return item.id === newItem.id && item.variacion === newItem.variacion;
      }
      return item.id === newItem.id;
    });

    if (existingItemIndex >= 0) {
      // Item existe, actualizar cantidad
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        cantidad: updatedCart[existingItemIndex].cantidad + newItem.cantidad,
      };
      return updatedCart;
    } else {
      // Item nuevo, agregar
      return [...cart, newItem];
    }
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createCartService(productRepository) {
  return new CartService(productRepository);
}
