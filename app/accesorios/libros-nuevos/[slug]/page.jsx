import { notFound } from "next/navigation";
import AccesoriosContainer from "@/containers/AccesoriosContainer/page";
import ProductSchema from "@/components/ProductSchema";
import { loadProductBySlug } from "@/utils/loadCategoryProducts";
import { generateStaticProductMetadata } from "@/utils/staticMetadata";

// Forzar renderizado dinámico
export const dynamic = "force-dynamic";

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return generateStaticProductMetadata("libros-nuevos", slug);
}

export default async function LibrosNuevosProductPage({ params }) {
  const { slug } = await params;
  const { producto, otrosProductos } = await loadProductBySlug(
    "libros-nuevos",
    slug,
  );

  if (!producto) {
    notFound();
  }

  return (
    <>
      <ProductSchema producto={producto} />
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <AccesoriosContainer
          accesorio={producto}
          otrosAccesorios={otrosProductos}
        />
      </div>
    </main>
    </>
  );
}
