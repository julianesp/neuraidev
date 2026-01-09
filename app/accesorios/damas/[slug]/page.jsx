import { notFound } from "next/navigation";
import AccesoriosContainer from "@/containers/AccesoriosContainer/page";
import ProductSchema from "@/components/ProductSchema";
import { loadProductBySlug } from "@/utils/loadCategoryProducts";
import { generateProductMetadata } from "@/utils/productMetadata";

// Forzar renderizado dinámico
export const dynamic = "force-dynamic";

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = await params;
  // Temporalmente deshabilitado para debugging
  return {
    title: `Producto - damas | neurai.dev`,
    description: "Productos de damas en neurai.dev",
  };
  // return await generateProductMetadata(slug, "damas");
}

export default async function DamasProductPage({ params }) {
  const { slug } = await params;
  const { producto, otrosProductos } = await loadProductBySlug("damas", slug);

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
