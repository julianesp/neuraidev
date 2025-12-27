import { notFound } from "next/navigation";
import AccesoriosContainer from "@/containers/AccesoriosContainer/page";
import { loadProductBySlug } from "@/utils/loadCategoryProducts";
import { generateProductMetadata } from "@/utils/productMetadata";

// Forzar renderizado estático en build time para mejor SEO
export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 3600; // Revalidar cada hora

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return await generateProductMetadata(slug, "celulares");
}

export default async function CelularesProductPage({ params }) {
  const { slug } = await params;
  const { producto, otrosProductos } = await loadProductBySlug(
    "celulares",
    slug,
  );

  if (!producto) {
    notFound();
  }

  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <AccesoriosContainer
          accesorio={producto}
          otrosAccesorios={otrosProductos}
        />
      </div>
    </main>
  );
}
