import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AccesoriosContainer from "@/containers/AccesoriosContainer/page";
import { findProductBySlug } from "@/utils/slugify";

// Cliente de Supabase para server-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// Forzar renderizado dinámico para esta ruta
export const dynamic = "force-dynamic";

// Generar metadatos dinámicos para SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;

  // Temporalmente deshabilitado para debugging
  return {
    title: `Producto | neurai.dev`,
    description: "Descubre nuestros productos en neurai.dev",
  };
}

export default async function GenericProductPage({ params }) {
  const { slug } = await params;

  try {
    // Buscar producto en Supabase
    const { data: productos, error } = await supabase
      .from("products")
      .select("*")
      .eq("disponible", true);

    if (error) {
      console.error("Error fetching products:", error);
      notFound();
    }

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
