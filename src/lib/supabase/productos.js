/**
 * Servicio de productos con Supabase
 * Reemplaza los servicios basados en archivos JSON
 */

import { createClient } from './client';

/**
 * Obtiene todos los productos disponibles
 */
export async function obtenerProductos(filtros = {}) {
  const supabase = createClient();

  let query = supabase
    .from('products')
    .select('*')
    .is('store_id', null) // Solo productos de la tienda principal
    .eq('activo', true)
    .eq('disponible', true);

  // Aplicar filtros opcionales
  if (filtros.categoria) {
    query = query.eq('categoria', filtros.categoria);
  }

  if (filtros.destacado !== undefined) {
    query = query.eq('destacado', filtros.destacado);
  }

  if (filtros.limite) {
    query = query.limit(filtros.limite);
  }

  // Ordenar por fecha de ingreso (más recientes primero)
  query = query.order('fecha_ingreso', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }

  return data || [];
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
 * Obtiene un producto por su ID (UUID de Supabase)
 */
export async function obtenerProductoPorId(id) {
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
}

/**
 * Obtiene un producto por su SKU (ID original del JSON)
 */
export async function obtenerProductoPorSKU(sku) {
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
}

/**
 * Busca productos por nombre o descripción
 */
export async function buscarProductos(termino) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('store_id', null)
    .eq('activo', true)
    .eq('disponible', true)
    .or(`nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
    .order('fecha_ingreso', { ascending: false });

  if (error) {
    console.error('Error buscando productos:', error);
    return [];
  }

  return data || [];
}

/**
 * Crea un nuevo producto (solo para admin)
 */
export async function crearProducto(producto) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .insert([{
      ...producto,
      store_id: null // Tienda principal
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creando producto:', error);
    throw error;
  }

  return data;
}

/**
 * Actualiza un producto existente (solo para admin)
 */
export async function actualizarProducto(id, cambios) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando producto:', error);
    throw error;
  }

  return data;
}

/**
 * Elimina un producto (solo para admin)
 */
export async function eliminarProducto(id) {
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

    // Primero intentar una consulta simple sin filtros
    const { data: productos, error } = await supabase
      .from('products')
      .select('id, disponible, activo, destacado, stock, cantidad, store_id');

    if (error) {
      console.error('Error obteniendo estadísticas:', error.message || error);
      console.error('Código de error:', error.code);
      console.error('Hint:', error.hint);
      console.error('Details:', error.details);

      return {
        total: 0,
        disponibles: 0,
        destacados: 0,
        sinStock: 0
      };
    }

    // Filtrar productos de la tienda principal (store_id null)
    const productosMain = productos?.filter(p => p.store_id === null) || [];

    const total = productosMain.length;
    const disponibles = productosMain.filter(p => p.disponible === true && p.activo === true).length;
    const destacados = productosMain.filter(p => p.destacado === true).length;
    const sinStock = productosMain.filter(p => (p.stock === 0 || p.cantidad === 0)).length;

    // Estadísticas calculadas correctamente

    return {
      total,
      disponibles,
      destacados,
      sinStock
    };
  } catch (error) {
    console.error('Error CATCH en obtenerEstadisticasProductos:', error);
    return {
      total: 0,
      disponibles: 0,
      destacados: 0,
      sinStock: 0
    };
  }
}
