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
  return await generateProductMetadata(slug, "generales");
}

export default async function GeneralesProductPage({ params }) {
  const { slug } = await params;
  let producto = null;
  let otrosProductos = [];
  try {
    const result = await loadProductBySlug("generales", slug);
    producto = result.producto;
    otrosProductos = result.otrosProductos;
  } catch (e) {
    console.error("Error loading product in server page:", e);
  }

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
