/**
 * Servicio de productos con Supabase Database
 * Usa PostgreSQL de Supabase para gestión de productos
 */

import { createClient } from './client';

/**
 * Obtiene todos los productos disponibles
 */
export async function obtenerProductos(filtros = {}) {
  try {
    const supabase = createClient();
    let query = supabase
      .from('products')
      .select('*');

    // Aplicar filtros opcionales
    if (filtros.categoria) {
      query = query.eq('categoria', filtros.categoria);
    }

    if (filtros.destacado !== undefined) {
      query = query.eq('destacado', filtros.destacado);
    }

    // Ordenar por fecha de creación (más recientes primero)
    query = query.order('created_at', { ascending: false });

    // Aplicar límite
    if (filtros.limite) {
      query = query.limit(filtros.limite);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo productos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }
}

/**
 * Obtiene productos por categoría
 */
export async function obtenerProductosPorCategoria(categoria) {
  return obtenerProductos({ categoria });
}

/**
 * Obtiene productos destacados
 */
export async function obtenerProductosDestacados(limite = 10) {
  return obtenerProductos({ destacado: true, limite });
}

/**
 * Obtiene productos recientes
 */
export async function obtenerProductosRecientes(limite = 10) {
  return obtenerProductos({ limite });
}

/**
 * Obtiene un producto por su ID
 */
export async function obtenerProductoPorId(id) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo producto:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return null;
  }
}

/**
 * Obtiene un producto por su SKU
 */
export async function obtenerProductoPorSKU(sku) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single();

    if (error) {
      console.error('Error obteniendo producto por SKU:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error obteniendo producto por SKU:', error);
    return null;
  }
}

/**
 * Busca productos por nombre o descripción
 */
export async function buscarProductos(termino) {
  try {
    const supabase = createClient();
    const { data, error} = await supabase
      .from('products')
      .select('*')
      .or(`nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error buscando productos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error buscando productos:', error);
    return [];
  }
}

/**
 * Crea un nuevo producto (solo para admin)
 */
export async function crearProducto(producto) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .insert([producto])
      .select()
      .single();

    if (error) {
      console.error('Error creando producto:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creando producto:', error);
    throw error;
  }
}

/**
 * Actualiza un producto existente (solo para admin)
 */
export async function actualizarProducto(id, cambios) {
  try {
    const supabase = createClient();

    // Primero verificar que el producto existe
    const { data: productoExistente, error: errorBusqueda } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (errorBusqueda) {
      console.error('❌ Producto no encontrado:', errorBusqueda);
      throw new Error(`Producto con ID ${id} no encontrado: ${errorBusqueda.message}`);
    }

    // Ahora actualizar
    const { data, error } = await supabase
      .from('products')
      .update(cambios)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error actualizando producto:', error);
      throw error;
    }

    // Retornar el primer elemento (debería ser solo uno)
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('❌ Error en actualizarProducto:', error);
    throw error;
  }
}

/**
 * Elimina un producto (solo para admin)
 */
export async function eliminarProducto(id) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error eliminando producto:', error);
    throw error;
  }
}

/**
 * Actualiza el stock de un producto
 */
export async function actualizarStock(id, nuevoStock) {
  return actualizarProducto(id, {
    stock: nuevoStock,
    cantidad: nuevoStock,
    disponible: nuevoStock > 0
  });
}

/**
 * Obtiene estadísticas de productos
 */
export async function obtenerEstadisticasProductos() {
  try {
    const supabase = createClient();
    const { data: productos, error } = await supabase
      .from('products')
      .select('id, disponible, destacado, stock');

    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        total: 0,
        disponibles: 0,
        destacados: 0,
        sinStock: 0
      };
    }

    const total = productos?.length || 0;
    const disponibles = productos?.filter(p => p.disponible === true).length || 0;
    const destacados = productos?.filter(p => p.destacado === true).length || 0;
    const sinStock = productos?.filter(p => p.stock === 0).length || 0;

    return {
      total,
      disponibles,
      destacados,
      sinStock
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      total: 0,
      disponibles: 0,
      destacados: 0,
      sinStock: 0
    };
  }
}
