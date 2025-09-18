import React from "react";
import AccesoriosContainer from "../../../containers/AccesoriosContainer/page";
// import { generateCategoryMetadata } from "../../../utils/categoryMetadata";

// export const metadata = generateCategoryMetadata('generales');

// Forzar renderizado dinámico para evitar errores de prerenderizado
export const dynamic = 'force-dynamic';

export default function GeneralesPage() {
  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <AccesoriosContainer apiUrl="/api/productos?categoria=generales" />
      </div>
    </main>
  );
}
