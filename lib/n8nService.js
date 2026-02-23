/**
 * Servicio centralizado para enviar eventos a n8n
 * Este servicio actúa como intermediario entre tu tienda y n8n
 */

import axios from 'axios';

// Configuración de n8n
const N8N_WEBHOOK_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook';
const N8N_API_KEY = process.env.N8N_API_KEY;

// Solo loguear en desarrollo
const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.log('[n8n]', ...args);
const logError = (...args) => console.error('[n8n ERROR]', ...args);

/**
 * Función helper para enviar eventos a n8n
 * @param {string} eventType - Tipo de evento (ej: 'order.created', 'customer.registered')
 * @param {object} data - Datos del evento
 * @param {string} webhookPath - Ruta específica del webhook (opcional)
 */
async function sendToN8n(eventType, data, webhookPath = null) {
  if (!N8N_WEBHOOK_BASE_URL) {
    logError('N8N_WEBHOOK_BASE_URL no está configurado');
    return { success: false, error: 'N8N_WEBHOOK_BASE_URL not configured' };
  }

  try {
    // Construir URL del webhook
    const url = webhookPath
      ? `${N8N_WEBHOOK_BASE_URL}/${webhookPath}`
      : `${N8N_WEBHOOK_BASE_URL}/${eventType.replace('.', '-')}`;

    // Preparar payload
    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
      source: 'neuraidev',
    };

    // Headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // Agregar API key si está configurada
    if (N8N_API_KEY) {
      headers['X-N8N-API-KEY'] = N8N_API_KEY;
    }

    log(`Enviando evento ${eventType} a ${url}`);

    // Enviar a n8n
    const response = await axios.post(url, payload, {
      headers,
      timeout: 5000, // 5 segundos de timeout
    });

    log(`✅ Evento ${eventType} enviado exitosamente`);
    return { success: true, response: response.data };

  } catch (error) {
    // No queremos que falle la operación principal si falla n8n
    logError(`Error enviando evento ${eventType}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ====================================
// EVENTOS DE PEDIDOS
// ====================================

/**
 * Enviar evento cuando se crea un nuevo pedido
 */
export async function notifyOrderCreated(order) {
  return sendToN8n('order.created', {
    orderId: order.id,
    orderNumber: order.numero_orden,
    customerEmail: order.email_cliente,
    customerName: order.nombre_cliente,
    total: order.total,
    products: order.metadata?.productos || order.productos,
    paymentMethod: order.metodo_pago,
    status: order.estado,
    createdAt: order.created_at,
  });
}

/**
 * Enviar evento cuando se aprueba un pago
 */
export async function notifyOrderPaid(order, transaction) {
  return sendToN8n('order.paid', {
    orderId: order.id,
    orderNumber: order.numero_orden,
    customerEmail: order.email_cliente,
    customerName: order.nombre_cliente,
    total: order.total,
    products: order.metadata?.productos || order.productos,
    transactionId: transaction.id,
    paymentMethod: order.metodo_pago,
    paidAt: new Date().toISOString(),
  });
}

/**
 * Enviar evento cuando se cancela un pedido
 */
export async function notifyOrderCancelled(order, reason) {
  return sendToN8n('order.cancelled', {
    orderId: order.id,
    orderNumber: order.numero_orden,
    customerEmail: order.email_cliente,
    reason,
    cancelledAt: new Date().toISOString(),
  });
}

// ====================================
// EVENTOS DE CLIENTES
// ====================================

/**
 * Enviar evento cuando se registra un nuevo cliente
 */
export async function notifyCustomerRegistered(customer) {
  return sendToN8n('customer.registered', {
    customerId: customer.id,
    email: customer.email,
    name: customer.name,
    phone: customer.phone,
    registeredAt: customer.created_at,
  });
}

/**
 * Enviar evento cuando un cliente actualiza su perfil
 */
export async function notifyCustomerUpdated(customer, changes) {
  return sendToN8n('customer.updated', {
    customerId: customer.id,
    email: customer.email,
    changes,
    updatedAt: new Date().toISOString(),
  });
}

// ====================================
// EVENTOS DE CARRITOS ABANDONADOS
// ====================================

/**
 * Enviar evento de carrito abandonado
 */
export async function notifyCartAbandoned(cart) {
  return sendToN8n('cart.abandoned', {
    sessionId: cart.sessionId,
    customerEmail: cart.email,
    customerName: cart.name,
    products: cart.products,
    total: cart.total,
    abandonedAt: new Date().toISOString(),
  });
}

// ====================================
// EVENTOS DE PRODUCTOS
// ====================================

/**
 * Enviar evento cuando un producto está bajo stock
 */
export async function notifyLowStock(product) {
  return sendToN8n('product.low_stock', {
    productId: product.id,
    nombre: product.nombre,
    stock: product.stock,
    categoria: product.categoria,
    alertAt: new Date().toISOString(),
  });
}

/**
 * Enviar evento cuando se crea un nuevo producto
 */
export async function notifyProductCreated(product) {
  return sendToN8n('product.created', {
    productId: product.id,
    nombre: product.nombre,
    precio: product.precio,
    categoria: product.categoria,
    stock: product.stock,
    createdAt: product.created_at,
  });
}

/**
 * Enviar evento cuando se actualiza un producto
 */
export async function notifyProductUpdated(product, changes) {
  return sendToN8n('product.updated', {
    productId: product.id,
    nombre: product.nombre,
    changes,
    updatedAt: new Date().toISOString(),
  });
}

// ====================================
// EVENTOS DE LEADS
// ====================================

/**
 * Enviar evento cuando alguien agrega al carrito pero no compra
 */
export async function notifyPotentialLead(data) {
  return sendToN8n('lead.potential', {
    sessionId: data.sessionId,
    email: data.email,
    products: data.products,
    source: data.source, // 'add_to_cart', 'wishlist', etc.
    capturedAt: new Date().toISOString(),
  });
}

// ====================================
// EVENTOS DE USUARIOS (CLERK)
// ====================================

/**
 * Enviar evento cuando un nuevo usuario se registra en Clerk
 */
export async function notifyUserCreated(user) {
  return sendToN8n('user.created', {
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: new Date().toISOString(),
  });
}

// ====================================
// EVENTOS DE ANÁLISIS
// ====================================

/**
 * Enviar evento de visita a producto (para análisis)
 */
export async function notifyProductView(data) {
  return sendToN8n('product.viewed', {
    productId: data.productId,
    productName: data.productName,
    sessionId: data.sessionId,
    userId: data.userId,
    viewedAt: new Date().toISOString(),
  });
}

// ====================================
// FUNCIÓN GENÉRICA
// ====================================

/**
 * Función genérica para enviar cualquier evento personalizado
 */
export async function sendCustomEvent(eventType, data, webhookPath = null) {
  return sendToN8n(eventType, data, webhookPath);
}
