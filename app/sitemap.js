import { d1Select } from "@/lib/db-d1";

export default async function sitemap() {
  const baseUrl = "https://neurai.dev";
  const currentDate = new Date().toISOString();

  const staticPages = [
    { url: baseUrl, lastModified: currentDate, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/accesorios`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/accesorios/destacados`, lastModified: currentDate, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/accesorios/nuevos`, lastModified: currentDate, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/accesorios/celulares`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/accesorios/computadoras`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/accesorios/damas`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/accesorios/belleza`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/accesorios/libros-nuevos`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/accesorios/libros-usados`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/accesorios/generales`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/ofertas`, lastModified: currentDate, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/servicios`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/servicios/tecnicos`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/servicios/tecnico-sistemas`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/servicios/desarrollador-software`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/servicios/contable`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/servicios/transporte`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/blog`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/blog/como-elegir-celular-2025`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/blog/mantenimiento-computador-guia-completa`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/blog/ssd-vs-hdd-cual-elegir`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/blog/ram-ddr4-vs-ddr5`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/blog/desarrollo-web-pequenos-negocios`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/noticias`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/sobre-nosotros`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/clientes`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.65 },
    { url: `${baseUrl}/preguntas-frecuentes`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/politicas`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/politica-devoluciones`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/politica-privacidad`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terminos-condiciones`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/politica-cookies`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const productos = await d1Select(
      'SELECT id, sku, nombre, categoria, updated_at, created_at, destacado FROM products WHERE disponible = 1 ORDER BY created_at DESC'
    );

    const productUrls = productos.map((producto) => {
      const slug = generateSlug(producto.nombre || producto.sku || producto.id);
      return {
        url: `${baseUrl}/accesorios/${producto.categoria}/${slug}`,
        lastModified: producto.updated_at || producto.created_at || currentDate,
        changeFrequency: "weekly",
        priority: producto.destacado ? 0.85 : 0.8,
      };
    });

    return [...staticPages, ...productUrls];
  } catch (error) {
    console.error("[sitemap] Error generando URLs de productos:", error);
    return staticPages;
  }
}

function generateSlug(text) {
  if (!text) return "producto";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
