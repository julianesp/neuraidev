import { findProductBySlug, generateProductSlug } from "./slugify";
import { getSupabaseClient } from "../lib/db";

// Categorías soportadas
// Ahora se obtienen directamente desde Supabase

/**
 * Función auxiliar para reintentar operaciones con backoff exponencial
 * @param {Function} fn - Función a ejecutar
 * @param {number} maxRetries - Número máximo de reintentos
 * @param {number} delay - Delay inicial en ms
 * @returns {Promise<any>} - Resultado de la función
 */
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = i === maxRetries - 1;
      const isTimeoutError = error.name === 'AbortError' ||
                             error.message?.includes('timeout') ||
                             error.message?.includes('fetch failed');

      if (isLastAttempt || !isTimeoutError) {
        throw error;
      }

      // Backoff exponencial: 1s, 2s, 4s
      const waitTime = delay * Math.pow(2, i);
      console.log(`[retryWithBackoff] Reintento ${i + 1}/${maxRetries} después de ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

/**
 * Carga los productos de una categoría desde Supabase
 * @param {string} categoria - El nombre de la categoría
 * @returns {Promise<Array>} - Array de productos disponibles
 */
export async function loadCategoryProducts(categoria) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await retryWithBackoff(async () => {
      const result = await supabase
        .from("products")
        .select("*")
        .eq("categoria", categoria)
        .eq("disponible", true)
        .order("created_at", { ascending: false });

      if (result.error) {
        throw result.error;
      }

      return result;
    });

    if (error) {
      console.error(`[loadCategoryProducts] Error de Supabase:`, error);
      throw error;
    }

    // Normalizar estructura de datos para compatibilidad
    const productos = (data || []).map((p) => ({
      ...p,
      // Mapear snake_case a camelCase para compatibilidad
      imagenPrincipal: p.imagen_principal,
      precioAnterior: p.precio_oferta ? parseFloat(p.precio_oferta) : null,
      precio: parseFloat(p.precio),
      cantidad: p.stock || 0,
      disponible: p.disponible && (p.stock > 0),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return productos;
  } catch (error) {
    console.error(`[loadCategoryProducts] Error fatal loading ${categoria} products:`, error);
    // En lugar de lanzar el error, devolver array vacío para evitar que la página crashee
    return [];
  }
}

/**
 * Carga un producto específico por slug de una categoría
 * @param {string} categoria - El nombre de la categoría
 * @param {string} slug - El slug del producto
 * @returns {Promise<{producto: Object|null, otrosProductos: Array}>}
 */
export async function loadProductBySlug(categoria, slug) {
  try {
    const productos = await loadCategoryProducts(categoria);

    if (productos.length === 0) {
      return { producto: null, otrosProductos: [] };
    }

    // Buscar producto por slug (usando SKU como fallback)
    let producto = findProductBySlug(productos, slug);

    // Si no se encuentra por slug, intentar buscar por SKU
    if (!producto) {
      producto = productos.find((p) => p.sku === slug || p.id === slug);
    }

    if (!producto) {
      return { producto: null, otrosProductos: productos };
    }

    // Las imágenes ya vienen en el array 'imagenes' del producto
    // Si no hay imágenes, usar la imagen principal
    if (!producto.imagenes || producto.imagenes.length === 0) {
      producto.imagenes = producto.imagen_principal
        ? [
            {
              url: producto.imagen_principal,
              alt: producto.nombre,
            },
          ]
        : [];
    } else {
      // Formatear las imágenes del array JSON
      // Verificar si los elementos ya son objetos o son URLs
      producto.imagenes = producto.imagenes.map((imagen, index) => {
        // Si ya es un objeto con propiedad 'url', devolverlo tal cual
        if (typeof imagen === 'object' && imagen !== null && imagen.url) {
          return {
            ...imagen,
            alt: imagen.alt || producto.nombre,
            orden: imagen.orden !== undefined ? imagen.orden : index,
          };
        }
        // Si es una URL (string), crear el objeto
        if (typeof imagen === 'string') {
          return {
            url: imagen,
            alt: producto.nombre,
            orden: index,
          };
        }
        // Si no es ni objeto ni string, devolver null (se filtrará después)
        console.warn('Imagen con formato inesperado:', imagen);
        return null;
      }).filter(Boolean); // Filtrar elementos nulos
    }

    // Filtrar otros productos (excluyendo el actual)
    const otrosProductos = productos.filter((p) => p.id !== producto.id);

    return { producto, otrosProductos };
  } catch (error) {
    console.error(`Error loading product by slug from ${categoria}:`, error);
    return { producto: null, otrosProductos: [] };
  }
}
