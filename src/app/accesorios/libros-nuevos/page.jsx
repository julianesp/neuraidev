import React from "react";
import AccesoriosContainer from "../../../containers/AccesoriosContainer/page";
// import { generateCategoryMetadata } from "../../../utils/categoryMetadata";

// export const metadata = generateCategoryMetadata("libros-nuevos");

// Forzar renderizado dinámico para evitar errores de prerenderizado
export const dynamic = 'force-dynamic';

export default function LibrosNuevosPage() {
  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <AccesoriosContainer apiUrl="/api/productos?categoria=libros&condicion=nuevo" />
      </div>
    </main>
  );
}
