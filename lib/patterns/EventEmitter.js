/**
 * EventEmitter - Observer Pattern (Pub/Sub)
 *
 * PATRÓN: Observer / Publisher-Subscriber
 *
 * PROPÓSITO:
 * - Permitir que múltiples objetos escuchen y reaccionen a eventos
 * - Desacoplar emisores de eventos de los receptores
 *
 * BENEFICIOS:
 * - Comunicación desacoplada entre componentes
 * - Fácil agregar/remover listeners sin modificar el código emisor
 * - Múltiples sistemas pueden reaccionar al mismo evento
 *
 * CASOS DE USO:
 * - Notificaciones cuando se agrega al carrito
 * - Analytics cuando se realiza una compra
 * - Logs cuando ocurre un error
 * - Actualizar UI cuando cambia el stock
 *
 * EJEMPLO:
 *
 * // Crear emitter
 * const events = new EventEmitter();
 *
 * // Suscribirse a un evento
 * events.on('product:added-to-cart', (data) => {
 *   console.log('Producto agregado:', data.productName);
 *   analytics.track('add_to_cart', data);
 * });
 *
 * // Emitir evento
 * events.emit('product:added-to-cart', {
 *   productId: '123',
 *   productName: 'iPhone 15',
 *   quantity: 1,
 * });
 */

export class EventEmitter {
  constructor() {
    // Map<eventName, Set<callback>>
    this.listeners = new Map();

    // Historial de eventos (para debugging)
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Registra un listener para un evento
   */
  on(eventName, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback debe ser una función');
    }

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName).add(callback);

    // Retornar función para desuscribirse
    return () => this.off(eventName, callback);
  }

  /**
   * Registra un listener que solo se ejecuta una vez
   */
  once(eventName, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(eventName, wrapper);
    };

    return this.on(eventName, wrapper);
  }

  /**
   * Remueve un listener específico
   */
  off(eventName, callback) {
    const listeners = this.listeners.get(eventName);

    if (listeners) {
      listeners.delete(callback);

      // Limpiar si no quedan listeners
      if (listeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  /**
   * Remueve todos los listeners de un evento
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Emite un evento a todos los listeners
   */
  emit(eventName, data) {
    const listeners = this.listeners.get(eventName);

    // Agregar al historial
    this._addToHistory(eventName, data);

    if (!listeners || listeners.size === 0) {
      console.debug(`[EventEmitter] No hay listeners para: ${eventName}`);
      return;
    }

    // Ejecutar todos los listeners
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(
          `[EventEmitter] Error en listener de ${eventName}:`,
          error
        );
      }
    });
  }

  /**
   * Emite un evento de forma asíncrona
   */
  async emitAsync(eventName, data) {
    const listeners = this.listeners.get(eventName);

    this._addToHistory(eventName, data);

    if (!listeners || listeners.size === 0) {
      return [];
    }

    // Ejecutar todos los listeners en paralelo
    const promises = Array.from(listeners).map((callback) =>
      Promise.resolve()
        .then(() => callback(data))
        .catch((error) => {
          console.error(
            `[EventEmitter] Error en listener async de ${eventName}:`,
            error
          );
          return null;
        })
    );

    return await Promise.all(promises);
  }

  /**
   * Obtiene el número de listeners para un evento
   */
  listenerCount(eventName) {
    const listeners = this.listeners.get(eventName);
    return listeners ? listeners.size : 0;
  }

  /**
   * Obtiene todos los nombres de eventos registrados
   */
  eventNames() {
    return Array.from(this.listeners.keys());
  }

  /**
   * Agrega evento al historial
   */
  _addToHistory(eventName, data) {
    this.eventHistory.push({
      eventName,
      data,
      timestamp: new Date().toISOString(),
    });

    // Mantener tamaño del historial
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Obtiene el historial de eventos
   */
  getHistory(eventName = null) {
    if (eventName) {
      return this.eventHistory.filter((e) => e.eventName === eventName);
    }
    return [...this.eventHistory];
  }

  /**
   * Limpia el historial
   */
  clearHistory() {
    this.eventHistory = [];
  }
}

/**
 * Instancia global singleton del event emitter
 */
let globalEventEmitter = null;

export function getGlobalEventEmitter() {
  if (!globalEventEmitter) {
    globalEventEmitter = new EventEmitter();
  }
  return globalEventEmitter;
}

/**
 * Eventos predefinidos del sistema
 */
export const SystemEvents = {
  // Productos
  PRODUCT_VIEWED: 'product:viewed',
  PRODUCT_ADDED_TO_CART: 'product:added-to-cart',
  PRODUCT_REMOVED_FROM_CART: 'product:removed-from-cart',
  PRODUCT_OUT_OF_STOCK: 'product:out-of-stock',

  // Carrito
  CART_UPDATED: 'cart:updated',
  CART_CLEARED: 'cart:cleared',
  CART_SYNCED: 'cart:synced',

  // Órdenes
  ORDER_CREATED: 'order:created',
  ORDER_COMPLETED: 'order:completed',
  ORDER_FAILED: 'order:failed',
  ORDER_CANCELLED: 'order:cancelled',

  // Pagos
  PAYMENT_INITIATED: 'payment:initiated',
  PAYMENT_SUCCESS: 'payment:success',
  PAYMENT_FAILED: 'payment:failed',

  // Usuario
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_REGISTERED: 'user:registered',

  // Blog
  BLOG_POST_VIEWED: 'blog:post-viewed',

  // Errores
  ERROR_OCCURRED: 'error:occurred',
};

/**
 * Helper para crear listeners tipados
 */
export class EventListener {
  constructor(eventEmitter = null) {
    this.emitter = eventEmitter || getGlobalEventEmitter();
  }

  /**
   * Escuchar cuando se agrega un producto al carrito
   */
  onProductAddedToCart(callback) {
    return this.emitter.on(SystemEvents.PRODUCT_ADDED_TO_CART, callback);
  }

  /**
   * Escuchar cuando se crea una orden
   */
  onOrderCreated(callback) {
    return this.emitter.on(SystemEvents.ORDER_CREATED, callback);
  }

  /**
   * Escuchar cuando hay un error
   */
  onError(callback) {
    return this.emitter.on(SystemEvents.ERROR_OCCURRED, callback);
  }

  /**
   * Escuchar cuando se actualiza el carrito
   */
  onCartUpdated(callback) {
    return this.emitter.on(SystemEvents.CART_UPDATED, callback);
  }
}

/**
 * Helper para emitir eventos
 */
export class EventPublisher {
  constructor(eventEmitter = null) {
    this.emitter = eventEmitter || getGlobalEventEmitter();
  }

  /**
   * Notificar que se agregó un producto al carrito
   */
  productAddedToCart(productData) {
    this.emitter.emit(SystemEvents.PRODUCT_ADDED_TO_CART, productData);
  }

  /**
   * Notificar que se creó una orden
   */
  orderCreated(orderData) {
    this.emitter.emit(SystemEvents.ORDER_CREATED, orderData);
  }

  /**
   * Notificar un error
   */
  errorOccurred(errorData) {
    this.emitter.emit(SystemEvents.ERROR_OCCURRED, errorData);
  }

  /**
   * Notificar que se actualizó el carrito
   */
  cartUpdated(cartData) {
    this.emitter.emit(SystemEvents.CART_UPDATED, cartData);
  }
}
