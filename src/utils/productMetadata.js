import { findProductBySlug } from "./slugify";
import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para server-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Función para obtener productos de una categoría específica desde Supabase
async function getCategoryProducts(categoria) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('categoria', categoria)
      .eq('disponible', true)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error(`Error fetching ${categoria} products:`, error);
      return [];
    }

    // Normalizar estructura de datos para compatibilidad
    const productos = (data || []).map((p) => ({
      ...p,
      imagenPrincipal: p.imagenPrincipal || null,
      disponible: p.disponible && p.stock > 0,
    }));

    return productos.filter((p) => p.disponible);
  } catch (error) {
    console.error(`Error fetching ${categoria} products:`, error);
    return [];
  }
}

// Función para buscar producto en todas las categorías
async function findProductInAllCategories(slug) {
  try {
    // Intentar buscar directamente por slug en todas las categorías
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('disponible', true);

    if (error) {
      console.error('Error searching product in all categories:', error);
      return null;
    }

    // Buscar el producto por slug usando la función auxiliar
    const producto = findProductBySlug(data || [], slug);
    return producto;
  } catch (err) {
    console.error('Error in findProductInAllCategories:', err);
    return null;
  }
}

// Función para buscar producto por ID en todas las categorías
export async function findProductById(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('disponible', true)
      .single();

    if (error) {
      console.error('Error finding product by ID:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in findProductById:', err);
    return null;
  }
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

  // Obtener imágenes adicionales del producto desde la tabla product_images
  let imagenesAdicionales = [];
  try {
    const { data: imagenes, error } = await supabase
      .from('product_images')
      .select('url, alt, orden')
      .eq('productoId', producto.id)
      .order('orden', { ascending: true });

    if (!error && imagenes) {
      imagenesAdicionales = imagenes;
    }
  } catch (err) {
    console.error('Error fetching product images:', err);
  }

  // Limpiar descripción para meta tags
  const descripcionLimpia = producto.descripcion
    ?.replace(/[^\w\s\-.,áéíóúñü]/gi, '')
    .slice(0, 160) || `${producto.nombre} - ${producto.categoria}`;

  const precio = typeof producto.precio === 'object' ?
    parseFloat(producto.precio.toString()) :
    parseFloat(producto.precio) || 0;

  // Construir array de imágenes para metadatos
  const imagenesParaMetadata = [
    ...(producto.imagenPrincipal ? [{
      url: producto.imagenPrincipal,
      width: 800,
      height: 600,
      alt: producto.nombre,
    }] : []),
    ...imagenesAdicionales.slice(0, 3).map(img => ({
      url: img.url,
      width: 800,
      height: 600,
      alt: img.alt || producto.nombre,
    })),
  ];

  return {
    title: `${producto.nombre} | Neurai.dev`,
    description: descripcionLimpia,
    keywords: `${producto.nombre}, ${producto.categoria}, ${producto.marca || 'Neurai.dev'}, comprar, ${producto.condicion || 'nuevo'}`,
    openGraph: {
      title: `${producto.nombre} | Neurai.dev`,
      description: descripcionLimpia,
      type: 'website',
      siteName: 'Neurai.dev',
      locale: 'es_ES',
      url: `https://neurai.dev/accesorios/${producto.categoria}/${slug}`,
      images: imagenesParaMetadata,
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
      'product:condition': producto.condicion || 'nuevo',
      'product:brand': producto.marca || 'Neurai.dev',
      'product:category': producto.categoria,
    },
  };
}
