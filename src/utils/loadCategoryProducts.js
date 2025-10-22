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
      .from("products")
      .select("*")
      .eq("categoria", categoria)
      .eq("disponible", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Normalizar estructura de datos para compatibilidad
    const productos = (data || []).map((p) => ({
      ...p,
      // Mapear snake_case a camelCase para compatibilidad
      imagenPrincipal: p.imagen_principal,
      precioAnterior: p.precio_oferta ? parseFloat(p.precio_oferta) : null,
      precio: parseFloat(p.precio),
      cantidad: p.stock || p.cantidad || 0,
      disponible: p.disponible && (p.stock > 0 || p.cantidad > 0),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
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
      producto.imagenes = producto.imagenes.map((url, index) => ({
        url: url,
        alt: producto.nombre,
        orden: index,
      }));
    }

    // Filtrar otros productos (excluyendo el actual)
    const otrosProductos = productos.filter((p) => p.id !== producto.id);

    return { producto, otrosProductos };
  } catch (error) {
    console.error(`Error loading product by slug from ${categoria}:`, error);
    return { producto: null, otrosProductos: [] };
  }
}
