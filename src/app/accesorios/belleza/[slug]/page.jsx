import React from "react";
import { notFound } from "next/navigation";
import AccesoriosContainer from "../../../../containers/AccesoriosContainer/page";
import { loadProductBySlug } from "../../../../utils/loadCategoryProducts";
// import { generateProductMetadata } from "../../../../utils/productMetadata";

// Generar metadata dinámica para SEO
// export async function generateMetadata({ params }) {
//   const { slug } = await params;
//   return generateProductMetadata(slug, 'belleza');
// }

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export default async function BellezaProductPage({ params }) {
  const { slug } = await params;

  const { producto, otrosProductos } = await loadProductBySlug('belleza', slug);

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
