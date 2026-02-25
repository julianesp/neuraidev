import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para servidor (con service role key)
let supabase;

export function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('[DEBUG getSupabaseClient] Variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      url: supabaseUrl,
      keyPrefix: supabaseKey?.substring(0, 20)
    });

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Faltan las credenciales de Supabase en las variables de entorno",
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: (url, options = {}) => {
          // Configurar timeout de 30 segundos para consultas, 15s para storage
          const isStorageRequest = url.includes("/storage/v1/");
          const timeout = isStorageRequest ? 15000 : 30000;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          return fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId));
        },
      },
    });
  }
  return supabase;
}

// Alias para compatibilidad: exportar una función con nombre esperado
export function getSupabaseServerClient() {
  return getSupabaseClient();
}

// Cliente de Supabase para browser/client (con anon key)
let supabaseBrowser;

export function getSupabaseBrowserClient() {
  if (!supabaseBrowser) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Faltan las credenciales de Supabase en las variables de entorno",
      );
    }

    supabaseBrowser = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      global: {
        fetch: (url, options = {}) => {
          // Configurar timeout de 30 segundos para consultas, 15s para storage
          const isStorageRequest = url.includes("/storage/v1/");
          const timeout = isStorageRequest ? 15000 : 30000;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          return fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId));
        },
      },
    });
  }
  return supabaseBrowser;
}

/**
 * Ejecuta una consulta SQL a través de Supabase
 * @param {string} table - La tabla a consultar
 * @param {Object} options - Opciones de consulta (select, where, order, etc.)
 * @returns {Promise<Object>} - Resultado de la consulta
 */
export async function query(text, params) {
  // Esta función se mantiene para compatibilidad con código existente
  // pero ahora usa Supabase RPC o queries directas
  console.warn(
    "Usando query() legacy - considera migrar a operaciones de Supabase directas",
  );

  const client = getSupabaseClient();

  try {
    // Convertir query SQL a operación de Supabase
    // Por ahora, lanzamos un error sugiriendo usar las funciones de Supabase directamente
    throw new Error(
      "query() legacy no soportado - usa getSupabaseClient() y las operaciones de Supabase directamente",
    );
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}
