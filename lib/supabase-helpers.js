/**
 * Helpers para trabajar con Supabase y Row Level Security (RLS)
 * Estos helpers facilitan las operaciones con Supabase manteniendo la seguridad
 */

import { getSupabaseClient, getSupabaseBrowserClient } from './db';
import { auth } from '@clerk/nextjs/server';

/**
 * Obtiene el cliente de Supabase configurado para el usuario actual
 * Configura automáticamente el RLS con el clerk_user_id
 *
 * @param {boolean} serverSide - Si es true, usa Service Role Key (para operaciones admin)
 * @returns {Object} Cliente de Supabase configurado
 */
export async function getSupabaseForUser(serverSide = false) {
  if (serverSide) {
    // Para operaciones del lado del servidor
    const { userId } = await auth();
    const supabase = getSupabaseClient();

    if (userId) {
      // Configurar el contexto de usuario para RLS
      await supabase.rpc('set_config', {
        key: 'app.current_user_id',
        value: userId
      });
    }

    return supabase;
  } else {
    // Para operaciones del lado del cliente
    return getSupabaseBrowserClient();
  }
}

/**
 * Ejecuta una función de Supabase con el contexto de usuario configurado
 * Útil para operaciones del lado del servidor que respetan RLS
 *
 * @param {Function} callback - Función que recibe el cliente de Supabase
 * @returns {Promise<any>} Resultado de la operación
 */
export async function withUserContext(callback) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  // Configurar el contexto de usuario
  await supabase.rpc('set_config', {
    key: 'app.current_user_id',
    value: userId
  });

  // Ejecutar el callback con el cliente configurado
  return await callback(supabase, userId);
}

/**
 * Obtiene el perfil del usuario actual
 * Crea un perfil si no existe
 *
 * @returns {Promise<Object>} Perfil del usuario
 */
export async function getUserProfile() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  // Intentar obtener el perfil
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  // Si no existe, crear uno nuevo
  if (error && error.code === 'PGRST116') {
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        clerk_user_id: userId,
        preferencias_notificaciones: {
          email_promociones: true,
          email_pedidos: true,
          email_novedades: false,
          push_promociones: false,
          push_pedidos: true
        }
      })
      .select()
      .single();

    if (createError) {
      console.error('Error al crear perfil:', createError);
      throw createError;
    }

    return newProfile;
  }

  if (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }

  return profile;
}

/**
 * Actualiza el perfil del usuario actual
 *
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export async function updateUserProfile(updates) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('clerk_user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }

  return data;
}

/**
 * Obtiene todas las direcciones del usuario actual
 *
 * @returns {Promise<Array>} Lista de direcciones
 */
export async function getUserAddresses() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('clerk_user_id', userId)
    .order('es_predeterminada', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener direcciones:', error);
    throw error;
  }

  return data || [];
}

/**
 * Crea una nueva dirección para el usuario actual
 *
 * @param {Object} addressData - Datos de la dirección
 * @returns {Promise<Object>} Dirección creada
 */
export async function createUserAddress(addressData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_addresses')
    .insert({
      clerk_user_id: userId,
      ...addressData
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear dirección:', error);
    throw error;
  }

  return data;
}

/**
 * Actualiza una dirección del usuario actual
 *
 * @param {string} addressId - ID de la dirección
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Dirección actualizada
 */
export async function updateUserAddress(addressId, updates) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_addresses')
    .update(updates)
    .eq('id', addressId)
    .eq('clerk_user_id', userId) // Seguridad: solo actualizar direcciones del usuario
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar dirección:', error);
    throw error;
  }

  return data;
}

/**
 * Elimina una dirección del usuario actual
 *
 * @param {string} addressId - ID de la dirección
 * @returns {Promise<void>}
 */
export async function deleteUserAddress(addressId) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', addressId)
    .eq('clerk_user_id', userId); // Seguridad: solo eliminar direcciones del usuario

  if (error) {
    console.error('Error al eliminar dirección:', error);
    throw error;
  }
}

/**
 * Obtiene los favoritos del usuario actual
 *
 * @returns {Promise<Array>} Lista de productos favoritos
 */
export async function getUserFavorites() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  // Obtener favoritos con información del producto
  const { data, error } = await supabase
    .from('user_favorites')
    .select(`
      *,
      producto:producto_id (
        id,
        nombre,
        descripcion,
        precio,
        imagenes,
        imagen,
        stock,
        categoria
      )
    `)
    .eq('clerk_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener favoritos:', error);
    throw error;
  }

  return data || [];
}

/**
 * Agrega un producto a favoritos
 *
 * @param {string} productoId - ID del producto
 * @param {number} precio - Precio actual del producto
 * @returns {Promise<Object>} Favorito creado
 */
export async function addToFavorites(productoId, precio) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_favorites')
    .insert({
      clerk_user_id: userId,
      producto_id: productoId,
      precio_al_agregar: precio
    })
    .select()
    .single();

  if (error) {
    console.error('Error al agregar a favoritos:', error);
    throw error;
  }

  return data;
}

/**
 * Elimina un producto de favoritos
 *
 * @param {string} productoId - ID del producto
 * @returns {Promise<void>}
 */
export async function removeFromFavorites(productoId) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('clerk_user_id', userId)
    .eq('producto_id', productoId);

  if (error) {
    console.error('Error al eliminar de favoritos:', error);
    throw error;
  }
}

/**
 * Verifica si un producto está en favoritos
 *
 * @param {string} productoId - ID del producto
 * @returns {Promise<boolean>}
 */
export async function isProductInFavorites(productoId) {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('clerk_user_id', userId)
    .eq('producto_id', productoId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error al verificar favorito:', error);
  }

  return !!data;
}

/**
 * Obtiene los pedidos del usuario actual
 *
 * @returns {Promise<Array>} Lista de pedidos con sus items
 */
export async function getUserOrders() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('clerk_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtiene un pedido específico del usuario actual
 *
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} Pedido con sus items e historial
 */
export async function getUserOrder(orderId) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      historial:order_status_history(*)
    `)
    .eq('id', orderId)
    .eq('clerk_user_id', userId)
    .single();

  if (error) {
    console.error('Error al obtener pedido:', error);
    throw error;
  }

  return data;
}
