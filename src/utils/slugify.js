/**
 * Convierte un texto en un slug URL-friendly
 * @param {string} text - El texto a convertir
 * @returns {string} - El slug generado
 */
export function slugify(text) {
  if (!text) return "";

  return (
    text
      .toString()
      .toLowerCase()
      // Reemplazar caracteres especiales del español
      .replace(/á/g, "a")
      .replace(/é/g, "e")
      .replace(/í/g, "i")
      .replace(/ó/g, "o")
      .replace(/ú/g, "u")
      .replace(/ñ/g, "n")
      .replace(/ü/g, "u")
      // Reemplazar espacios y caracteres especiales con guiones
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "")
  );
}

/**
 * Genera un slug único para un producto basado en su nombre y opcionalmente su ID
 * @param {Object} producto - El objeto producto
 * @returns {string} - El slug único generado
 */
export function generateProductSlug(producto) {
  if (!producto) return "";

  const nombre = producto.nombre || producto.title || "";
  const id = producto.id || "";

  // Generar slug base del nombre
  const slugBase = slugify(nombre);

  // Si el producto tiene un ID numérico, agregarlo al final
  if (id && typeof id === "number") {
    return `${slugBase}-${id}`;
  }

  // Si el ID ya es un string descriptivo, usar solo el nombre
  if (id && typeof id === "string" && id.includes("-")) {
    return slugBase || id;
  }

  // Agregar ID si existe
  if (id) {
    return `${slugBase}-${slugify(id.toString())}`;
  }

  return slugBase;
}

/**
 * Encuentra un producto por su slug en una lista de productos
 * @param {Array} productos - Lista de productos
 * @param {string} slug - El slug a buscar
 * @returns {Object|null} - El producto encontrado o null
 */
export function findProductBySlug(productos, slug) {
  if (!productos || !Array.isArray(productos) || !slug) {
    return null;
  }

  return productos.find((producto) => {
    const productSlug = generateProductSlug(producto);
    return productSlug === slug;
  });
}

/**
 * Genera el slug de categoría basado en la URL de la API o archivo JSON
 * @param {string} apiUrl - URL de la API (ej: "/api/productos?categoria=celulares") o archivo JSON (ej: "/computadoras.json")
 * @returns {string} - El slug de categoría
 */
export function getCategorySlug(apiUrl) {
  if (!apiUrl) return "";

  let categoryName = "";

  // Si es una URL de API con parámetros
  if (apiUrl.includes("/api/productos?categoria=")) {
    const urlParams = new URLSearchParams(apiUrl.split("?")[1]);
    categoryName = urlParams.get("categoria") || "";
  }
  // Si es un archivo JSON (compatibilidad hacia atrás)
  else {
    categoryName = apiUrl.replace(/^\//, "").replace(/\.json$/, "");
  }

  // Mapeo específico de categorías a slugs
  const categoryMapping = {
    computadoras: "computadoras",
    computers: "computadoras", // Alias
    celulares: "celulares",
    gadgets: "gadgets",
    generales: "generales",
    damas: "damas",
    tecnico_sistemas: "generales", // Mapear a generales
    peluqueria: "generales", // Mapear a generales
    tienda: "generales", // Mapear a generales
    presentation: "generales", // Mapear a generales
    accesoriosDestacados: "destacados",
    accesoriosNuevos: "nuevos",
    accesorios_generales: "generales",
    accesories: "computadoras", // Este archivo parece contener accesorios de computadoras
    accesoriesBooksNew: "libros-nuevos",
    accesoriesBooksOld: "libros-usados",
    librosnuevos: "libros-nuevos",
    librosusados: "libros-usados",
    "libros-nuevos": "libros-nuevos",
    "libros-usados": "libros-usados",
  };

  return categoryMapping[categoryName] || categoryName;
}

/**
 * Construye la URL completa del producto
 * @param {string} categorySlug - Slug de la categoría
 * @param {string} productSlug - Slug del producto
 * @param {object} product - Objeto del producto (opcional, para casos especiales como libros)
 * @returns {string} - URL completa del producto
 */
export function buildProductUrl(categorySlug, productSlug, product = null) {
  // Caso especial: si es categoría "libros", determinar si es nuevo o usado
  if (categorySlug === "libros" && product) {
    const condicion = product.condicion || "nuevo"; // Default a 'nuevo' si no está especificado
    const subcategorySlug =
      condicion === "usado" ? "libros-usados" : "libros-nuevos";
    return `/accesorios/${subcategorySlug}/${productSlug}`;
  }

  return `/accesorios/${categorySlug}/${productSlug}`;
}
