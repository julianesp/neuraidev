import React from "react";
// import AccesoriosContainer from "@/containers/AccesoriosContainer/page";
import AccesoriosContainer from "../../../containers/AccesoriosContainer/page";
import { generateCategoryMetadata } from "../../../utils/categoryMetadata";

export const metadata = generateCategoryMetadata('celulares');

// Este componente será la página que muestra todos los accesorios de celulares
export default function AccesoriosCelularesPage() {
  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <AccesoriosContainer apiUrl="/api/productos?categoria=celulares" />
      </div>
    </main>
  );
}
