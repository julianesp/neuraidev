import { findProductBySlug, generateProductSlug } from "./slugify";
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
    console.log(`[loadCategoryProducts] Iniciando carga para: ${categoria}`);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("categoria", categoria)
      .eq("disponible", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`[loadCategoryProducts] Error de Supabase:`, error);
      throw error;
    }

    console.log(`[loadCategoryProducts] Datos recibidos:`, data?.length || 0, 'productos');

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

    console.log(`[loadCategoryProducts] Productos procesados:`, productos.length);
    return productos;
  } catch (error) {
    console.error(`[loadCategoryProducts] Error fatal loading ${categoria} products:`, error);
    throw error; // Re-lanzar el error para que la página lo capture
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
    console.log(`[loadProductBySlug] Buscando producto: categoria=${categoria}, slug=${slug}`);
    const productos = await loadCategoryProducts(categoria);

    if (productos.length === 0) {
      console.log(`[loadProductBySlug] No hay productos en ${categoria}`);
      return { producto: null, otrosProductos: [] };
    }

    console.log(`[loadProductBySlug] Productos disponibles: ${productos.length}`);

    // Buscar producto por slug (usando SKU como fallback)
    let producto = findProductBySlug(productos, slug);
    console.log(`[loadProductBySlug] Búsqueda por slug: ${producto ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);

    // Si no se encuentra por slug, intentar buscar por SKU
    if (!producto) {
      producto = productos.find((p) => p.sku === slug || p.id === slug);
      console.log(`[loadProductBySlug] Búsqueda por SKU/ID: ${producto ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);

      if (!producto) {
        // Mostrar algunos slugs disponibles para debug
        console.log(`[loadProductBySlug] Slugs disponibles:`, productos.slice(0, 3).map(p => ({
          nombre: p.nombre,
          slug: generateProductSlug(p),
          sku: p.sku,
          id: p.id
        })));
      }
    }

    if (!producto) {
      console.log(`[loadProductBySlug] Producto NO encontrado con slug: ${slug}`);
      return { producto: null, otrosProductos: productos };
    }

    console.log(`[loadProductBySlug] Producto encontrado: ${producto.nombre}`);

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
