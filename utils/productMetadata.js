import { findProductBySlug } from "./slugify";
import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para server-side con timeout aumentado
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    global: {
      fetch: (url, options = {}) => {
        const controller = new AbortController();
        // Aumentar timeout a 30 segundos para producción
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        return fetch(url, {
          ...options,
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
      },
    },
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false,
    },
  }
);

/**
 * Función auxiliar para reintentar operaciones con backoff exponencial
 */
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = i === maxRetries - 1;
      const isTimeoutError = error.name === 'AbortError' ||
                             error.message?.includes('timeout') ||
                             error.message?.includes('fetch failed');

      if (isLastAttempt || !isTimeoutError) {
        throw error;
      }

      const waitTime = delay * Math.pow(2, i);
      console.log(`[retryWithBackoff] Reintento ${i + 1}/${maxRetries} después de ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Función para obtener productos de una categoría específica desde Supabase
async function getCategoryProducts(categoria) {
  try {
    const { data, error } = await retryWithBackoff(async () => {
      const result = await supabase
        .from("products")
        .select("*")
        .eq("categoria", categoria)
        .eq("disponible", true)
        .order("created_at", { ascending: false });

      if (result.error) {
        throw result.error;
      }

      return result;
    });

    if (error) {
      console.error(`Error fetching ${categoria} products:`, error);
      return [];
    }

    // Normalizar estructura de datos para compatibilidad
    const productos = (data || []).map((p) => ({
      ...p,
      imagenPrincipal: p.imagen_principal || null,
      disponible: p.disponible && (p.stock > 0 || p.cantidad > 0),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
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
    const { data, error } = await retryWithBackoff(async () => {
      const result = await supabase
        .from("products")
        .select("*")
        .eq("disponible", true);

      if (result.error) {
        throw result.error;
      }

      return result;
    });

    if (error) {
      console.error("Error searching product in all categories:", error);
      return null;
    }

    // Buscar el producto por slug usando la función auxiliar
    const producto = findProductBySlug(data || [], slug);
    return producto;
  } catch (err) {
    console.error("Error in findProductInAllCategories:", err);
    return null;
  }
}

// Función para buscar producto por ID en todas las categorías
export async function findProductById(id) {
  try {
    const { data, error } = await retryWithBackoff(async () => {
      const result = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("disponible", true)
        .single();

      if (result.error) {
        throw result.error;
      }

      return result;
    });

    if (error) {
      console.error("Error finding product by ID:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in findProductById:", err);
    return null;
  }
}

// Función principal para generar metadatos de productos
export async function generateProductMetadata(slug, categoria) {
  try {
    // Primero buscar en la categoría específica
    const categoryProducts = await getCategoryProducts(categoria);
    let producto = findProductBySlug(categoryProducts, slug);

    // Si no se encuentra, buscar en todas las categorías
    if (!producto) {
      producto = await findProductInAllCategories(slug);
    }

    if (!producto) {
      return {
        title: "Producto no encontrado | Neurai.dev",
        description: "El producto que buscas no existe o ha sido eliminado.",
      };
    }

    return buildProductMetadata(producto, slug, categoria);
  } catch (error) {
    console.error('[generateProductMetadata] Error:', error);
    // Fallback: retornar metadatos básicos si hay error
    return {
      title: `Producto - ${categoria} | neurai.dev`,
      description: "Descubre nuestros productos en neurai.dev",
      metadataBase: new URL("https://neurai.dev"),
    };
  }
}

// Función auxiliar para construir metadatos del producto
function buildProductMetadata(producto, slug, categoria) {

  // Las imágenes ya vienen en el array 'imagenes' del producto (JSON)
  let imagenesAdicionales = [];
  if (producto.imagenes && Array.isArray(producto.imagenes)) {
    imagenesAdicionales = producto.imagenes.map((imagen, index) => {
      // Si ya es un objeto con propiedad 'url', usarlo
      if (typeof imagen === 'object' && imagen !== null && imagen.url) {
        return {
          url: imagen.url,
          alt: imagen.alt || producto.nombre,
          orden: imagen.orden !== undefined ? imagen.orden : index
        };
      }
      // Si es una URL (string), crear el objeto
      if (typeof imagen === 'string') {
        return {
          url: imagen,
          alt: producto.nombre,
          orden: index
        };
      }
      return null;
    }).filter(Boolean);
  }

  // Limpiar descripción para meta tags
  const descripcionLimpia =
    producto.descripcion?.replace(/[^\w\s\-.,áéíóúñü]/gi, "").slice(0, 160) ||
    `${producto.nombre} - ${producto.categoria}`;

  const precio =
    typeof producto.precio === "object"
      ? parseFloat(producto.precio.toString())
      : parseFloat(producto.precio) || 0;

  // Construir array de imágenes para metadatos
  // Usar imagen_principal o la primera del array de imagenes
  let imagenPrincipal = producto.imagen_principal ||
    (producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0] : null);

  // Si la imagen es un objeto con propiedad url, extraerla
  if (imagenPrincipal && typeof imagenPrincipal === 'object' && imagenPrincipal.url) {
    imagenPrincipal = imagenPrincipal.url;
  }

  // Asegurar que la URL esté correctamente codificada (sin espacios)
  if (imagenPrincipal && typeof imagenPrincipal === 'string') {
    imagenPrincipal = imagenPrincipal.replace(/ /g, '%20');
  }

  // Si no hay imagen del producto, usar el logo del sitio
  const logoSitio = 'https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png';
  const imagenFinal = imagenPrincipal || logoSitio;

  const imagenesParaMetadata = [
    {
      url: imagenFinal,
      secureUrl: imagenFinal, // WhatsApp y otras plataformas requieren secureUrl
      width: 1200,
      height: 630,
      alt: producto.nombre,
      type: 'image/jpeg',
    },
    ...imagenesAdicionales.slice(0, 2).map((img) => {
      // Asegurar que la URL esté correctamente codificada
      const urlLimpia = typeof img.url === 'string' ? img.url.replace(/ /g, '%20') : img.url;
      return {
        url: urlLimpia,
        secureUrl: urlLimpia, // WhatsApp y otras plataformas requieren secureUrl
        width: 1200,
        height: 630,
        alt: img.alt || producto.nombre,
        type: 'image/jpeg',
      };
    }),
  ];

  // URL canónica consistente (con www)
  const canonicalUrl = `https://neurai.dev/accesorios/${producto.categoria}/${slug}`;

  // Formatear precio de forma segura (sin toLocaleString que puede fallar en server-side)
  const formatPrecio = (num) => {
    if (!num || num <= 0) return null;
    try {
      const numString = Math.floor(num).toString();
      return numString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    } catch (e) {
      console.error('Error formatting price:', e);
      return null;
    }
  };

  // Título más atractivo para compartir
  const precioFormateado = formatPrecio(precio);
  const tituloCompartir = precioFormateado
    ? `${producto.nombre} - $${precioFormateado} COP`
    : producto.nombre;

  return {
    title: `${producto.nombre} | neurai.dev`,
    description: descripcionLimpia,
    keywords: `${producto.nombre}, ${producto.categoria}, ${producto.marca || "neurai.dev"}, comprar, ${producto.condicion || "nuevo"}`,
    authors: [{ name: "neurai.dev" }],
    creator: "neurai.dev",
    publisher: "neurai.dev",
    metadataBase: new URL("https://neurai.dev"),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: tituloCompartir,
      description: descripcionLimpia,
      type: "product",
      siteName: "neurai.dev",
      locale: "es_CO",
      url: canonicalUrl,
      images: imagenesParaMetadata,
    },
    twitter: {
      card: "summary_large_image",
      title: tituloCompartir,
      description: descripcionLimpia,
      images: [imagenFinal],
      creator: "@neuraidev",
      site: "@neuraidev",
    },
    other: {
      "product:price:amount": precio.toString(),
      "product:price:currency": "COP",
      "product:availability": producto.disponible ? "in stock" : "out of stock",
      "product:condition": producto.condicion || "nuevo",
      "product:brand": producto.marca || "neurai.dev",
      "product:category": producto.categoria,
      // Tags específicos para WhatsApp
      "og:image:alt": producto.nombre,
      "og:image:type": "image/jpeg",
    },
  };
}
