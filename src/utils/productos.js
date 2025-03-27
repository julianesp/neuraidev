// // utils/productos.js

// import fs from "fs";
// import path from "path";

// const productosFilePath = path.join(process.cwd(), "data", "productos.json");

// /**
//  * Cargar todos los productos desde el archivo JSON
//  * @returns {Array} Array de productos
//  */
// export function getAllProductos() {
//   try {
//     if (fs.existsSync(productosFilePath)) {
//       const fileContent = fs.readFileSync(productosFilePath, "utf8");
//       return JSON.parse(fileContent);
//     }
//     return [];
//   } catch (error) {
//     console.error("Error cargando productos:", error);
//     return [];
//   }
// }

// /**
//  * Obtener un producto por su ID
//  * @param {string} id ID del producto a buscar
//  * @returns {Object|null} Producto encontrado o null
//  */
// export function getProductoById(id) {
//   const productos = getAllProductos();
//   return productos.find((producto) => producto.id === id) || null;
// }

// /**
//  * Obtener productos destacados
//  * @returns {Array} Array de productos destacados
//  */
// export function getProductosDestacados() {
//   const productos = getAllProductos();
//   return productos.filter((producto) => producto.destacado === true);
// }

// /**
//  * Obtener productos relacionados por categoría
//  * @param {string} categoriaId ID de la categoría
//  * @param {string} exceptProductId ID del producto a excluir
//  * @param {number} limit Límite de productos a devolver
//  * @returns {Array} Array de productos relacionados
//  */
// export function getProductosRelacionados(
//   categoriaId,
//   exceptProductId,
//   limit = 4,
// ) {
//   const productos = getAllProductos();
//   return productos
//     .filter(
//       (producto) =>
//         producto.categoria === categoriaId && producto.id !== exceptProductId,
//     )
//     .slice(0, limit);
// }

// /**
//  * Estructura de ejemplo para el archivo JSON
//  * @returns {Object} Estructura de ejemplo
//  */
// export function getExampleProductoJson() {
//   return {
//     id: "accesorio-premium",
//     title: "Accesorio Premium Ultra",
//     description:
//       "Este accesorio de alta calidad está diseñado para mejorar la experiencia del usuario.",
//     price: 299999,
//     oldPrice: 349999,
//     categoria: "accesorios-celular",
//     destacado: true,
//     images: ["/images/producto1-1.jpg", "/images/producto1-2.jpg"],
//     videoUrl: "/videos/producto1.mp4",
//   };
// }

// utils/productos.js
// Versión compatible con cliente (sin usar fs directamente)

// Datos estáticos para fallback (opcional)
const datosEjemplo = [
  {
    id: "accesorio-premium",
    title: "Accesorio Premium Ultra",
    description:
      "Este accesorio de alta calidad está diseñado para mejorar la experiencia del usuario.",
    price: 299999,
    oldPrice: 349999,
    categoria: "accesorios-celular",
    destacado: true,
    images: ["/imagenes/placeholder.jpg"],
  },
];

// Cargar todos los productos
export async function getAllProductos() {
  try {
    // En desarrollo o construcción, importa el JSON directamente (funciona en Next.js)
    if (process.env.NODE_ENV === "development") {
      const productos = await import("@/data/productos.json");
      return productos.default || [];
    } else {
      // En producción, usa fetch para obtener los datos
      const res = await fetch("/api/productos");
      if (!res.ok) throw new Error("Error al cargar productos");
      return await res.json();
    }
  } catch (error) {
    console.error("Error cargando productos:", error);
    return datosEjemplo; // Fallback a datos de ejemplo
  }
}

// Obtener un producto por su ID
export async function getProductoById(id) {
  try {
    if (!id) return null;

    // En desarrollo o construcción
    if (process.env.NODE_ENV === "development") {
      const productos = await import("@/data/productos.json");
      return (
        (productos.default || []).find((producto) => producto.id === id) || null
      );
    } else {
      // En producción
      const res = await fetch(`/api/productos/${id}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Error al cargar producto");
      }
      return await res.json();
    }
  } catch (error) {
    console.error(`Error cargando producto ${id}:`, error);
    return null;
  }
}

// Obtener productos destacados
export async function getProductosDestacados() {
  const productos = await getAllProductos();
  return productos.filter((producto) => producto.destacado === true);
}

// Obtener productos relacionados por categoría
export async function getProductosRelacionados(
  categoriaId,
  exceptProductId,
  limit = 4,
) {
  const productos = await getAllProductos();
  return productos
    .filter(
      (producto) =>
        producto.categoria === categoriaId && producto.id !== exceptProductId,
    )
    .slice(0, limit);
}

// Estructura de ejemplo para el archivo JSON
export function getExampleProductoJson() {
  return {
    id: "accesorio-premium",
    title: "Accesorio Premium Ultra",
    description:
      "Este accesorio de alta calidad está diseñado para mejorar la experiencia del usuario.",
    price: 299999,
    oldPrice: 349999,
    categoria: "accesorios-celular",
    destacado: true,
    images: ["/imagenes/producto1-1.jpg", "/imagenes/producto1-2.jpg"],
    videoUrl: "/videos/producto1.mp4",
  };
}
