/**
 * Script para generar sitemap.xml dinámicamente desde Supabase
 *
 * Uso:
 *   node scripts/generate-sitemap.js
 *
 * Este script:
 * 1. Consulta todos los productos disponibles en Supabase
 * 2. Genera un sitemap.xml completo con páginas estáticas + productos
 * 3. Guarda el archivo en public/sitemap.xml
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'https://neurai.dev';

// Páginas estáticas del sitio
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },

  // Categorías de productos
  { url: '/accesorios', priority: '0.95', changefreq: 'weekly' },
  { url: '/accesorios/destacados', priority: '0.95', changefreq: 'daily' },
  { url: '/accesorios/nuevos', priority: '0.95', changefreq: 'daily' },
  { url: '/accesorios/celulares', priority: '0.95', changefreq: 'weekly' },
  { url: '/accesorios/computadoras', priority: '0.95', changefreq: 'weekly' },
  { url: '/accesorios/damas', priority: '0.90', changefreq: 'weekly' },
  { url: '/accesorios/belleza', priority: '0.90', changefreq: 'weekly' },
  { url: '/accesorios/libros-nuevos', priority: '0.85', changefreq: 'weekly' },
  { url: '/accesorios/libros-usados', priority: '0.85', changefreq: 'weekly' },
  { url: '/accesorios/generales', priority: '0.80', changefreq: 'weekly' },
  { url: '/ofertas', priority: '0.95', changefreq: 'daily' },

  // Servicios
  { url: '/servicios', priority: '0.90', changefreq: 'monthly' },
  { url: '/servicios/tecnicos', priority: '0.85', changefreq: 'monthly' },
  { url: '/servicios/tecnico-sistemas', priority: '0.85', changefreq: 'monthly' },
  { url: '/servicios/desarrollador-software', priority: '0.85', changefreq: 'monthly' },
  { url: '/servicios/contable', priority: '0.85', changefreq: 'monthly' },
  { url: '/servicios/transporte', priority: '0.85', changefreq: 'monthly' },

  // Blog
  { url: '/blog', priority: '0.85', changefreq: 'weekly' },
  { url: '/blog/como-elegir-celular-2025', priority: '0.75', changefreq: 'monthly' },
  { url: '/blog/mantenimiento-computador-guia-completa', priority: '0.75', changefreq: 'monthly' },
  { url: '/blog/ssd-vs-hdd-cual-elegir', priority: '0.75', changefreq: 'monthly' },
  { url: '/blog/ram-ddr4-vs-ddr5', priority: '0.75', changefreq: 'monthly' },
  { url: '/blog/desarrollo-web-pequenos-negocios', priority: '0.75', changefreq: 'monthly' },

  // Noticias
  { url: '/noticias', priority: '0.70', changefreq: 'weekly' },

  // Páginas institucionales
  { url: '/sobre-nosotros', priority: '0.70', changefreq: 'monthly' },
  { url: '/clientes', priority: '0.65', changefreq: 'monthly' },

  // Ayuda y soporte
  { url: '/preguntas-frecuentes', priority: '0.60', changefreq: 'monthly' },
  { url: '/politicas', priority: '0.40', changefreq: 'yearly' },
  { url: '/politica-devoluciones', priority: '0.50', changefreq: 'yearly' },

  // Páginas legales
  { url: '/politica-privacidad', priority: '0.30', changefreq: 'yearly' },
  { url: '/terminos-condiciones', priority: '0.30', changefreq: 'yearly' },
  { url: '/politica-cookies', priority: '0.30', changefreq: 'yearly' },
];

/**
 * Genera un slug SEO-friendly desde un texto
 */
function generateSlug(text) {
  if (!text) return 'producto';

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Obtiene productos desde Supabase
 */
async function getProducts() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Credenciales de Supabase no encontradas. Generando sitemap solo con páginas estáticas.');
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: productos, error } = await supabase
      .from('products')
      .select('id, sku, nombre, categoria, updated_at, created_at, disponible, destacado')
      .eq('disponible', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo productos:', error);
      return [];
    }

    console.log(`✅ ${productos?.length || 0} productos obtenidos desde Supabase`);
    return productos || [];
  } catch (error) {
    console.error('❌ Error fatal:', error);
    return [];
  }
}

/**
 * Genera el XML del sitemap
 */
function generateSitemapXML(pages) {
  const currentDate = new Date().toISOString();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n';

  xml += '  <!-- ========================================== -->\n';
  xml += '  <!-- Generado automáticamente el ' + currentDate + ' -->\n';
  xml += '  <!-- Script: scripts/generate-sitemap.js        -->\n';
  xml += '  <!-- ========================================== -->\n\n';

  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod || currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n\n';
  });

  xml += '</urlset>';

  return xml;
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Generando sitemap.xml...\n');

  // 1. Obtener productos
  const productos = await getProducts();

  // 2. Convertir productos a URLs
  const productPages = productos.map(producto => {
    const slug = generateSlug(producto.nombre || producto.sku || producto.id);
    const priority = producto.destacado ? '0.85' : '0.80';

    return {
      url: `/accesorios/${producto.categoria}/${slug}`,
      lastmod: producto.updated_at || producto.created_at || new Date().toISOString(),
      changefreq: 'weekly',
      priority: priority
    };
  });

  // 3. Combinar páginas estáticas + productos
  const allPages = [...staticPages, ...productPages];

  console.log(`📄 Total de URLs: ${allPages.length}`);
  console.log(`   - Páginas estáticas: ${staticPages.length}`);
  console.log(`   - Productos: ${productPages.length}\n`);

  // 4. Generar XML
  const sitemapXML = generateSitemapXML(allPages);

  // 5. Guardar archivo
  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemapXML, 'utf8');

  console.log(`✅ Sitemap generado exitosamente en: ${outputPath}`);
  console.log(`\n📍 URL: ${BASE_URL}/sitemap.xml`);
  console.log('\n💡 Próximos pasos:');
  console.log('   1. Revisar el archivo public/sitemap.xml');
  console.log('   2. Hacer commit y push a producción');
  console.log('   3. Verificar en: https://neurai.dev/sitemap.xml');
  console.log('   4. Enviar a Google Search Console\n');
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
