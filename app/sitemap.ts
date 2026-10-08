import { MetadataRoute } from "next";
// @ts-ignore - utils en JS sin tipos
import { loadCategoryProducts } from "@/utils/loadCategoryProducts";
// @ts-ignore - utils en JS sin tipos
import { generateProductSlug } from "@/utils/slugify";
// @ts-ignore - lib en JS sin tipos
import { d1Select } from "@/lib/db";

const BASE_URL = "https://neurai.dev";

// Categorías de productos con página de listado y detalle
// (cada una debe tener su carpeta en app/accesorios/)
const PRODUCT_CATEGORIES = [
  "celulares",
  "computadoras",
  "belleza",
  "generales",
  "libros-nuevos",
  "libros-usados",
] as const;

// Páginas estáticas públicas (sin admin/dashboard/api/auth).
// No llevan lastModified: una fecha falsa (la del build) hace que Google
// ignore el lastmod de todo el sitemap.
const STATIC_PATHS: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/accesorios", priority: 0.9 },
  { path: "/accesorios/destacados", priority: 0.8 },
  { path: "/servicios", priority: 0.9 },
  { path: "/servicios/tecnico-sistemas", priority: 0.9 },
  { path: "/servicios/desarrollador-software", priority: 0.8 },
  { path: "/blog", priority: 0.7 },
  { path: "/blog/como-elegir-computador-2025", priority: 0.6 },
  { path: "/blog/ssd-vs-hdd-cual-elegir", priority: 0.6 },
  { path: "/blog/ram-ddr4-vs-ddr5", priority: 0.6 },
  { path: "/blog/mantenimiento-computador-guia-completa", priority: 0.6 },
  { path: "/blog/desarrollo-web-pequenos-negocios", priority: 0.6 },
  { path: "/ofertas", priority: 0.7 },
  { path: "/herramientas", priority: 0.5 },
  { path: "/herramientas/presupuesto", priority: 0.5 },
  { path: "/clientes", priority: 0.5 },
  { path: "/colon", priority: 0.5 },
  { path: "/noticias", priority: 0.5 },
  { path: "/sobre-nosotros", priority: 0.6 },
  { path: "/preguntas-frecuentes", priority: 0.6 },
  { path: "/tiendas", priority: 0.5 },
  { path: "/para-tiendas", priority: 0.5 },
  { path: "/fastfoods", priority: 0.5 },
  { path: "/politica-privacidad", priority: 0.2 },
  { path: "/politica-cookies", priority: 0.2 },
  { path: "/politica-devoluciones", priority: 0.3 },
  { path: "/terminos-condiciones", priority: 0.2 },
  { path: "/politicas", priority: 0.2 },
];

export const revalidate = 86400; // Regenerar el sitemap una vez al día

function fecha(valor: unknown): Date | undefined {
  if (!valor) return undefined;
  const d = new Date(valor as string);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, priority }) => ({
      url: `${BASE_URL}${path}`,
      priority,
    }),
  );

  // Páginas de detalle de productos (desde Cloudflare D1)
  let productEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const lists = await Promise.all(
      PRODUCT_CATEGORIES.map(async (categoria) => {
        const productos = ((await loadCategoryProducts(categoria)) || []).filter(
          (p: any) => p.disponible,
        );
        return { categoria, productos };
      }),
    );

    for (const { categoria, productos } of lists) {
      // lastmod de la categoría = el producto modificado más recientemente
      const ultima = productos
        .map((p: any) => fecha(p.updatedAt))
        .filter(Boolean)
        .sort((a: any, b: any) => b - a)[0];
      categoryEntries.push({
        url: `${BASE_URL}/accesorios/${categoria}`,
        ...(ultima && { lastModified: ultima }),
        priority: 0.8,
      });

      for (const producto of productos) {
        const slug = generateProductSlug(producto);
        if (!slug) continue;
        const lastModified = fecha(producto.updatedAt);
        productEntries.push({
          url: `${BASE_URL}/accesorios/${categoria}/${slug}`,
          ...(lastModified && { lastModified }),
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error("[sitemap] Error cargando productos:", error);
    categoryEntries = PRODUCT_CATEGORIES.map((categoria) => ({
      url: `${BASE_URL}/accesorios/${categoria}`,
      priority: 0.8,
    }));
  }

  // Artículos del blog guardados en la base de datos
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const data = await d1Select(
      "SELECT slug, updated_at, published_at FROM blog_posts WHERE published = 1",
    );
    const estaticos = new Set(STATIC_PATHS.map(({ path }) => path));
    blogEntries = (data || [])
      .filter((post: any) => post.slug && !estaticos.has(`/blog/${post.slug}`))
      .map((post: any) => {
        const lastModified = fecha(post.updated_at || post.published_at);
        return {
          url: `${BASE_URL}/blog/${post.slug}`,
          ...(lastModified && { lastModified }),
          priority: 0.6,
        };
      });
  } catch (error) {
    console.error("[sitemap] Error cargando blog:", error);
  }

  return [...staticEntries, ...categoryEntries, ...productEntries, ...blogEntries];
}
