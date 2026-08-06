import { d1Select } from "@/lib/db-d1";

/**
 * Categorías cuyo listado depende del stock real en Cloudflare D1.
 *
 * Solo se ocultan estas cuando no tienen existencias. El resto de secciones
 * de la tienda (servicios, destacados, etc.) no se ven afectadas.
 */
export const STOCK_CONTROLLED_CATEGORIES = [
  "celulares",
  "computadoras",
  "libros-nuevos",
  "libros-usados",
  "generales",
];

/**
 * Consulta D1 y devuelve el conjunto de categorías que tienen al menos un
 * producto disponible con stock (mismo criterio que normalizarProducto:
 * disponible = 1 AND stock > 0).
 *
 * Se usa para no mostrar al usuario categorías vacías (p. ej. libros cuando
 * no hay ningún ejemplar en existencia). En cuanto se agrega un producto con
 * stock, la categoría vuelve a aparecer automáticamente.
 *
 * @returns {Promise<Set<string>>} Set de slugs de categoría con existencias.
 */
export async function getCategoriesWithStock() {
  try {
    const rows = await d1Select(
      `SELECT categoria
         FROM products
        WHERE disponible = 1 AND stock > 0
        GROUP BY categoria`,
    );
    return new Set((rows || []).map((r) => r.categoria));
  } catch (error) {
    console.error("[getCategoriesWithStock]", error);
    // Ante un fallo de la BD, no ocultamos nada para no dejar la tienda vacía.
    return new Set(STOCK_CONTROLLED_CATEGORIES);
  }
}

/**
 * Decide si una categoría debe mostrarse.
 * - Categorías fuera de STOCK_CONTROLLED_CATEGORIES siempre se muestran.
 * - Las controladas por stock solo se muestran si están en el set con stock.
 *
 * @param {string} categoriaId - slug de la categoría (p. ej. "libros-nuevos")
 * @param {Set<string>} categoriasConStock - resultado de getCategoriesWithStock
 * @returns {boolean}
 */
export function shouldShowCategory(categoriaId, categoriasConStock) {
  if (!STOCK_CONTROLLED_CATEGORIES.includes(categoriaId)) return true;
  return categoriasConStock.has(categoriaId);
}
