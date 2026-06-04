import { getSupabaseServerClient } from "@/lib/db";
import { findProductBySlug } from "./slugify";

const SITE_TITLE = "neurai.dev - Productos y servicios tecnologicos";

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

    const descripcion =
      (producto.descripcion || "")
        .replace(/<[^>]*>/g, "")
        .slice(0, 160) ||
      `${producto.nombre} - ${producto.categoria}`;

    const rawImagen =
      producto.imagen_principal ||
      "https://neurai.dev/favicon-96x96.png";

    const imagen = rawImagen
      .replace(
        "https://pub-c0883d14d3e84a69bf84546fa108aa0b.r2.dev",
        "https://images.neurai.dev"
      );

    const url = `https://neurai.dev/accesorios/${producto.categoria}/${slug}`;

    const productoTitle = `${producto.nombre} | neurai.dev`;
    const metaDescription = descripcion
      ? `${descripcion.slice(0, 140)} | Compra en neurai.dev ✓ Envíos a todo Colombia`
      : `Compra ${producto.nombre} en neurai.dev. Envíos a todo Colombia.`;

    return {
      title: productoTitle,
      description: metaDescription,
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
