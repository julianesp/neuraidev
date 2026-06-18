import { MetadataRoute } from "next";
// @ts-ignore - utils en JS sin tipos
import { loadCategoryProducts } from "@/utils/loadCategoryProducts";
// @ts-ignore - utils en JS sin tipos
import { generateProductSlug } from "@/utils/slugify";

const BASE_URL = "https://neurai.dev";

// Categorías de productos con página de listado y detalle
const PRODUCT_CATEGORIES = [
  "celulares",
  "computadoras",
  "damas",
  "generales",
  "libros-nuevos",
  "libros-usados",
] as const;

// Páginas estáticas públicas (sin admin/dashboard/api/auth)
const STATIC_PATHS = [
  "",
  "/blog",
  "/noticias",
  "/ofertas",
  "/servicios",
  "/sobre-nosotros",
  "/preguntas-frecuentes",
  "/tiendas",
  "/para-tiendas",
  "/politica-privacidad",
  "/politica-cookies",
  "/politica-devoluciones",
  "/terminos-condiciones",
  "/politicas",
];

export const revalidate = 86400; // Regenerar el sitemap una vez al día

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Páginas de listado de cada categoría
  const categoryEntries: MetadataRoute.Sitemap = PRODUCT_CATEGORIES.map(
    (categoria) => ({
      url: `${BASE_URL}/accesorios/${categoria}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }),
  );

  // Páginas de detalle de productos (desde Cloudflare D1)
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const lists = await Promise.all(
      PRODUCT_CATEGORIES.map(async (categoria) => {
        const productos = await loadCategoryProducts(categoria);
        return (productos || [])
          .map((producto: any) => {
            const slug = generateProductSlug(producto);
            if (!slug) return null;
            return {
              url: `${BASE_URL}/accesorios/${categoria}/${slug}`,
              lastModified: producto.updatedAt
                ? new Date(producto.updatedAt)
                : now,
              changeFrequency: "weekly" as const,
              priority: 0.6,
            };
          })
          .filter(Boolean);
      }),
    );
    productEntries = lists.flat() as MetadataRoute.Sitemap;
  } catch (error) {
    console.error("[sitemap] Error cargando productos:", error);
  }

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
