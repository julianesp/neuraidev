/**
 * AnalyticsListener - Listener para eventos de analytics
 *
 * PATRÓN: Observer
 *
 * Este listener escucha eventos del sistema y envía datos a analytics
 * (Google Analytics, Mixpanel, etc.)
 *
 * BENEFICIO: Desacoplado del código de negocio
 * - El CartService no sabe que existe analytics
 * - Podemos agregar/quitar analytics sin modificar CartService
 * - Múltiples sistemas de analytics pueden escuchar los mismos eventos
 */

import { EventListener, SystemEvents } from '../patterns/EventEmitter';

export class AnalyticsListener {
  constructor(eventEmitter, analyticsProvider) {
    this.listener = new EventListener(eventEmitter);
    this.analytics = analyticsProvider;

    // Suscribirse a eventos
    this._setupListeners();
  }

  /**
   * Configura todos los listeners de analytics
   */
  _setupListeners() {
    // Producto agregado al carrito
    this.listener.onProductAddedToCart((data) => {
      this._trackAddToCart(data);
    });

    // Orden creada
    this.listener.onOrderCreated((data) => {
      this._trackPurchase(data);
    });

    // Error ocurrido
    this.listener.onError((data) => {
      this._trackError(data);
    });

    // Carrito actualizado
    this.listener.onCartUpdated((data) => {
      this._trackCartUpdate(data);
    });
  }

  /**
   * Trackea cuando se agrega al carrito
   */
  _trackAddToCart(data) {
    try {
      if (this.analytics?.track) {
        this.analytics.track('add_to_cart', {
          currency: 'COP',
          value: data.product.precio * data.quantity,
          items: [
            {
              item_id: data.product.id,
              item_name: data.product.nombre,
              item_category: data.product.categoria,
              price: data.product.precio,
              quantity: data.quantity,
            },
          ],
        });
      }

      console.log('[Analytics] Add to cart tracked:', data.product.nombre);
    } catch (error) {
      console.error('[AnalyticsListener] Error tracking add to cart:', error);
    }
  }

  /**
   * Trackea cuando se completa una compra
   */
  _trackPurchase(data) {
    try {
      if (this.analytics?.track) {
        this.analytics.track('purchase', {
          transaction_id: data.orderId,
          currency: 'COP',
          value: data.total,
          shipping: data.shipping || 0,
          tax: data.tax || 0,
          items: data.items.map((item) => ({
            item_id: item.id,
            item_name: item.nombre,
            item_category: item.categoria,
            price: item.precio,
            quantity: item.cantidad,
          })),
        });
      }

      console.log('[Analytics] Purchase tracked:', data.orderId);
    } catch (error) {
      console.error('[AnalyticsListener] Error tracking purchase:', error);
    }
  }

  /**
   * Trackea errores
   */
  _trackError(data) {
    try {
      if (this.analytics?.track) {
        this.analytics.track('error', {
          error_type: data.type,
          error_message: data.message,
          error_stack: data.stack,
          page: data.page,
        });
      }

      console.log('[Analytics] Error tracked:', data.type);
    } catch (error) {
      console.error('[AnalyticsListener] Error tracking error:', error);
    }
  }

  /**
   * Trackea actualizaciones del carrito
   */
  _trackCartUpdate(data) {
    try {
      const actions = {
        add: 'add_to_cart',
        remove: 'remove_from_cart',
        update: 'update_cart',
        clear: 'clear_cart',
      };

      const eventName = actions[data.action] || 'cart_updated';

      if (this.analytics?.track) {
        this.analytics.track(eventName, {
          action: data.action,
          cart_size: data.cart.length,
          product_id: data.productId,
        });
      }

      console.log('[Analytics] Cart update tracked:', data.action);
    } catch (error) {
      console.error('[AnalyticsListener] Error tracking cart update:', error);
    }
  }
}

/**
 * Logger Listener - Log todos los eventos del sistema
 */
export class LoggerListener {
  constructor(eventEmitter) {
    this.listener = new EventListener(eventEmitter);
    this._setupListeners();
  }

  _setupListeners() {
    // Log de todos los eventos importantes
    this.listener.emitter.on('*', (eventName, data) => {
      console.log(`[Event] ${eventName}:`, data);
    });
  }
}

/**
 * Notification Listener - Muestra notificaciones al usuario
 */
export class NotificationListener {
  constructor(eventEmitter, toastService) {
    this.listener = new EventListener(eventEmitter);
    this.toast = toastService;
    this._setupListeners();
  }

  _setupListeners() {
    // Producto agregado al carrito
    this.listener.onProductAddedToCart((data) => {
      if (this.toast) {
        this.toast.success(`${data.product.nombre} agregado al carrito`);
      }
    });

    // Orden creada
    this.listener.onOrderCreated((data) => {
      if (this.toast) {
        this.toast.success('¡Orden creada exitosamente!');
      }
    });

    // Error
    this.listener.onError((data) => {
      if (this.toast) {
        this.toast.error(`Error: ${data.message}`);
      }
    });
  }
}

/**
 * Stock Monitor Listener - Monitorea stock bajo
 */
export class StockMonitorListener {
  constructor(eventEmitter, lowStockThreshold = 5) {
    this.listener = new EventListener(eventEmitter);
    this.threshold = lowStockThreshold;
    this._setupListeners();
  }

  _setupListeners() {
    this.listener.onProductAddedToCart((data) => {
      this._checkStock(data.product);
    });
  }

  _checkStock(product) {
    if (product.stock <= this.threshold) {
      console.warn(
        `[StockMonitor] Stock bajo para ${product.nombre}: ${product.stock} unidades`
      );

      // Aquí podrías enviar una notificación al admin
      // o crear una alerta en el sistema
    }
  }
}

/**
 * Setup completo de listeners
 */
export function setupAnalytics(eventEmitter, config = {}) {
  const listeners = [];

  // Analytics
  if (config.analytics) {
    listeners.push(
      new AnalyticsListener(eventEmitter, config.analytics)
    );
  }

  // Logger (solo en desarrollo)
  if (config.enableLogging || process.env.NODE_ENV === 'development') {
    listeners.push(new LoggerListener(eventEmitter));
  }

  // Notifications
  if (config.toastService) {
    listeners.push(
      new NotificationListener(eventEmitter, config.toastService)
    );
  }

  // Stock monitor
  if (config.enableStockMonitor) {
    listeners.push(
      new StockMonitorListener(eventEmitter, config.lowStockThreshold)
    );
  }

  return listeners;
}
