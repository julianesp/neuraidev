import { notFound } from "next/navigation";
import AccesoriosContainer from "@/containers/AccesoriosContainer/page";
import { loadProductBySlug } from "@/utils/loadCategoryProducts";
import { generateProductMetadata } from "@/utils/productMetadata";

// Forzar renderizado dinámico pero cacheable
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cachear por 1 hora

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return await generateProductMetadata(slug, "damas");
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const { producto, otrosProductos } = await loadProductBySlug(
    "damas",
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
