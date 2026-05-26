/**
 * Servicio centralizado para gestión de productos y stock
 *
 * NOTE: Supabase removed — pending migration to Cloudflare D1.
 * All database functions throw 'Not implemented' until migrated.
 */

/**
 * Normaliza un producto al formato esperado por los componentes
 */
export function normalizeProduct(product) {
  if (!product) return null;

  return {
    ...product,
    id: product.id,
    nombre: product.title || product.nombre,
    precio: product.price || product.precio,
    imagenes: product.images || product.imagenes || [],
    imagenPrincipal: product.images?.[0] || product.imagenes?.[0] || '/placeholder.jpg',
    descripcion: product.description || product.descripcion || '',
    stock: product.stock || 0,
    categoria: product.categoria || 'generales',
    destacado: product.destacado || false,
  };
}

export async function getProductById() {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}

export async function getProductsByCategory() {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}

export async function getFeaturedProducts() {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}

export async function getRelatedProducts() {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}

export async function checkProductStock() {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}

export async function decrementProductStock() {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}

export async function decrementMultipleProductsStock() {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}

export async function searchProducts() {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}

export async function getAllProducts() {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}
