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

    const imagen =
      producto.imagen_principal ||
      "https://neurai.dev/favicon-96x96.png";

    const url = `https://neurai.dev/accesorios/${producto.categoria}/${slug}`;

    return {
      title: SITE_TITLE,
      description: descripcion,
      openGraph: {
        title: SITE_TITLE,
        description: descripcion,
        type: "website",
        siteName: "neurai.dev",
        url,
        images: [{ url: imagen, width: 800, height: 600, alt: producto.nombre }],
      },
      twitter: {
        card: "summary_large_image",
        title: SITE_TITLE,
        description: descripcion,
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
