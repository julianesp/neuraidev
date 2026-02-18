/**
 * Modelo de Producto con validación Zod
 *
 * Este modelo define la "verdad única" de cómo debe ser un producto.
 * Zod valida automáticamente y proporciona tipos seguros.
 */

import { z } from 'zod';

/**
 * Categorías válidas de productos
 */
export const ProductCategory = z.enum([
  'celulares',
  'computadoras',
  'gadgets',
  'accesorios',
  'libros-nuevos',
  'libros-usados',
  'damas',
  'belleza',
  'generales',
]);

/**
 * Esquema principal de producto
 */
export const ProductSchema = z.object({
  // Campos obligatorios
  id: z.string().uuid('ID de producto inválido'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  precio: z.number().positive('El precio debe ser positivo'),
  categoria: ProductCategory,

  // Campos con valores por defecto
  stock: z.number().int().nonnegative().default(0),
  destacado: z.boolean().default(false),

  // Campos opcionales
  descripcion: z.string().optional(),
  imagenes: z.array(z.string().url('URL de imagen inválida')).default([]),
  imagenPrincipal: z.string().url().optional(),
  slug: z.string().optional(),

  // Metadata adicional
  metadata: z.record(z.unknown()).optional(),

  // Campos de auditoría
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

/**
 * Tipos derivados del esquema (útil para TypeScript)
 */
export const ProductSchemaType = ProductSchema;

/**
 * Clase Product con métodos de factory
 *
 * Factory Pattern: Múltiples formas de crear un producto
 * garantizando que siempre esté validado
 */
export class Product {
  /**
   * Crea un producto desde datos de Supabase
   *
   * RESUELVE EL PROBLEMA: title vs nombre, price vs precio
   */
  static fromDatabase(dbData) {
    if (!dbData) return null;

    try {
      // Normalizar datos de diferentes fuentes
      const normalized = {
        id: dbData.id,
        nombre: dbData.title || dbData.nombre || '',
        precio: dbData.price || dbData.precio || 0,
        stock: dbData.stock ?? 0,
        categoria: dbData.categoria || 'generales',
        descripcion: dbData.description || dbData.descripcion || '',
        imagenes: dbData.images || dbData.imagenes || [],
        imagenPrincipal: dbData.images?.[0] || dbData.imagenes?.[0] || null,
        destacado: dbData.destacado || dbData.featured || false,
        slug: dbData.slug || null,
        metadata: dbData.metadata || {},
        created_at: dbData.created_at,
        updated_at: dbData.updated_at,
      };

      // Validar y retornar
      return ProductSchema.parse(normalized);
    } catch (error) {
      console.error('[Product.fromDatabase] Error de validación:', {
        error: error.message,
        data: dbData,
      });
      throw error;
    }
  }

  /**
   * Crea un producto desde datos de API externa
   */
  static fromAPI(apiData) {
    if (!apiData) return null;

    try {
      return ProductSchema.parse(apiData);
    } catch (error) {
      console.error('[Product.fromAPI] Error de validación:', {
        error: error.message,
        data: apiData,
      });
      throw error;
    }
  }

  /**
   * Crea un producto desde datos del carrito (localStorage)
   */
  static fromCart(cartData) {
    if (!cartData) return null;

    try {
      const normalized = {
        id: cartData.id,
        nombre: cartData.nombre || cartData.name,
        precio: cartData.precio || cartData.price,
        stock: cartData.stock ?? 999, // Stock ilimitado para items del carrito
        categoria: cartData.categoria || 'generales',
        descripcion: cartData.descripcion || '',
        imagenes: cartData.imagenes || [],
        imagenPrincipal: cartData.imagen || cartData.imagenPrincipal,
        destacado: false,
      };

      return ProductSchema.parse(normalized);
    } catch (error) {
      console.error('[Product.fromCart] Error de validación:', {
        error: error.message,
        data: cartData,
      });
      // En el carrito, ser más permisivo
      return null;
    }
  }

  /**
   * Convierte un producto al formato de base de datos
   */
  static toDatabase(product) {
    return {
      id: product.id,
      title: product.nombre,
      price: product.precio,
      stock: product.stock,
      categoria: product.categoria,
      description: product.descripcion,
      images: product.imagenes,
      featured: product.destacado,
      slug: product.slug,
      metadata: product.metadata,
    };
  }

  /**
   * Valida si un producto tiene stock disponible
   */
  static hasStock(product, quantity = 1) {
    return product.stock >= quantity;
  }

  /**
   * Calcula el precio total para una cantidad
   */
  static calculateTotal(product, quantity = 1) {
    return product.precio * quantity;
  }
}

/**
 * Esquema para crear un nuevo producto (validación de input)
 */
export const CreateProductSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

/**
 * Esquema para actualizar un producto (todos los campos opcionales)
 */
export const UpdateProductSchema = ProductSchema.partial().required({ id: true });

/**
 * Validadores específicos
 */
export const validateProduct = (data) => {
  return ProductSchema.safeParse(data);
};

export const validateCreateProduct = (data) => {
  return CreateProductSchema.safeParse(data);
};

export const validateUpdateProduct = (data) => {
  return UpdateProductSchema.safeParse(data);
};
