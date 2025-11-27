/**
 * Servicio centralizado para gestión de productos y stock en Supabase
 *
 * Este servicio asegura que todos los productos mostrados en el sitio
 * estén sincronizados con la base de datos y que el stock se maneje correctamente.
 */

import { getSupabaseBrowserClient, getSupabaseClient } from '@/lib/db';

/**
 * Normaliza un producto de Supabase al formato esperado por los componentes
 */
export function normalizeProduct(product) {
  if (!product) return null;

  return {
    ...product,
    id: product.id,
    nombre: product.title || product.nombre,
    precio: product.price || product.precio,
    imagenes: product.images || product.imagenes || [],
    imagenPrincipal: product.images?.[0] || product.imagenes?.[0] || '/placeholder.jpg',
    descripcion: product.description || product.descripcion || '',
    stock: product.stock || 0,
    categoria: product.categoria || 'generales',
    destacado: product.destacado || false,
  };
}

/**
 * Obtiene un producto por ID desde Supabase
 */
export async function getProductById(productId, useServerClient = false) {
  try {
    const supabase = useServerClient ? getSupabaseClient() : getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('[ProductService] Error al obtener producto:', error);
      return null;
    }

    return normalizeProduct(data);
  } catch (error) {
    console.error('[ProductService] Error en getProductById:', error);
    return null;
  }
}

/**
 * Obtiene productos por categoría desde Supabase
 */
export async function getProductsByCategory(categoria, limit = null, useServerClient = false) {
  try {
    const supabase = useServerClient ? getSupabaseClient() : getSupabaseBrowserClient();

    let query = supabase
      .from('products')
      .select('*')
      .eq('categoria', categoria)
      .gt('stock', 0) // Solo productos con stock disponible
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[ProductService] Error al obtener productos por categoría:', error);
      return [];
    }

    return (data || []).map(normalizeProduct);
  } catch (error) {
    console.error('[ProductService] Error en getProductsByCategory:', error);
    return [];
  }
}

/**
 * Obtiene productos destacados desde Supabase
 */
export async function getFeaturedProducts(limit = 10, useServerClient = false) {
  try {
    const supabase = useServerClient ? getSupabaseClient() : getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('destacado', true)
      .gt('stock', 0) // Solo productos con stock disponible
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[ProductService] Error al obtener productos destacados:', error);
      return [];
    }

    return (data || []).map(normalizeProduct);
  } catch (error) {
    console.error('[ProductService] Error en getFeaturedProducts:', error);
    return [];
  }
}

/**
 * Obtiene productos relacionados (misma categoría, excluyendo el producto actual)
 */
export async function getRelatedProducts(productId, categoria, limit = 8, useServerClient = false) {
  try {
    const supabase = useServerClient ? getSupabaseClient() : getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('categoria', categoria)
      .neq('id', productId)
      .gt('stock', 0) // Solo productos con stock disponible
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[ProductService] Error al obtener productos relacionados:', error);
      return [];
    }

    return (data || []).map(normalizeProduct);
  } catch (error) {
    console.error('[ProductService] Error en getRelatedProducts:', error);
    return [];
  }
}

/**
 * Verifica el stock disponible de un producto
 */
export async function checkProductStock(productId, useServerClient = false) {
  try {
    const supabase = useServerClient ? getSupabaseClient() : getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('[ProductService] Error al verificar stock:', error);
      return 0;
    }

    return data?.stock || 0;
  } catch (error) {
    console.error('[ProductService] Error en checkProductStock:', error);
    return 0;
  }
}

/**
 * Descuenta stock de un producto (usar solo en servidor)
 * IMPORTANTE: Esta función debe llamarse SOLO después de una compra exitosa
 */
export async function decrementProductStock(productId, quantity) {
  try {
    const supabase = getSupabaseClient(); // Usar cliente de servidor con permisos

    // 1. Verificar stock actual
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock, nombre, title')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('[ProductService] Error al obtener producto para descuento:', fetchError);
      return {
        success: false,
        error: 'Producto no encontrado',
        productId,
      };
    }

    const currentStock = product.stock || 0;

    // 2. Validar que hay suficiente stock
    if (currentStock < quantity) {
      console.error('[ProductService] Stock insuficiente:', {
        productId,
        productName: product.nombre || product.title,
        requestedQuantity: quantity,
        availableStock: currentStock,
      });

      return {
        success: false,
        error: 'Stock insuficiente',
        productId,
        requestedQuantity: quantity,
        availableStock: currentStock,
      };
    }

    // 3. Descontar el stock
    const newStock = currentStock - quantity;

    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateError) {
      console.error('[ProductService] Error al actualizar stock:', updateError);
      return {
        success: false,
        error: 'Error al actualizar stock',
        productId,
      };
    }

    // Stock descontado exitosamente

    return {
      success: true,
      productId,
      quantity,
      previousStock: currentStock,
      newStock,
    };
  } catch (error) {
    console.error('[ProductService] Error en decrementProductStock:', error);
    return {
      success: false,
      error: error.message,
      productId,
    };
  }
}

/**
 * Descuenta stock para múltiples productos (transacción de compra)
 * IMPORTANTE: Esta función debe llamarse SOLO después de una compra exitosa
 */
export async function decrementMultipleProductsStock(items) {
  try {
    const results = [];
    let allSuccess = true;

    for (const item of items) {
      // Soportar tanto 'cantidad' como 'quantity' para compatibilidad
      const quantity = item.cantidad || item.quantity || 1;
      const productId = item.id || item.productId;

      if (!productId) {
        console.error('[ProductService] Item sin ID de producto:', item);
        results.push({
          success: false,
          error: 'Item sin ID de producto',
          productId: null,
        });
        allSuccess = false;
        continue;
      }

      const result = await decrementProductStock(productId, quantity);
      results.push(result);

      if (!result.success) {
        allSuccess = false;
        console.error('[ProductService] Fallo al descontar stock del producto:', item);
      }
    }

    return {
      success: allSuccess,
      results,
      message: allSuccess
        ? 'Stock actualizado exitosamente para todos los productos'
        : 'Hubo errores al actualizar el stock de algunos productos',
    };
  } catch (error) {
    console.error('[ProductService] Error en decrementMultipleProductsStock:', error);
    return {
      success: false,
      error: error.message,
      results: [],
    };
  }
}

/**
 * Busca productos por término de búsqueda
 */
export async function searchProducts(searchTerm, limit = 20, useServerClient = false) {
  try {
    const supabase = useServerClient ? getSupabaseClient() : getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,nombre.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`)
      .gt('stock', 0) // Solo productos con stock disponible
      .limit(limit);

    if (error) {
      console.error('[ProductService] Error en búsqueda:', error);
      return [];
    }

    return (data || []).map(normalizeProduct);
  } catch (error) {
    console.error('[ProductService] Error en searchProducts:', error);
    return [];
  }
}

/**
 * Obtiene todos los productos (con paginación)
 */
export async function getAllProducts(page = 1, pageSize = 50, useServerClient = false) {
  try {
    const supabase = useServerClient ? getSupabaseClient() : getSupabaseBrowserClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .gt('stock', 0) // Solo productos con stock disponible
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[ProductService] Error al obtener todos los productos:', error);
      return { products: [], totalCount: 0 };
    }

    return {
      products: (data || []).map(normalizeProduct),
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  } catch (error) {
    console.error('[ProductService] Error en getAllProducts:', error);
    return { products: [], totalCount: 0 };
  }
}
