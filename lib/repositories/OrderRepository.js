/**
 * OrderRepository - Repository Pattern para órdenes
 *
 * Abstrae todas las operaciones de base de datos relacionadas con órdenes
 */

import { Order } from '../models/Order';
import { RepositoryError, OrderNotFoundError } from '../errors/AppErrors';

export class OrderRepository {
  constructor(dbClient) {
    if (!dbClient) {
      throw new Error('OrderRepository requiere un cliente de base de datos');
    }
    this.db = dbClient;
  }

  /**
   * Busca una orden por ID
   */
  async findById(orderId) {
    try {
      const { data, error } = await this.db
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new OrderNotFoundError(orderId);
        }
        throw new RepositoryError('Error al buscar orden', error);
      }

      return Order.fromDatabase(data);
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      console.error('[OrderRepository.findById] Error:', error);
      throw new RepositoryError('Error al buscar orden', error);
    }
  }

  /**
   * Busca una orden por número de orden
   */
  async findByNumber(numeroOrden) {
    try {
      const { data, error } = await this.db
        .from('orders')
        .select('*')
        .eq('numero_orden', numeroOrden)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new OrderNotFoundError(numeroOrden);
        }
        throw new RepositoryError('Error al buscar orden', error);
      }

      return Order.fromDatabase(data);
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      console.error('[OrderRepository.findByNumber] Error:', error);
      throw new RepositoryError('Error al buscar orden', error);
    }
  }

  /**
   * Busca órdenes por email de cliente
   */
  async findByCustomerEmail(email, options = {}) {
    const { limit = 50, offset = 0 } = options;

    try {
      const { data, error } = await this.db
        .from('orders')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new RepositoryError('Error al buscar órdenes por email', error);
      }

      return (data || [])
        .map((item) => Order.fromDatabase(item))
        .filter(Boolean);
    } catch (error) {
      console.error('[OrderRepository.findByCustomerEmail] Error:', error);
      throw new RepositoryError('Error al buscar órdenes por email', error);
    }
  }

  /**
   * Crea una nueva orden
   */
  async create(orderData) {
    try {
      const { data, error } = await this.db
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        throw new RepositoryError('Error al crear orden', error);
      }

      return Order.fromDatabase(data);
    } catch (error) {
      console.error('[OrderRepository.create] Error:', error);
      throw new RepositoryError('Error al crear orden', error);
    }
  }

  /**
   * Actualiza una orden existente
   */
  async update(orderId, updates) {
    try {
      const { data, error } = await this.db
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new OrderNotFoundError(orderId);
        }
        throw new RepositoryError('Error al actualizar orden', error);
      }

      return Order.fromDatabase(data);
    } catch (error) {
      console.error('[OrderRepository.update] Error:', error);
      throw new RepositoryError('Error al actualizar orden', error);
    }
  }

  /**
   * Actualiza una orden por número de orden
   */
  async updateByNumber(numeroOrden, updates) {
    try {
      const { data, error } = await this.db
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('numero_orden', numeroOrden)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new OrderNotFoundError(numeroOrden);
        }
        throw new RepositoryError('Error al actualizar orden', error);
      }

      return Order.fromDatabase(data);
    } catch (error) {
      console.error('[OrderRepository.updateByNumber] Error:', error);
      throw new RepositoryError('Error al actualizar orden', error);
    }
  }

  /**
   * Obtiene todas las órdenes con paginación
   */
  async findAll(options = {}) {
    const { page = 1, pageSize = 50, status = null } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = this.db
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('estado', status);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw new RepositoryError('Error al obtener órdenes', error);
      }

      const orders = (data || [])
        .map((item) => Order.fromDatabase(item))
        .filter(Boolean);

      return {
        orders,
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / pageSize),
        pageSize,
      };
    } catch (error) {
      console.error('[OrderRepository.findAll] Error:', error);
      throw new RepositoryError('Error al obtener órdenes', error);
    }
  }
}

/**
 * Factory functions
 */
let orderRepositoryInstance = null;

export function createOrderRepository(dbClient) {
  return new OrderRepository(dbClient);
}

export function getOrderRepository(dbClient) {
  if (!orderRepositoryInstance && dbClient) {
    orderRepositoryInstance = new OrderRepository(dbClient);
  }
  return orderRepositoryInstance;
}
