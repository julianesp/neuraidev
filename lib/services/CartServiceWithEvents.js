/**
 * CartServiceWithEvents - CartService con Observer Pattern integrado
 *
 * Extiende CartService para emitir eventos en operaciones clave
 * Esto permite que otros sistemas reaccionen a cambios en el carrito
 */

import { CartService } from './CartService';
import { EventPublisher, SystemEvents } from '../patterns/EventEmitter';

export class CartServiceWithEvents extends CartService {
  constructor(productRepository, eventEmitter = null) {
    super(productRepository);
    this.eventPublisher = new EventPublisher(eventEmitter);
  }

  /**
   * Agrega un producto al carrito y emite evento
   */
  async addToCart(currentCart, productInfo) {
    const result = await super.addToCart(currentCart, productInfo);

    // Emitir evento
    this.eventPublisher.productAddedToCart({
      product: result.addedItem,
      quantity: productInfo.cantidad || 1,
      cartTotal: this.calculateTotal(result.cart),
      timestamp: new Date().toISOString(),
    });

    // También emitir evento genérico de actualización
    this.eventPublisher.cartUpdated({
      cart: result.cart,
      action: 'add',
      productId: productInfo.id,
    });

    return result;
  }

  /**
   * Actualiza cantidad y emite evento
   */
  async updateQuantity(currentCart, productId, variacion, newQuantity) {
    const result = await super.updateQuantity(
      currentCart,
      productId,
      variacion,
      newQuantity
    );

    // Emitir evento
    this.eventPublisher.cartUpdated({
      cart: result.cart,
      action: 'update',
      productId,
      newQuantity,
    });

    return result;
  }

  /**
   * Elimina producto y emite evento
   */
  removeFromCart(currentCart, productId, variacion = null) {
    const result = super.removeFromCart(currentCart, productId, variacion);

    // Emitir evento
    this.eventPublisher.cartUpdated({
      cart: result.cart,
      action: 'remove',
      productId,
    });

    return result;
  }

  /**
   * Limpia carrito y emite evento
   */
  clearCart() {
    const result = super.clearCart();

    // Emitir evento
    this.eventPublisher.cartUpdated({
      cart: result.cart,
      action: 'clear',
    });

    return result;
  }
}

/**
 * Factory para crear instancia del servicio con eventos
 */
export function createCartServiceWithEvents(productRepository, eventEmitter) {
  return new CartServiceWithEvents(productRepository, eventEmitter);
}
