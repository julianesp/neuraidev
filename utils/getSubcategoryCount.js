/**
 * Obtiene el conteo de productos por subcategoría desde la base de datos
 */

import { getSupabaseServerClient } from "@/lib/db";

/**
 * Cuenta productos que coinciden con una subcategoría
 * @param {string} categorySlug - Slug de la categoría principal (ej: "computadoras")
 * @param {string} subcategory - Nombre de la subcategoría (ej: "Mouse")
 * @returns {Promise<number>} - Número de productos en esa subcategoría
 */
export async function countProductsInSubcategory(categorySlug, subcategory) {
  try {
    const supabase = getSupabaseServerClient();

    // Obtener todos los productos de la categoría
    const { data: productos, error } = await supabase
      .from("products")
      .select("id, nombre, title, metadata")
      .eq("categoria", categorySlug)
      .eq("disponible", true);

    if (error) {
      console.error(
        `[getSubcategoryCount] Error al obtener productos de ${categorySlug}:`,
        error
      );
      return 0;
    }

    if (!productos || productos.length === 0) {
      return 0;
    }

    // Filtrar por subcategoría
    const productosFiltrados = productos.filter((producto) => {
      const nombreIncluye =
        producto.nombre?.toLowerCase().includes(subcategory.toLowerCase()) ||
        producto.title?.toLowerCase().includes(subcategory.toLowerCase());

      const metadataIncluye =
        producto.metadata?.subcategoria?.toLowerCase() ===
          subcategory.toLowerCase() ||
        producto.metadata?.tipo
          ?.toLowerCase()
          .includes(subcategory.toLowerCase()) ||
        producto.metadata?.genero
          ?.toLowerCase()
          .includes(subcategory.toLowerCase());

      return nombreIncluye || metadataIncluye;
    });

    return productosFiltrados.length;
  } catch (error) {
    console.error("[countProductsInSubcategory] Error:", error);
    return 0;
  }
}

/**
 * Obtiene el conteo de todas las subcategorías de una categoría
 * @param {string} categorySlug - Slug de la categoría
 * @param {string[]} subcategories - Array de subcategorías a contar
 * @returns {Promise<Object>} - Objeto con conteos { subcategoria: count }
 */
export async function getSubcategoriesCounts(categorySlug, subcategories) {
  try {
    const counts = {};

    // Contar productos para cada subcategoría en paralelo
    const countPromises = subcategories.map(async (subcategory) => {
      const count = await countProductsInSubcategory(
        categorySlug,
        subcategory
      );
      return { subcategory, count };
    });

    const results = await Promise.all(countPromises);

    // Convertir array de resultados a objeto
    results.forEach(({ subcategory, count }) => {
      counts[subcategory] = count;
    });

    return counts;
  } catch (error) {
    console.error("[getSubcategoriesCounts] Error:", error);
    return {};
  }
}

/**
 * Obtiene solo las subcategorías que tienen productos
 * @param {string} categorySlug - Slug de la categoría
 * @param {string[]} subcategories - Array de subcategorías posibles
 * @returns {Promise<string[]>} - Array de subcategorías con productos
 */
export async function getAvailableSubcategories(categorySlug, subcategories) {
  try {
    const counts = await getSubcategoriesCounts(categorySlug, subcategories);

    // Filtrar solo las que tienen productos
    return subcategories.filter((subcategory) => counts[subcategory] > 0);
  } catch (error) {
    console.error("[getAvailableSubcategories] Error:", error);
    return subcategories; // En caso de error, mostrar todas
  }
}
