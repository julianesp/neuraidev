/**
 * Servicio centralizado para gestión de productos y stock
 *
 * NOTE: Supabase removed — pending migration to Cloudflare D1.
 * Las funciones de stock ya operan sobre D1 (tabla `products`); el resto
 * sigue lanzando 'Not implemented' hasta completar la migración.
 */

import { d1Select, d1Execute } from './db-d1';

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

export async function decrementProductStock(productId, quantity = 1) {
  try {
    const rows = await d1Select('SELECT stock FROM products WHERE id = ? LIMIT 1', [productId]);
    if (!rows || rows.length === 0) {
      return { success: false, productId, error: 'Producto no encontrado' };
    }

    const previousStock = Number(rows[0].stock) || 0;
    const qty = Math.max(parseInt(quantity, 10) || 1, 1);
    const newStock = Math.max(previousStock - qty, 0);

    await d1Execute('UPDATE products SET stock = ?, updated_at = ? WHERE id = ?', [
      newStock,
      new Date().toISOString(),
      productId,
    ]);

    return { success: true, productId, previousStock, newStock };
  } catch (error) {
    return { success: false, productId, error: error.message };
  }
}

/**
 * Descuenta stock de varios productos. Acepta items con id/productId y
 * quantity/cantidad (formatos usados por los webhooks de pago).
 */
export async function decrementMultipleProductsStock(items = []) {
  const results = [];

  for (const item of items) {
    const productId = item.id || item.productId;
    const quantity = item.quantity || item.cantidad || 1;

    if (!productId) {
      results.push({ success: false, productId: null, error: 'Item sin id de producto' });
      continue;
    }

    results.push(await decrementProductStock(productId, quantity));
  }

  return {
    success: results.length > 0 && results.every((r) => r.success),
    results,
  };
}

export async function searchProducts() {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}

export async function getAllProducts() {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}
