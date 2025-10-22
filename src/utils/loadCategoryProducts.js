import { findProductBySlug } from "./slugify";
import { getSupabaseClient } from "../lib/db";

// Categorías soportadas
// Ahora se obtienen directamente desde Supabase

/**
 * Carga los productos de una categoría desde Supabase
 * @param {string} categoria - El nombre de la categoría
 * @returns {Promise<Array>} - Array de productos disponibles
 */
export async function loadCategoryProducts(categoria) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('categoria', categoria)
      .eq('disponible', true)
      .order('createdAt', { ascending: false });

    if (error) {
      throw error;
    }

    // Normalizar estructura de datos para compatibilidad
    const productos = (data || []).map((p) => ({
      ...p,
      imagenPrincipal: p.imagenPrincipal,
      precio: parseFloat(p.precio),
      precioAnterior: p.precioAnterior ? parseFloat(p.precioAnterior) : null,
      cantidad: p.stock,
      disponible: p.disponible && p.stock > 0,
    }));

    return productos;
  } catch (error) {
    console.error(`Error loading ${categoria} products:`, error);
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
      producto = productos.find(p => p.sku === slug || p.id === slug);
    }

    if (!producto) {
      return { producto: null, otrosProductos: productos };
    }

    // Obtener imágenes adicionales del producto desde la tabla ProductoImagen
    try {
      const supabase = getSupabaseClient();

      const { data: imagenes, error: imgError } = await supabase
        .from('product_images')
        .select('url, alt, orden')
        .eq('productoId', producto.id)
        .order('orden', { ascending: true });

      if (imgError) {
        throw imgError;
      }

      if (imagenes) {
        // Agregar las imágenes al producto en el formato esperado
        producto.imagenes = imagenes.map(img => ({
          url: img.url,
          alt: img.alt || producto.nombre
        }));
      }
    } catch (imgErr) {
      console.error('Error loading product images:', imgErr);
      producto.imagenes = [];
    }

    // Filtrar otros productos (excluyendo el actual)
    const otrosProductos = productos.filter((p) => p.id !== producto.id);

    return { producto, otrosProductos };
  } catch (error) {
    console.error(`Error loading product by slug from ${categoria}:`, error);
    return { producto: null, otrosProductos: [] };
  }
}
