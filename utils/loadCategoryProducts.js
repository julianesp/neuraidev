import { findProductBySlug, generateProductSlug } from "./slugify";
import { getSupabaseServerClient } from "../lib/db";

async function obtenerProductos(filtros = {}) {
  const db = getSupabaseServerClient();
  let q = db.from('products').select('*');
  if (filtros.categoria) q = q.eq('categoria', filtros.categoria);
  const { data } = await q;
  return data || [];
}

async function obtenerProductoPorId(id) {
  const db = getSupabaseServerClient();
  const { data } = await db.from('products').select('*').eq('id', id).single();
  return data || null;
}

/**
 * Normaliza un producto de D1 para compatibilidad con el resto del código
 */
function normalizarProducto(p) {
  let imagenes = p.imagenes;
  if (typeof imagenes === "string") {
    try { imagenes = JSON.parse(imagenes); } catch { imagenes = []; }
  }
  imagenes = (imagenes || []).map((img, index) => {
    if (typeof img === "object" && img !== null && img.url) {
      return { ...img, alt: img.alt || p.nombre, orden: img.orden ?? index };
    }
    if (typeof img === "string") {
      return { url: img, alt: p.nombre, orden: index };
    }
    return null;
  }).filter(Boolean);

  return {
    ...p,
    imagenPrincipal: p.imagen_principal,
    imagenes,
    precioAnterior: p.precio_oferta ? parseFloat(p.precio_oferta) : null,
    precio: parseFloat(p.precio),
    cantidad: p.stock || 0,
    disponible: (p.disponible === 1 || p.disponible === true) && p.stock > 0,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    video_url: p.video_url,
    video_type: p.video_type,
  };
}

/**
 * Carga los productos de una categoría desde Cloudflare D1
 * @param {string} categoria - El nombre de la categoría
 * @returns {Promise<Array>} - Array de productos disponibles
 */
export async function loadCategoryProducts(categoria) {
  try {
    const data = await obtenerProductos({ categoria });
    return (data || []).map(normalizarProducto);
  } catch (error) {
    console.error(
      `[loadCategoryProducts] Error loading ${categoria} products:`,
      error,
    );
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

    // Enriquecimiento de tiendas omitido (migrado a D1)

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
      producto.imagenes = producto.imagenes
        .map((imagen, index) => {
          // Si ya es un objeto con propiedad 'url', devolverlo tal cual
          if (typeof imagen === "object" && imagen !== null && imagen.url) {
            return {
              ...imagen,
              alt: imagen.alt || producto.nombre,
              orden: imagen.orden !== undefined ? imagen.orden : index,
            };
          }
          // Si es una URL (string), crear el objeto
          if (typeof imagen === "string") {
            return {
              url: imagen,
              alt: producto.nombre,
              orden: index,
            };
          }
          // Si no es ni objeto ni string, devolver null (se filtrará después)
          console.warn("Imagen con formato inesperado:", imagen);
          return null;
        })
        .filter(Boolean); // Filtrar elementos nulos
    }

    // Filtrar otros productos (excluyendo el actual)
    const otrosProductos = productos.filter((p) => p.id !== producto.id);

    return { producto, otrosProductos };
  } catch (error) {
    console.error(`Error loading product by slug from ${categoria}:`, error);
    return { producto: null, otrosProductos: [] };
  }
}
