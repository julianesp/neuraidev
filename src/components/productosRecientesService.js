/**
 * Servicio para obtener los datos de productos recientes
 * Gestiona la lógica de obtención de productos nuevos para exhibición
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
 * Obtiene todos los productos de una categoría específica
 * @param {string} categoria - Nombre de la categoría
 * @returns {Promise<Array>} Lista de productos de la categoría
 */
const obtenerProductosDeCategoria = async (categoria) => {
  try {
    const url = CATEGORIAS_ARCHIVOS[categoria];
    if (!url) return [];

    const respuesta = await fetch(url);
    if (!respuesta.ok) return [];

    const data = await respuesta.json();
    const accesorios = data.accesorios || [];

    // IMPORTANTE: Asegurar que cada producto tenga la categoría correcta
    // Si el producto no tiene categoría definida, usar la categoría del archivo
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
 * Obtiene todos los productos de todas las categorías
 * @returns {Promise<Array>} Lista de todos los productos
 */
export const cargarProductosRecientes = async () => {
  try {
    const categorias = Object.keys(CATEGORIAS_ARCHIVOS);
    const promesas = categorias.map((cat) => obtenerProductosDeCategoria(cat));
    const resultados = await Promise.all(promesas);

    // Combinar todos los arrays en uno solo
    const todosLosProductos = resultados.flat();

    return todosLosProductos;
  } catch (error) {
    console.error("Error en el servicio de productos recientes:", error);
    return [];
  }
};

/**
 * Obtiene solo los productos más recientes
 * Prioriza productos de los últimos 30 días
 * Si no hay suficientes, muestra los 10 más recientes sin importar la fecha
 * @returns {Promise<Array>} Lista de productos recientes ordenados por fecha
 */
export const obtenerProductosRecientes = async () => {
  try {
    const todosLosProductos = await cargarProductosRecientes();

    // Filtrar productos que tengan fecha de ingreso y estén disponibles
    const productosConFecha = todosLosProductos.filter((producto) => {
      return producto.fechaIngreso && producto.disponible !== false;
    });

    // Ordenar por fecha de ingreso (más recientes primero)
    const productosOrdenados = productosConFecha.sort((a, b) => {
      const fechaA = new Date(a.fechaIngreso);
      const fechaB = new Date(b.fechaIngreso);
      return fechaB - fechaA; // Orden descendente (más reciente primero)
    });

    // Calcular fecha de hace 30 días
    const ahora = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(ahora.getDate() - 30);

    // Filtrar productos de los últimos 30 días
    const productosRecientes = productosOrdenados.filter((producto) => {
      const fechaProducto = new Date(producto.fechaIngreso);
      return fechaProducto >= hace30Dias;
    });

    // Si hay productos de los últimos 30 días, mostrar hasta 10
    if (productosRecientes.length > 0) {
      return productosRecientes.slice(0, 10);
    }

    // Si no hay productos recientes, mostrar los últimos 10 sin importar fecha
    return productosOrdenados.slice(0, 10);
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