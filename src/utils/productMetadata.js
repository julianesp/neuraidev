import { findProductBySlug } from "./slugify";
import { promises as fs } from "fs";
import path from "path";

const categoriaArchivos = {
  celulares: "celulares.json",
  computadoras: "computadoras.json",
  "libros-usados": "librosusados.json",
  "libros-nuevos": "librosnuevos.json",
  generales: "generales.json",
  damas: "damas.json",
  belleza: "damas.json",
  bicicletas: "bicicletas.json",
};

// Función para obtener productos de una categoría específica usando JSON
async function getCategoryProducts(categoria) {
  try {
    const archivo = categoriaArchivos[categoria];
    if (!archivo) return [];

    const filePath = path.join(process.cwd(), "public", archivo);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    const productos = (data.accesorios || []).map((p) => ({
      ...p,
      imagenPrincipal: p.imagenPrincipal || (p.imagenes && p.imagenes[0]?.url) || null,
      // Si tiene disponible definido, usarlo. Si tiene cantidad, verificarla. Sino, asumir disponible.
      disponible: p.disponible !== undefined
        ? p.disponible
        : (p.cantidad !== undefined ? p.cantidad > 0 : true),
    }));

    return productos.filter((p) => p.disponible);
  } catch (error) {
    console.error(`Error fetching ${categoria} products:`, error);
    return [];
  }
}

// Función para buscar producto en todas las categorías
async function findProductInAllCategories(slug) {
  const categorias = [
    'celulares',
    'computadoras',
    'bicicletas',
    'generales',
    'damas',
    'libros-nuevos',
    'libros-usados'
  ];

  for (const categoria of categorias) {
    try {
      const productos = await getCategoryProducts(categoria);
      const producto = findProductBySlug(productos, slug);
      if (producto) {
        return producto;
      }
    } catch (err) {
      continue;
    }
  }

  return null;
}

// Función para buscar producto por ID en todas las categorías
export async function findProductById(id) {
  const categorias = [
    'celulares',
    'computadoras',
    'bicicletas',
    'generales',
    'damas',
    'libros-nuevos',
    'libros-usados'
  ];

  for (const categoria of categorias) {
    try {
      const productos = await getCategoryProducts(categoria);
      const producto = productos.find(p => p.id === id);
      if (producto) {
        return producto;
      }
    } catch (err) {
      continue;
    }
  }

  return null;
}

// Función principal para generar metadatos de productos
export async function generateProductMetadata(slug, categoria) {
  // Primero buscar en la categoría específica
  const categoryProducts = await getCategoryProducts(categoria);
  let producto = findProductBySlug(categoryProducts, slug);

  // Si no se encuentra, buscar en todas las categorías
  if (!producto) {
    producto = await findProductInAllCategories(slug);
  }

  if (!producto) {
    return {
      title: 'Producto no encontrado | Neurai.dev',
      description: 'El producto que buscas no existe o ha sido eliminado.',
    };
  }

  // Limpiar descripción para meta tags
  const descripcionLimpia = producto.descripcion
    ?.replace(/[^\w\s\-.,áéíóúñü]/gi, '')
    .slice(0, 160) || `${producto.nombre} - ${producto.categoria}`;

  const precio = typeof producto.precio === 'object' ?
    parseFloat(producto.precio.toString()) :
    parseFloat(producto.precio) || 0;

  return {
    title: `${producto.nombre} | Neurai.dev`,
    description: descripcionLimpia,
    keywords: `${producto.nombre}, ${producto.categoria}, ${producto.marca || 'Neurai.dev'}, comprar, ${producto.condicion || producto.estado || 'nuevo'}`,
    openGraph: {
      title: `${producto.nombre} | Neurai.dev`,
      description: descripcionLimpia,
      type: 'website',
      siteName: 'Neurai.dev',
      locale: 'es_ES',
      url: `https://neurai.dev/accesorios/${producto.categoria}/${slug}`,
      images: [
        ...(producto.imagenPrincipal ? [{
          url: producto.imagenPrincipal,
          width: 800,
          height: 600,
          alt: producto.nombre,
        }] : []),
        ...(producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes.slice(0, 3).map(img => ({
          url: img.url,
          width: 800,
          height: 600,
          alt: producto.nombre,
        })) : []),
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${producto.nombre} | Neurai.dev`,
      description: descripcionLimpia,
      images: producto.imagenPrincipal ? [producto.imagenPrincipal] : [],
    },
    other: {
      'product:price:amount': precio.toString(),
      'product:price:currency': 'COP',
      'product:availability': producto.disponible ? 'in stock' : 'out of stock',
      'product:condition': producto.condicion || producto.estado || 'nuevo',
      'product:brand': producto.marca || 'Neurai.dev',
      'product:category': producto.categoria,
    },
  };
}
