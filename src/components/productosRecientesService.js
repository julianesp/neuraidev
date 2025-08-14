/**
 * Servicio para obtener los datos de productos recientes
 * Gestiona la lógica de obtención de productos nuevos para exhibición
 */

// URL del archivo JSON para productos recientes
const PRODUCTOS_API_URL = "/productosRecientes.json";

/**
 * Obtiene todos los productos recientes disponibles
 * @returns {Promise<Array>} Lista de productos nuevos
 */
export const cargarProductosRecientes = async () => {
  try {
    const response = await fetch(PRODUCTOS_API_URL);
    if (!response.ok) {
      throw new Error(
        `Error al cargar los productos recientes. Estado: ${response.status}`,
      );
    }
    const datos = await response.json();

    // Extraer el array de productos de la estructura
    return datos.productos || [];
  } catch (error) {
    // console.error("Error en el servicio de productos recientes:", error);
    // Devolver array vacío para evitar errores en los componentes
    return [];
  }
};

/**
 * Obtiene solo los productos más recientes
 * @returns {Promise<Array>} Lista de productos nuevos
 */
export const obtenerProductosRecientes = async () => {
  try {
    // Devolver todos los productos ya que en la nueva estructura
    // todos los productos en el archivo son recientes
    return await cargarProductosRecientes();
  } catch (error) {
    console.error("Error al obtener productos recientes:", error);
    return [];
  }
};

/**
 * Obtiene un producto específico por su ID
 * @param {string} id - ID del producto a buscar
 * @returns {Promise<Object|null>} El producto encontrado o null
 */
export const obtenerProductoRecientePorId = async (id) => {
  try {
    const productos = await cargarProductosRecientes();
    // Buscar por ID como string (no como número)
    return productos.find((producto) => producto.id === id) || null;
  } catch (error) {
    console.error(`Error al obtener producto con ID ${id}:`, error);
    return null;
  }
};

// Crear el objeto de servicios antes de exportarlo
const productosRecientesService = {
  cargarProductosRecientes,
  obtenerProductosRecientes,
  obtenerProductoRecientePorId,
};

export default productosRecientesService;