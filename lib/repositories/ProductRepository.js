/**
 * ProductRepository - Repository Pattern
 *
 * PROPÓSITO: Abstraer TODAS las operaciones de base de datos para productos
 *
 * BENEFICIOS:
 * 1. Cambiar de Supabase a otra BD = cambiar solo este archivo
 * 2. Testing fácil: mockear el repository, no toda la BD
 * 3. Lógica de queries centralizada
 * 4. Validación automática con Product model
 */

import { Product } from '../models/Product';
import {
  RepositoryError,
  ProductNotFoundError,
  InsufficientStockError,
} from '../errors/AppErrors';

/**
 * Clase ProductRepository
 */
export class ProductRepository {
  /**
   * Constructor recibe el cliente de base de datos
   * Esto permite inyectar diferentes clientes (testing, prod, etc.)
   */
  constructor(dbClient) {
    if (!dbClient) {
      throw new Error('ProductRepository requiere un cliente de base de datos');
    }
    this.db = dbClient;
  }

  /**
   * Busca un producto por ID
   */
  async findById(productId) {
    try {
      const { data, error } = await this.db
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        // Error PGRST116 = No encontrado
        if (error.code === 'PGRST116') {
          throw new ProductNotFoundError(productId);
        }
        throw new RepositoryError('Error al buscar producto', error);
      }

      // Validar y normalizar con el modelo
      return Product.fromDatabase(data);
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }
      console.error('[ProductRepository.findById] Error:', error);
      throw new RepositoryError('Error al buscar producto', error);
    }
  }

  /**
   * Busca productos por categoría
   */
  async findByCategory(categoria, options = {}) {
    const { limit = null, offset = 0 } = options;

    try {
      let query = this.db
        .from('products')
        .select('*')
        .eq('categoria', categoria)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit).range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new RepositoryError(
          `Error al buscar productos de categoría ${categoria}`,
          error
        );
      }

      // Normalizar todos los productos
      return (data || [])
        .map((item) => {
          try {
            return Product.fromDatabase(item);
          } catch (validationError) {
            console.warn(
              '[ProductRepository] Producto con datos inválidos:',
              item.id,
              validationError
            );
            return null;
          }
        })
        .filter(Boolean); // Eliminar nulls
    } catch (error) {
      console.error('[ProductRepository.findByCategory] Error:', error);
      throw new RepositoryError('Error al buscar productos por categoría', error);
    }
  }

  /**
   * Busca productos destacados
   */
  async findFeatured(limit = 10) {
    try {
      const { data, error } = await this.db
        .from('products')
        .select('*')
        .eq('destacado', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new RepositoryError('Error al buscar productos destacados', error);
      }

      return (data || [])
        .map((item) => Product.fromDatabase(item))
        .filter(Boolean);
    } catch (error) {
      console.error('[ProductRepository.findFeatured] Error:', error);
      throw new RepositoryError('Error al buscar productos destacados', error);
    }
  }

  /**
   * Busca productos relacionados (misma categoría, excluyendo el producto dado)
   */
  async findRelated(productId, categoria, limit = 8) {
    try {
      const { data, error } = await this.db
        .from('products')
        .select('*')
        .eq('categoria', categoria)
        .neq('id', productId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new RepositoryError('Error al buscar productos relacionados', error);
      }

      return (data || [])
        .map((item) => Product.fromDatabase(item))
        .filter(Boolean);
    } catch (error) {
      console.error('[ProductRepository.findRelated] Error:', error);
      throw new RepositoryError('Error al buscar productos relacionados', error);
    }
  }

  /**
   * Busca productos por término de búsqueda
   */
  async search(searchTerm, limit = 20) {
    try {
      const { data, error } = await this.db
        .from('products')
        .select('*')
        .or(
          `title.ilike.%${searchTerm}%,nombre.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`
        )
        .limit(limit);

      if (error) {
        throw new RepositoryError('Error en búsqueda de productos', error);
      }

      return (data || [])
        .map((item) => Product.fromDatabase(item))
        .filter(Boolean);
    } catch (error) {
      console.error('[ProductRepository.search] Error:', error);
      throw new RepositoryError('Error en búsqueda de productos', error);
    }
  }

  /**
   * Obtiene todos los productos con paginación
   */
  async findAll(options = {}) {
    const { page = 1, pageSize = 50 } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, error, count } = await this.db
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw new RepositoryError('Error al obtener productos', error);
      }

      const products = (data || [])
        .map((item) => Product.fromDatabase(item))
        .filter(Boolean);

      return {
        products,
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / pageSize),
        pageSize,
      };
    } catch (error) {
      console.error('[ProductRepository.findAll] Error:', error);
      throw new RepositoryError('Error al obtener productos', error);
    }
  }

  /**
   * Verifica el stock disponible de un producto
   */
  async checkStock(productId) {
    try {
      const { data, error } = await this.db
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ProductNotFoundError(productId);
        }
        throw new RepositoryError('Error al verificar stock', error);
      }

      return data?.stock ?? 0;
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }
      console.error('[ProductRepository.checkStock] Error:', error);
      throw new RepositoryError('Error al verificar stock', error);
    }
  }

  /**
   * Decrementa el stock de un producto (operación atómica)
   * IMPORTANTE: Solo usar después de una compra exitosa
   */
  async decrementStock(productId, quantity) {
    try {
      // 1. Obtener stock actual
      const { data: product, error: fetchError } = await this.db
        .from('products')
        .select('stock, nombre, title')
        .eq('id', productId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new ProductNotFoundError(productId);
        }
        throw new RepositoryError('Error al obtener producto', fetchError);
      }

      const currentStock = product.stock || 0;

      // 2. Validar stock suficiente
      if (currentStock < quantity) {
        throw new InsufficientStockError(productId, quantity, currentStock);
      }

      // 3. Actualizar stock
      const newStock = currentStock - quantity;

      const { error: updateError } = await this.db
        .from('products')
        .update({
          stock: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (updateError) {
        throw new RepositoryError('Error al actualizar stock', updateError);
      }

      return {
        success: true,
        productId,
        quantity,
        previousStock: currentStock,
        newStock,
      };
    } catch (error) {
      if (
        error instanceof ProductNotFoundError ||
        error instanceof InsufficientStockError
      ) {
        throw error;
      }
      console.error('[ProductRepository.decrementStock] Error:', error);
      throw new RepositoryError('Error al decrementar stock', error);
    }
  }

  /**
   * Incrementa el stock de un producto (para reembolsos/cancelaciones)
   */
  async incrementStock(productId, quantity) {
    try {
      const { data: product, error: fetchError } = await this.db
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new ProductNotFoundError(productId);
        }
        throw new RepositoryError('Error al obtener producto', fetchError);
      }

      const currentStock = product.stock || 0;
      const newStock = currentStock + quantity;

      const { error: updateError } = await this.db
        .from('products')
        .update({
          stock: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (updateError) {
        throw new RepositoryError('Error al actualizar stock', updateError);
      }

      return {
        success: true,
        productId,
        quantity,
        previousStock: currentStock,
        newStock,
      };
    } catch (error) {
      console.error('[ProductRepository.incrementStock] Error:', error);
      throw new RepositoryError('Error al incrementar stock', error);
    }
  }

  /**
   * Crea un nuevo producto
   */
  async create(productData) {
    try {
      const dbData = Product.toDatabase(productData);

      const { data, error } = await this.db
        .from('products')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        throw new RepositoryError('Error al crear producto', error);
      }

      return Product.fromDatabase(data);
    } catch (error) {
      console.error('[ProductRepository.create] Error:', error);
      throw new RepositoryError('Error al crear producto', error);
    }
  }

  /**
   * Actualiza un producto existente
   */
  async update(productId, updates) {
    try {
      const dbUpdates = Product.toDatabase(updates);

      const { data, error } = await this.db
        .from('products')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ProductNotFoundError(productId);
        }
        throw new RepositoryError('Error al actualizar producto', error);
      }

      return Product.fromDatabase(data);
    } catch (error) {
      console.error('[ProductRepository.update] Error:', error);
      throw new RepositoryError('Error al actualizar producto', error);
    }
  }

  /**
   * Elimina un producto
   */
  async delete(productId) {
    try {
      const { error } = await this.db
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw new RepositoryError('Error al eliminar producto', error);
      }

      return { success: true, productId };
    } catch (error) {
      console.error('[ProductRepository.delete] Error:', error);
      throw new RepositoryError('Error al eliminar producto', error);
    }
  }
}

/**
 * Singleton factory para crear instancias del repository
 */
let productRepositoryInstance = null;

export function createProductRepository(dbClient) {
  return new ProductRepository(dbClient);
}

export function getProductRepository(dbClient) {
  if (!productRepositoryInstance && dbClient) {
    productRepositoryInstance = new ProductRepository(dbClient);
  }
  return productRepositoryInstance;
}
