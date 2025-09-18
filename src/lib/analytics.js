// Utilitarios para tracking de eventos de e-commerce

export const AnalyticsEvents = {
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  VIEW_CART: 'view_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_PAYMENT_INFO: 'add_payment_info',
  ADD_SHIPPING_INFO: 'add_shipping_info',
  PURCHASE: 'purchase',
  VIEW_ITEM: 'view_item',
  VIEW_ITEM_LIST: 'view_item_list',
  SELECT_ITEM: 'select_item',
};

// Función para enviar eventos a Google Analytics
export function trackEvent(eventName, parameters = {}) {
  try {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }

    // Console log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}:`, parameters);
    }

    // Aquí puedes agregar otros servicios de analytics
    // como Facebook Pixel, Hotjar, etc.

  } catch (error) {
    console.error('Error enviando evento de analytics:', error);
  }
}

// Eventos específicos de e-commerce
export const ecommerceEvents = {
  // Agregar al carrito
  addToCart: (item, quantity = 1) => {
    trackEvent(AnalyticsEvents.ADD_TO_CART, {
      currency: 'COP',
      value: parseFloat(item.precio) * quantity,
      items: [{
        item_id: item.id,
        item_name: item.nombre,
        category: item.categoria,
        quantity: quantity,
        price: parseFloat(item.precio),
      }],
    });
  },

  // Remover del carrito
  removeFromCart: (item, quantity = 1) => {
    trackEvent(AnalyticsEvents.REMOVE_FROM_CART, {
      currency: 'COP',
      value: parseFloat(item.precio) * quantity,
      items: [{
        item_id: item.id,
        item_name: item.nombre,
        category: item.categoria,
        quantity: quantity,
        price: parseFloat(item.precio),
      }],
    });
  },

  // Ver carrito
  viewCart: (cartItems, cartValue) => {
    trackEvent(AnalyticsEvents.VIEW_CART, {
      currency: 'COP',
      value: cartValue,
      items: cartItems.map(item => ({
        item_id: item.producto.id,
        item_name: item.producto.nombre,
        category: item.producto.categoria,
        quantity: item.cantidad,
        price: parseFloat(item.producto.precio),
      })),
    });
  },

  // Iniciar checkout
  beginCheckout: (cartItems, cartValue) => {
    trackEvent(AnalyticsEvents.BEGIN_CHECKOUT, {
      currency: 'COP',
      value: cartValue,
      items: cartItems.map(item => ({
        item_id: item.producto.id,
        item_name: item.producto.nombre,
        category: item.producto.categoria,
        quantity: item.cantidad,
        price: parseFloat(item.producto.precio),
      })),
    });
  },

  // Compra completada
  purchase: (pedido) => {
    trackEvent(AnalyticsEvents.PURCHASE, {
      transaction_id: pedido.numero,
      currency: 'COP',
      value: parseFloat(pedido.total),
      shipping: parseFloat(pedido.costoEnvio),
      items: pedido.items.map(item => ({
        item_id: item.producto.id,
        item_name: item.producto.nombre,
        category: item.producto.categoria,
        quantity: item.cantidad,
        price: parseFloat(item.precioUnit),
      })),
    });
  },

  // Ver producto
  viewItem: (product) => {
    trackEvent(AnalyticsEvents.VIEW_ITEM, {
      currency: 'COP',
      value: parseFloat(product.precio),
      items: [{
        item_id: product.id,
        item_name: product.nombre,
        category: product.categoria,
        price: parseFloat(product.precio),
      }],
    });
  },

  // Ver lista de productos
  viewItemList: (products, listName = 'Product List') => {
    trackEvent(AnalyticsEvents.VIEW_ITEM_LIST, {
      item_list_name: listName,
      items: products.slice(0, 10).map((product, index) => ({
        item_id: product.id,
        item_name: product.nombre,
        category: product.categoria,
        index: index,
        price: parseFloat(product.precio),
      })),
    });
  },

  // Seleccionar producto
  selectItem: (product, listName = 'Product List', index = 0) => {
    trackEvent(AnalyticsEvents.SELECT_ITEM, {
      item_list_name: listName,
      items: [{
        item_id: product.id,
        item_name: product.nombre,
        category: product.categoria,
        index: index,
        price: parseFloat(product.precio),
      }],
    });
  },
};

// Hook personalizado para usar analytics en componentes React
export function useAnalytics() {
  return {
    trackEvent,
    ecommerce: ecommerceEvents,
  };
}