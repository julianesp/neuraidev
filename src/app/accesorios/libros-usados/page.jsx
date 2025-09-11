import React from "react";
import AccesoriosContainer from "../../../containers/AccesoriosContainer/page";
import { generateCategoryMetadata } from "../../../utils/categoryMetadata";

export const metadata = generateCategoryMetadata("libros-usados");

export default function LibrosUsadosPage() {
  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <AccesoriosContainer apiUrl="/api/productos?categoria=libros&condicion=usado" />
      </div>
    </main>
  );
}
