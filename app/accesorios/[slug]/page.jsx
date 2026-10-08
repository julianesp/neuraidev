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

  let producto = null;
  try {
    // Buscar producto en Cloudflare D1
    const productos = await obtenerProductos();
    producto = findProductBySlug(productos || [], slug);
  } catch (err) {
    console.error("Error in GenericProductPage:", err);
  }

  if (!producto) {
    notFound();
  }

  // Redirigir a la URL de la categoría específica para evitar URLs duplicadas.
  // redirect() lanza una excepción interna, por eso va fuera del try/catch.
  redirect(`/accesorios/${producto.categoria}/${slug}`);
}
