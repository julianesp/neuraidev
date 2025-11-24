/**
 * Servicio para obtener los datos de accesorios
 * Centraliza la lógica de obtención de datos para reutilización
 */

// Archivos de categorías
const CATEGORIAS_ARCHIVOS = {
  celulares: "/celulares.json",
  computadoras: "/computadoras.json",
  damas: "/damas.json",
  belleza: "/damas.json", // belleza usa el mismo archivo que damas
  "libros-nuevos": "/libros-nuevos.json",
  "libros-usados": "/libros-usados.json",
  generales: "/generales.json",
};

/**
 * Obtiene todos los accesorios de una categoría específica
 * @param {string} categoria - Nombre de la categoría
 * @returns {Promise<Array>} Lista de accesorios de la categoría
 */
const obtenerAccesoriosDeCategoria = async (categoria) => {
  try {
    const url = CATEGORIAS_ARCHIVOS[categoria];
    if (!url) return [];

    const respuesta = await fetch(url);
    if (!respuesta.ok) return [];

    const data = await respuesta.json();
    const accesorios = data.accesorios || [];

    // IMPORTANTE: Asegurar que cada accesorio tenga la categoría correcta
    // Si el accesorio no tiene categoría definida, usar la categoría del archivo
    return accesorios.map(accesorio => ({
      ...accesorio,
      categoria: accesorio.categoria || categoria
    }));
  } catch (error) {
    console.error(`Error al cargar ${categoria}:`, error);
    return [];
  }
};

/**
 * Obtiene todos los accesorios de todas las categorías
 * @returns {Promise<Array>} Lista de todos los accesorios
 */
export const obtenerAccesorios = async () => {
  try {
    const categorias = Object.keys(CATEGORIAS_ARCHIVOS);
    const promesas = categorias.map((cat) => obtenerAccesoriosDeCategoria(cat));
    const resultados = await Promise.all(promesas);

    // Combinar todos los arrays en uno solo
    const todosLosAccesorios = resultados.flat();

    return todosLosAccesorios;
  } catch (error) {
    console.error("Error en el servicio de accesorios:", error);
    return [];
  }
};

/**
 * Obtiene solo los accesorios destacados de todas las categorías
 * Filtra por la propiedad "destacado": true y ordena por fecha de ingreso
 * @returns {Promise<Array>} Lista de accesorios destacados ordenados por fecha
 */
export const obtenerAccesoriosDestacados = async () => {
  try {
    const todosLosAccesorios = await obtenerAccesorios();

    // Filtrar solo los que tienen destacado: true y están disponibles
    const destacados = todosLosAccesorios.filter(
      (accesorio) =>
        accesorio.destacado === true && accesorio.disponible !== false
    );

    // Ordenar por fecha de ingreso (más recientes primero)
    const destacadosOrdenados = destacados.sort((a, b) => {
      const fechaA = new Date(a.fechaIngreso || "2024-01-01");
      const fechaB = new Date(b.fechaIngreso || "2024-01-01");
      return fechaB - fechaA; // Orden descendente (más reciente primero)
    });

    // Limitar a 10 productos destacados
    return destacadosOrdenados.slice(0, 10);
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
