import { getSupabaseClient } from '../lib/db';

/**
 * Genera el sitemap dinámico para Next.js 13+
 * Next.js detecta automáticamente este archivo y sirve el sitemap en /sitemap.xml
 *
 * Documentación: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap() {
  const baseUrl = 'https://www.neurai.dev';
  const currentDate = new Date().toISOString();

  // Páginas estáticas principales
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // Categorías de productos
    {
      url: `${baseUrl}/accesorios`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/accesorios/destacados`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/accesorios/nuevos`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/accesorios/celulares`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/accesorios/computadoras`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/accesorios/damas`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.90,
    },
    {
      url: `${baseUrl}/accesorios/belleza`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.90,
    },
    {
      url: `${baseUrl}/accesorios/libros-nuevos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/accesorios/libros-usados`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/accesorios/generales`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.80,
    },
    {
      url: `${baseUrl}/ofertas`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    // Servicios
    {
      url: `${baseUrl}/servicios`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.90,
    },
    {
      url: `${baseUrl}/servicios/tecnicos`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/servicios/tecnico-sistemas`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/servicios/desarrollador-software`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/servicios/contable`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/servicios/transporte`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    // Blog
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog/como-elegir-celular-2025`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/blog/mantenimiento-computador-guia-completa`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/blog/ssd-vs-hdd-cual-elegir`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/blog/ram-ddr4-vs-ddr5`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/blog/desarrollo-web-pequenos-negocios`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    // Noticias
    {
      url: `${baseUrl}/noticias`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.70,
    },
    // Páginas institucionales
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${baseUrl}/clientes`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    // Ayuda y soporte
    {
      url: `${baseUrl}/preguntas-frecuentes`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.60,
    },
    {
      url: `${baseUrl}/politicas`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.40,
    },
    {
      url: `${baseUrl}/politica-devoluciones`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.50,
    },
    // Páginas legales
    {
      url: `${baseUrl}/politica-privacidad`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.30,
    },
    {
      url: `${baseUrl}/terminos-condiciones`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.30,
    },
    {
      url: `${baseUrl}/politica-cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.30,
    },
  ];

  try {
    // Obtener productos dinámicamente desde Supabase
    const productPages = await generateProductUrls(baseUrl);

    // Combinar páginas estáticas con productos dinámicos
    return [...staticPages, ...productPages];
  } catch (error) {
    console.error('[sitemap] Error generando sitemap dinámico:', error);
    // Si hay error, devolver solo las páginas estáticas
    return staticPages;
  }
}

/**
 * Genera URLs de productos dinámicamente desde la base de datos
 */
async function generateProductUrls(baseUrl) {
  try {
    const supabase = getSupabaseClient();

    // Obtener todos los productos disponibles
    const { data: productos, error } = await supabase
      .from('products')
      .select('id, sku, nombre, categoria, updated_at, created_at, disponible, destacado')
      .eq('disponible', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[sitemap] Error obteniendo productos de Supabase:', error);
      return [];
    }

    if (!productos || productos.length === 0) {
      console.warn('[sitemap] No se encontraron productos disponibles');
      return [];
    }

    // Generar URLs para cada producto
    const productUrls = productos.map((producto) => {
      // Generar slug desde el nombre del producto
      const slug = generateSlug(producto.nombre || producto.sku || producto.id);

      // Determinar la prioridad basada en si es destacado
      const priority = producto.destacado ? 0.85 : 0.80;

      return {
        url: `${baseUrl}/accesorios/${producto.categoria}/${slug}`,
        lastModified: producto.updated_at || producto.created_at || new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: priority,
      };
    });

    return productUrls;
  } catch (error) {
    console.error('[sitemap] Error fatal generando URLs de productos:', error);
    return [];
  }
}

/**
 * Genera un slug amigable para URLs desde un texto
 */
function generateSlug(text) {
  if (!text) return 'producto';

  return text
    .toString()
    .toLowerCase()
    .trim()
    // Reemplazar caracteres especiales del español
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n')
    // Remover caracteres especiales
    .replace(/[^\w\s-]/g, '')
    // Reemplazar espacios con guiones
    .replace(/\s+/g, '-')
    // Remover guiones múltiples
    .replace(/-+/g, '-')
    // Remover guiones al inicio y final
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
