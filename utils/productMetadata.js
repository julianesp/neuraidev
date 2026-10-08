import { getSupabaseServerClient } from "@/lib/db";
import { findProductBySlug, generateProductSlug } from "./slugify";
import { htmlToPlainText } from "./htmlToText";

const SITE_TITLE = "Productos y servicios tecnológicos";

// Corta en el último espacio antes del límite para no partir palabras
function recortar(texto, max) {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max);
  const ultimoEspacio = corte.lastIndexOf(" ");
  return `${(ultimoEspacio > max * 0.6 ? corte.slice(0, ultimoEspacio) : corte).replace(/[\s,.;:–-]+$/, "")}…`;
}

export async function findProductById(id) {
  const db = getSupabaseServerClient();
  const { data } = await db.from("products").select("*").eq("id", id).single();
  return data || null;
}

export async function generateProductMetadata(slug, categoria) {
  try {
    const db = getSupabaseServerClient();

    let query = db.from("products").select("*").eq("disponible", true);
    if (categoria) query = query.eq("categoria", categoria);
    const { data: productos } = await query;

    const lista = productos || [];
    const producto = findProductBySlug(lista, slug)
      || lista.find((p) => p.id === slug || p.sku === slug);

    if (!producto) {
      return {
        title: SITE_TITLE,
        description: "El producto que buscas no existe o ha sido eliminado.",
      };
    }

    const descripcion = htmlToPlainText(producto.descripcion || "");

    const rawImagen =
      producto.imagen_principal ||
      "https://neurai.dev/favicon-96x96.png";

    const imagenCdn = rawImagen
      .replace(
        "https://pub-c0883d14d3e84a69bf84546fa108aa0b.r2.dev",
        "https://images.neurai.dev"
      );

    // Optimizar la imagen OG vía Next.js Image API para reducir tamaño
    // (WhatsApp/Telegram rechazan imágenes >~500 KB en previsualizaciones)
    const imagen = `https://neurai.dev/_next/image?url=${encodeURIComponent(imagenCdn)}&w=1200&q=75`;

    // URL canónica: siempre el slug generado del producto, aunque se haya
    // entrado por una variante (id, sku o slug antiguo)
    const path = `/accesorios/${producto.categoria}/${generateProductSlug(producto) || slug}`;
    const url = `https://neurai.dev${path}`;

    const productoTitle = `${producto.nombre} | neurai.dev`;
    const metaDescription = descripcion
      ? recortar(descripcion, 155)
      : `Compra ${producto.nombre} en neurai.dev. Envío gratis en el Valle de Sibundoy y envíos a toda Colombia.`;

    return {
      title: producto.nombre,
      description: metaDescription,
      alternates: { canonical: path },
      openGraph: {
        title: productoTitle,
        description: metaDescription,
        type: "website",
        siteName: "neurai.dev",
        url,
        images: [{ url: imagen, width: 1200, height: 630, alt: producto.nombre }],
      },
      twitter: {
        card: "summary_large_image",
        title: productoTitle,
        description: metaDescription,
        images: [imagen],
      },
    };
  } catch (error) {
    console.error("[generateProductMetadata] Error:", error);
    return {
      title: SITE_TITLE,
      description: "Encuentra productos y servicios tecnológicos en neurai.dev",
    };
  }
}
