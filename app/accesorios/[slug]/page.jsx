import { notFound, redirect } from "next/navigation";
import AccesoriosContainer from "@/containers/AccesoriosContainer/page";
import { findProductBySlug } from "@/utils/slugify";
import { generateProductMetadata } from "@/utils/productMetadata";
import { getSupabaseServerClient } from "@/lib/db";

async function obtenerProductos() {
  const db = getSupabaseServerClient();
  const { data } = await db.from('products').select('*');
  return data || [];
}

// Forzar renderizado dinámico para esta ruta
export const dynamic = "force-dynamic";

// Generar metadatos dinámicos para SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return await generateProductMetadata(slug, null);
}

export default async function GenericProductPage({ params }) {
  const { slug } = await params;

  try {
    // Buscar producto en Cloudflare D1
    const productos = await obtenerProductos();

    const producto = findProductBySlug(productos || [], slug);

    if (!producto) {
      notFound();
    }

    // Si el producto se encuentra, redirigir a la categoría específica
    // Esto resuelve el problema de URLs duplicadas
    const categoriaUrl = `/accesorios/${producto.categoria}/${slug}`;
    redirect(categoriaUrl);
  } catch (err) {
    console.error("Error in GenericProductPage:", err);
    notFound();
  }
}
