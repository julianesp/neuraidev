/**
 * Wrapper para fetch que maneja errores de manera centralizada
 * Previene el error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
 */

/**
 * Realiza un fetch y maneja errores apropiadamente
 * @param {string} url - URL a la que hacer fetch
 * @param {RequestInit} options - Opciones de fetch
 * @returns {Promise<any>} - Respuesta parseada o null en caso de error
 */
export async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);

    // Si la respuesta no es OK, lanzar error
    if (!response.ok) {
      // Intentar leer el error como JSON
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Si no se puede parsear como JSON, usar el statusText
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    // Verificar el Content-Type
    const contentType = response.headers.get('content-type');

    // Si es JSON, parsear como JSON
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // Si es texto, retornar como texto
    if (contentType && contentType.includes('text/')) {
      return await response.text();
    }

    // Por defecto, intentar parsear como JSON
    // pero capturar el error si falla
    try {
      return await response.json();
    } catch (parseError) {
      console.error('Error parsing response as JSON:', parseError);
      // Retornar el texto si no se puede parsear como JSON
      return await response.text();
    }

  } catch (error) {
    console.error(`Error en fetch a ${url}:`, error);
    throw error;
  }
}

/**
 * Variante de safeFetch que retorna null en caso de error
 * en lugar de lanzar una excepción
 */
export async function safeFetchOrNull(url, options = {}) {
  try {
    return await safeFetch(url, options);
  } catch (error) {
    console.error(`Error en fetch a ${url}:`, error);
    return null;
  }
}

/**
 * POST helper
 */
export async function safeFetchPost(url, data, options = {}) {
  return safeFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * PUT helper
 */
export async function safeFetchPut(url, data, options = {}) {
  return safeFetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * DELETE helper
 */
export async function safeFetchDelete(url, options = {}) {
  return safeFetch(url, {
    method: 'DELETE',
    ...options,
  });
}
