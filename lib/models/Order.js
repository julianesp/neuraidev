/**
 * Modelo de Orden con validación Zod
 */

import { z } from 'zod';

/**
 * Estados posibles de una orden
 */
export const OrderStatus = z.enum([
  'pendiente',
  'pagado',
  'completado',
  'enviado',
  'entregado',
  'cancelado',
  'rechazado',
]);

/**
 * Estados de pago
 */
export const PaymentStatus = z.enum([
  'pendiente',
  'completado',
  'rechazado',
  'reembolsado',
]);

/**
 * Métodos de pago
 */
export const PaymentMethod = z.enum([
  'epayco',
  'wompi',
  'efectivo',
  'transferencia',
]);

/**
 * Item de una orden
 */
export const OrderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

/**
 * Esquema de orden
 */
export const OrderSchema = z.object({
  // Identificadores
  id: z.string().optional(),
  numero_orden: z.string(),

  // Estados
  estado: OrderStatus.default('pendiente'),
  estado_pago: PaymentStatus.default('pendiente'),

  // Cliente
  customer_name: z.string(),
  customer_email: z.string().email(),
  customer_phone: z.string().optional(),

  // Dirección
  direccion_envio: z.string(),

  // Pago
  metodo_pago: PaymentMethod,
  referencia_pago: z.string(),
  transaction_id: z.string().optional(),

  // Montos
  total: z.number().positive(),
  subtotal: z.number().nonnegative(),
  impuestos: z.number().nonnegative().default(0),
  costo_envio: z.number().nonnegative().default(0),
  descuentos: z.number().nonnegative().default(0),

  // Items
  items: z.array(OrderItemSchema).optional(),

  // Metadata
  metadata: z.record(z.unknown()).optional(),
  informacion_pago: z.record(z.unknown()).optional(),

  // Fechas
  fecha_pago: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),

  // Usuario (si aplica)
  clerk_user_id: z.string().nullable().optional(),
});

/**
 * Clase Order con métodos de utilidad
 */
export class Order {
  /**
   * Crea una orden desde datos de base de datos
   */
  static fromDatabase(dbData) {
    try {
      return OrderSchema.parse(dbData);
    } catch (error) {
      console.error('[Order.fromDatabase] Error de validación:', {
        error: error.message,
        data: dbData,
      });
      throw error;
    }
  }

  /**
   * Crea una nueva orden desde el carrito y datos del cliente
   */
  static create({ cart, customer, paymentMethod, reference }) {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0
    );
    const taxRate = 0.19; // IVA Colombia
    const total = subtotal * (1 + taxRate);
    const impuestos = total - subtotal;

    const orderData = {
      numero_orden: reference,
      estado: 'pendiente',
      estado_pago: 'pendiente',
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      direccion_envio: customer.address,
      metodo_pago: paymentMethod,
      referencia_pago: reference,
      total,
      subtotal,
      impuestos,
      costo_envio: 0,
      descuentos: 0,
      items: cart.map((item) => ({
        id: item.id,
        name: item.nombre,
        quantity: item.cantidad,
        price: item.precio,
      })),
      metadata: {
        customer_city: customer.city,
        customer_region: customer.region,
        customer_type_doc: customer.typeDoc,
        customer_number_doc: customer.numberDoc,
      },
    };

    return OrderSchema.parse(orderData);
  }

  /**
   * Verifica si una orden puede ser cancelada
   */
  static canBeCanceled(order) {
    return ['pendiente', 'pagado'].includes(order.estado);
  }

  /**
   * Verifica si una orden está pagada
   */
  static isPaid(order) {
    return order.estado_pago === 'completado';
  }

  /**
   * Calcula el total de items
   */
  static getTotalItems(order) {
    if (!order.items) return 0;
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

/**
 * Validadores
 */
export const validateOrder = (data) => {
  return OrderSchema.safeParse(data);
};
