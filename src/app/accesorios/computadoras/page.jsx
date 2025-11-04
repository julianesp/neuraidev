import React from "react";
import AccesoriosContainer from "../../../containers/AccesoriosContainer/page";
import { loadCategoryProducts } from "../../../utils/loadCategoryProducts";
import { generateCategoryMetadata } from "../../../utils/categoryMetadata";

export const metadata = generateCategoryMetadata('computadoras');

// Forzar renderizado dinámico para evitar errores de prerenderizado
export const dynamic = "force-dynamic";

export default async function ComputadorasPage() {
  const productos = await loadCategoryProducts("computadoras");
  const accesorioInicial = productos.length > 0 ? productos[0] : null;
  const otrosAccesorios = productos.slice(1);

  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <AccesoriosContainer
          accesorio={accesorioInicial}
          otrosAccesorios={otrosAccesorios}
        />
      </div>
    </main>
  );
}
