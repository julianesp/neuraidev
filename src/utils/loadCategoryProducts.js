import { promises as fs } from "fs";
import path from "path";
import { findProductBySlug } from "./slugify";

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
 * Carga los productos de una categoría desde el archivo JSON correspondiente
 * @param {string} categoria - El nombre de la categoría
 * @returns {Promise<Array>} - Array de productos disponibles
 */
export async function loadCategoryProducts(categoria) {
  try {
    const archivo = categoriaArchivos[categoria];
    if (!archivo) {
      console.warn(`No se encontró archivo para la categoría: ${categoria}`);
      return [];
    }

    const filePath = path.join(process.cwd(), "public", archivo);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    // Normalizar estructura de datos
    const productos = (data.accesorios || []).map((p) => ({
      ...p,
      imagenPrincipal:
        p.imagenPrincipal || (p.imagenes && p.imagenes[0]?.url) || null,
      // Si tiene disponible definido, usarlo. Si tiene cantidad, verificarla. Sino, asumir disponible.
      disponible:
        p.disponible !== undefined
          ? p.disponible
          : p.cantidad !== undefined
            ? p.cantidad > 0
            : true,
    }));

    return productos.filter((p) => p.disponible);
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

    const producto = findProductBySlug(productos, slug);

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
