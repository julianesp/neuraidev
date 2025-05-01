// "use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, ShoppingCart } from "lucide-react";
import ProductDetail from "./ProductDetail";

export async function generateStaticParams() {
  try {
    // Definir categorías principales que sabemos que existen
    const mainCategories = [
      { id: "celulares" },
      { id: "computadores" },
      { id: "damas" },
      { id: "libros-nuevos" },
      { id: "libros-usados" },
    ];

    // Combinar todas las rutas y eliminar duplicados
    const allParams = [...mainCategories];

    // Eliminar duplicados basados en id
    const uniqueParams = allParams.filter(
      (param, index, self) =>
        index === self.findIndex((p) => p.id === param.id),
    );

    console.log("Rutas estáticas generadas:", uniqueParams.length);
    return uniqueParams;
  } catch (error) {
    console.error("Error al generar parámetros estáticos:", error);
    // Devolver al menos las categorías principales en caso de error
    return [
      { id: "celulares" },
      { id: "computadores" },
      { id: "damas" },
      { id: "libros-nuevos" },
      { id: "libros-usados" },
    ];
  }
}
// Componente principal que renderiza el componente clientes
export default function Page({ params }) {
  return <ProductDetail params={params} />;
}
