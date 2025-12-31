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

  try {
    // Buscar producto en Supabase
    const { data: productos, error } = await supabase
      .from("products")
      .select("*")
      .eq("disponible", true);

    if (error) {
      console.error("Error fetching product for metadata:", error);
      return {
        title: "Producto no encontrado | Neurai.dev",
        description: "El producto que buscas no existe o ha sido eliminado.",
      };
    }

    const producto = findProductBySlug(productos || [], slug);

    if (!producto) {
      return {
        title: "Producto no encontrado | Neurai.dev",
        description: "El producto que buscas no existe o ha sido eliminado.",
      };
    }

    const imagenPrincipal =
      producto.imagen_principal ||
      (producto.imagenes && producto.imagenes.length > 0
        ? producto.imagenes[0]
        : null);

    const descripcionLimpia =
      producto.descripcion?.replace(/[^\w\s\-.,áéíóúñü]/gi, "").slice(0, 160) ||
      `${producto.nombre} - ${producto.categoria}`;

    const canonicalUrl = `https://neurai.dev/accesorios/${producto.categoria}/${slug}`;

    return {
      title: `${producto.nombre} | Neurai.dev`,
      description: descripcionLimpia,
      keywords: `${producto.nombre}, ${producto.categoria}, ${producto.marca || "Neurai.dev"}, comprar`,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${producto.nombre} | Neurai.dev`,
        description: descripcionLimpia,
        type: "website",
        siteName: "Neurai.dev",
        locale: "es_ES",
        url: canonicalUrl,
        images: imagenPrincipal
          ? [
              {
                url: imagenPrincipal,
                width: 800,
                height: 600,
                alt: producto.nombre,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${producto.nombre} | Neurai.dev`,
        description: descripcionLimpia,
        images: imagenPrincipal ? [imagenPrincipal] : [],
      },
    };
  } catch (err) {
    console.error("Error generating metadata:", err);
    return {
      title: "Producto | Neurai.dev",
      description: "Explora nuestro catálogo de productos.",
    };
  }
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
