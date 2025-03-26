/**
 * Servicio para obtener los datos de accesorios
 * Centraliza la lógica de obtención de datos para reutilización
 */

// URL del archivo JSON (corregida)
const API_URL = "/accesoriosDestacados.json";

/**
 * Obtiene todos los accesorios disponibles
 * @returns {Promise<Array>} Lista de accesorios
 */
export const obtenerAccesorios = async () => {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) {
      throw new Error(
        `Error al cargar los accesorios. Estado: ${respuesta.status}`,
      );
    }
    const data = await respuesta.json();

    // Extraer el array de accesorios de la estructura
    return data.accesorios || [];
  } catch (error) {
    console.error("Error en el servicio de accesorios:", error);
    // Devolver array vacío para evitar errores en los componentes
    return [];
  }
};

/**
 * Obtiene solo los accesorios destacados
 * @returns {Promise<Array>} Lista de accesorios destacados
 */
export const obtenerAccesoriosDestacados = async () => {
  try {
    // Simplemente devolver todos los accesorios ya que en la nueva estructura
    // todos los accesorios en el archivo son destacados
    return await obtenerAccesorios();
  } catch (error) {
    console.error("Error al obtener accesorios destacados:", error);
    return [];
  }
};

/**
 * Obtiene un accesorio específico por su ID
 * @param {string} id - ID del accesorio a buscar
 * @returns {Promise<Object|null>} El accesorio encontrado o null
 */
export const obtenerAccesorioPorId = async (id) => {
  try {
    const accesorios = await obtenerAccesorios();
    // Buscar por ID como string (no como número)
    return accesorios.find((accesorio) => accesorio.id === id) || null;
  } catch (error) {
    console.error(`Error al obtener accesorio con ID ${id}:`, error);
    return null;
  }
};

// Crear el objeto de servicios antes de exportarlo
const accesoriosService = {
  obtenerAccesorios,
  obtenerAccesoriosDestacados,
  obtenerAccesorioPorId,
};

export default accesoriosService;
