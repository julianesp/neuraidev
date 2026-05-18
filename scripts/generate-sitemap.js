/**
 * Script para generar sitemap.xml dinámicamente desde Cloudflare D1
 *
 * Uso:
 *   node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'https://neurai.dev';

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

async function getProducts() {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
    const token = process.env.CLOUDFLARE_D1_TOKEN;

    if (!accountId || !databaseId || !token) {
      console.warn('⚠️  Credenciales de D1 no encontradas. Generando sitemap solo con páginas estáticas.');
      return [];
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: 'SELECT id, sku, nombre, categoria, updated_at, created_at, disponible, destacado FROM products WHERE disponible = 1 ORDER BY created_at DESC',
          params: [],
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Error obteniendo productos de D1:', data.errors);
      return [];
    }

    const productos = data.result[0]?.results ?? [];
    console.log(`✅ ${productos.length} productos obtenidos desde D1`);
    return productos;
  } catch (error) {
    console.error('❌ Error fatal:', error);
    return [];
  }
}

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

async function main() {
  console.log('🚀 Generando sitemap.xml...\n');

  const productos = await getProducts();

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

  const allPages = [...staticPages, ...productPages];

  console.log(`📄 Total de URLs: ${allPages.length}`);
  console.log(`   - Páginas estáticas: ${staticPages.length}`);
  console.log(`   - Productos: ${productPages.length}\n`);

  const sitemapXML = generateSitemapXML(allPages);

  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemapXML, 'utf8');

  console.log(`✅ Sitemap generado exitosamente en: ${outputPath}`);
  console.log(`\n📍 URL: ${BASE_URL}/sitemap.xml`);
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
