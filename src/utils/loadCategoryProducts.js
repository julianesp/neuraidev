import { createClient } from "@supabase/supabase-js";
import { findProductBySlug } from "./slugify";

// Cliente de Supabase para server-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mapeo de categorías a archivos JSON
const categoriaArchivos = {
  celulares: "celulares.json",
  computadoras: "computadoras.json",
  "libros-usados": "libros-usados.json",
  "libros-nuevos": "libros-nuevos.json",
  generales: "generales.json",
  damas: "damas.json",
  belleza: "damas.json",
  // Aliases para mantener compatibilidad
  computacion: "computadoras.json",
  computacio: "computadoras.json",
  librosnuevos: "libros-nuevos.json",
  librosusados: "libros-usados.json",
};

/**
 * Carga los productos de una categoría desde Supabase
 * @param {string} categoria - El nombre de la categoría
 * @returns {Promise<Array>} - Array de productos disponibles
 */
export async function loadCategoryProducts(categoria) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .is('store_id', null) // Solo productos de la tienda principal
      .eq('categoria', categoria)
      .eq('activo', true)
      .eq('disponible', true)
      .order('fecha_ingreso', { ascending: false });

    if (error) {
      console.error(`Error loading ${categoria} products:`, error);
      return [];
    }

    // Normalizar estructura de datos para compatibilidad
    const productos = (data || []).map((p) => ({
      ...p,
      // Mantener compatibilidad con código antiguo
      imagenPrincipal: p.imagen_principal || (p.imagenes && p.imagenes[0]) || null,
      precio: p.precio,
      precioAnterior: p.precio_oferta,
      cantidad: p.stock,
      imagenes: p.imagenes?.map(url => ({ url })) || [] // Convertir array de URLs a array de objetos
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

    // Filtrar otros productos (excluyendo el actual)
    const otrosProductos = productos.filter((p) => p.id !== producto.id);

    return { producto, otrosProductos };
  } catch (error) {
    console.error(`Error loading product by slug from ${categoria}:`, error);
    return { producto: null, otrosProductos: [] };
  }
}
