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
