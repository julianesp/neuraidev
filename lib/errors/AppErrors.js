/**
 * Errores personalizados de la aplicación
 *
 * Estos errores permiten manejar situaciones específicas
 * y proporcionar mensajes claros al usuario
 */

/**
 * Error base de la aplicación
 */
export class AppError extends Error {
  constructor(message, code = 'APP_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.isOperational = true; // Error esperado, no es un bug
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores de repositorio/base de datos
 */
export class RepositoryError extends AppError {
  constructor(message, originalError = null) {
    super(message, 'REPOSITORY_ERROR');
    this.originalError = originalError;
  }
}

/**
 * Errores de validación
 */
export class ValidationError extends AppError {
  constructor(message, errors = {}) {
    super(message, 'VALIDATION_ERROR');
    this.validationErrors = errors;
  }
}

/**
 * Errores de producto
 */
export class ProductNotFoundError extends AppError {
  constructor(productId) {
    super(`Producto no encontrado: ${productId}`, 'PRODUCT_NOT_FOUND');
    this.productId = productId;
  }
}

export class InsufficientStockError extends AppError {
  constructor(productId, requested, available) {
    super(
      `Stock insuficiente para producto ${productId}. Solicitado: ${requested}, Disponible: ${available}`,
      'INSUFFICIENT_STOCK'
    );
    this.productId = productId;
    this.requestedQuantity = requested;
    this.availableStock = available;
  }
}

/**
 * Errores de pago
 */
export class PaymentError extends AppError {
  constructor(message, provider = null) {
    super(message, 'PAYMENT_ERROR');
    this.provider = provider;
  }
}

export class PaymentProviderError extends PaymentError {
  constructor(provider, originalError) {
    super(`Error del proveedor de pago: ${provider}`, provider);
    this.originalError = originalError;
  }
}

/**
 * Errores de orden
 */
export class OrderNotFoundError extends AppError {
  constructor(orderId) {
    super(`Orden no encontrada: ${orderId}`, 'ORDER_NOT_FOUND');
    this.orderId = orderId;
  }
}

export class InvalidOrderStateError extends AppError {
  constructor(orderId, currentState, attemptedAction) {
    super(
      `No se puede ${attemptedAction} la orden ${orderId} en estado ${currentState}`,
      'INVALID_ORDER_STATE'
    );
    this.orderId = orderId;
    this.currentState = currentState;
    this.attemptedAction = attemptedAction;
  }
}
