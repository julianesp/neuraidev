import React from "react";
import AccesoriosContainer from "../../../containers/AccesoriosContainer/page";
import { generateCategoryMetadata } from "../../../utils/categoryMetadata";

export const metadata = generateCategoryMetadata('gadgets');

export default function GadgetsPage() {
  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <AccesoriosContainer apiUrl="/api/productos?categoria=gadgets" />
      </div>
    </main>
  );
}

