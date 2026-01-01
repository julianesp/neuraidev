/**
 * Servicio de ofertas con Supabase Database
 * Gestiona ofertas/descuentos temporales para productos
 */

import { createClient } from './client';

/**
 * Obtiene todas las ofertas (solo admin)
 */
export async function obtenerTodasLasOfertas() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ofertas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo ofertas:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error obteniendo ofertas:', error);
    return [];
  }
}

/**
 * Obtiene solo las ofertas activas y vigentes
 */
export async function obtenerOfertasActivas() {
  try {
    const supabase = createClient();

    const ahora = new Date().toISOString();

    const { data, error } = await supabase
      .from('ofertas')
      .select('*')
      .eq('activa', true)
      .lte('fecha_inicio', ahora)
      .gte('fecha_fin', ahora)
      .order('porcentaje_descuento', { ascending: false });

    if (error) {
      console.error('Error obteniendo ofertas activas:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error obteniendo ofertas activas:', error);
    return [];
  }
}

/**
 * Obtiene la oferta aplicable a un producto específico
 * @param {string} productoId - ID del producto
 * @returns {Object|null} - Oferta aplicable o null
 */
export async function obtenerOfertaDeProducto(productoId) {
  try {
    const supabase = createClient();

    const ahora = new Date().toISOString();

    const { data, error } = await supabase
      .from('ofertas')
      .select('*')
      .eq('activa', true)
      .lte('fecha_inicio', ahora)
      .gte('fecha_fin', ahora)
      .contains('productos_ids', [productoId])
      .order('porcentaje_descuento', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error obteniendo oferta de producto:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error obteniendo oferta de producto:', error);
    return null;
  }
}

/**
 * Obtiene ofertas de múltiples productos
 * @param {string[]} productosIds - Array de IDs de productos
 * @returns {Object} - Mapa de producto_id -> oferta
 */
export async function obtenerOfertasDeProductos(productosIds) {
  try {
    const supabase = createClient();

    const ahora = new Date().toISOString();

    const { data, error } = await supabase
      .from('ofertas')
      .select('*')
      .eq('activa', true)
      .lte('fecha_inicio', ahora)
      .gte('fecha_fin', ahora);

    if (error) {
      console.error('Error obteniendo ofertas de productos:', error);
      return {};
    }

    // Crear un mapa de producto_id -> oferta
    const mapaOfertas = {};

    productosIds.forEach(productoId => {
      // Buscar la mejor oferta para este producto
      const ofertasDelProducto = data?.filter(oferta =>
        oferta.productos_ids.includes(productoId)
      ) || [];

      if (ofertasDelProducto.length > 0) {
        // Ordenar por porcentaje de descuento descendente y tomar la primera
        ofertasDelProducto.sort((a, b) => b.porcentaje_descuento - a.porcentaje_descuento);
        mapaOfertas[productoId] = ofertasDelProducto[0];
      }
    });

    return mapaOfertas;
  } catch (error) {
    console.error('Error obteniendo ofertas de productos:', error);
    return {};
  }
}

/**
 * Crea una nueva oferta (solo admin)
 */
export async function crearOferta(oferta) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('ofertas')
      .insert([{
        nombre: oferta.nombre,
        descripcion: oferta.descripcion,
        porcentaje_descuento: oferta.porcentaje_descuento,
        productos_ids: oferta.productos_ids,
        fecha_inicio: oferta.fecha_inicio,
        fecha_fin: oferta.fecha_fin,
        activa: oferta.activa !== undefined ? oferta.activa : true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creando oferta:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creando oferta:', error);
    throw error;
  }
}

/**
 * Actualiza una oferta existente (solo admin)
 */
export async function actualizarOferta(id, cambios) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('ofertas')
      .update(cambios)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando oferta:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error actualizando oferta:', error);
    throw error;
  }
}

/**
 * Elimina una oferta (solo admin)
 */
export async function eliminarOferta(id) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('ofertas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando oferta:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error eliminando oferta:', error);
    throw error;
  }
}

/**
 * Activa o desactiva una oferta (solo admin)
 */
export async function toggleOferta(id, activa) {
  return actualizarOferta(id, { activa });
}

/**
 * Calcula el precio con descuento
 * @param {number} precioOriginal - Precio original del producto
 * @param {number} porcentajeDescuento - Porcentaje de descuento (1-100)
 * @returns {number} - Precio con descuento aplicado
 */
export function calcularPrecioConDescuento(precioOriginal, porcentajeDescuento) {
  const descuento = (precioOriginal * porcentajeDescuento) / 100;
  return precioOriginal - descuento;
}

/**
 * Obtiene estadísticas de ofertas
 */
export async function obtenerEstadisticasOfertas() {
  try {
    const supabase = createClient();
    const ahora = new Date().toISOString();

    const { data: ofertas, error } = await supabase
      .from('ofertas')
      .select('*');

    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        total: 0,
        activas: 0,
        vigentes: 0,
        expiradas: 0,
        futuras: 0
      };
    }

    const total = ofertas?.length || 0;
    const activas = ofertas?.filter(o => o.activa === true).length || 0;
    const vigentes = ofertas?.filter(o =>
      o.activa === true &&
      o.fecha_inicio <= ahora &&
      o.fecha_fin >= ahora
    ).length || 0;
    const expiradas = ofertas?.filter(o => o.fecha_fin < ahora).length || 0;
    const futuras = ofertas?.filter(o => o.fecha_inicio > ahora).length || 0;

    return {
      total,
      activas,
      vigentes,
      expiradas,
      futuras
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      total: 0,
      activas: 0,
      vigentes: 0,
      expiradas: 0,
      futuras: 0
    };
  }
}
