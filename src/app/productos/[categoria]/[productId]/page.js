import React from "react";
import ProductDetail from "./ProductDetail";

/**
 * Generate dynamic metadata based on the product details
 * @param {Object} props - Component props
 * @param {Object} props.params - URL parameters from dynamic route segments
 * @param {string} props.params.categoria - Product category ID
 * @param {string} props.params.productId - Product unique identifier
 * @returns {Promise<Object>} The metadata object with title, description and Open Graph data
 */
export async function generateMetadata(props) {
  const params = await props.params;
  const categoria = params?.categoria;
  const productId = params?.productId;

  // In a real app, you would fetch product data here
  // For simplicity, we're using mapping patterns
  const categoryNames = {
    celulares: "Accesorios para Celulares",
    computadores: "Accesorios para Computadores",
    damas: "Accesorios para Damas",
    "libros-nuevos": "Libros Nuevos",
    "libros-usados": "Libros Usados",
  };

  // Product name mapping for better titles
  const productNames = {
    "celular-1": "Protector Premium de Celular",
    "celular-2": "Cargador Rápido USB-C",
    "comp-1": "Teclado Genius Avanzado",
    "comp-2": "Mouse Inalámbrico Pro",
    "comp-3": "Pad Mouse Ergonómico",
    "damas-1": "Bolso Elegante",
    "damas-2": "Cartera de Mano",
    "libro-nuevo-1": "Bestseller Internacional",
    "libro-usado-1": "Clásico Literario",
  };

  const categoryName = categoryNames[categoria] || categoria;
  const productName = productNames[productId] || productId;

  return {
    title: `${productName} | ${categoryName} | NeuraiDev`,
    description: `Detalles y especificaciones de ${productName} en la categoría ${categoryName}.`,
    openGraph: {
      title: `${productName} | ${categoryName}`,
      description: `Especificaciones completas y precios de ${productName} en la categoría ${categoryName}.`,
      type: "website",
    },
  };
}

/**
 * Product page component that wraps the ProductDetail component
 * @param {Object} props - Component props
 * @param {Object} props.params - URL parameters from dynamic route segments
 * @param {string} props.params.categoria - Product category ID used for categorization
 * @param {string} props.params.productId - Unique product identifier for retrieving product details
 * @returns {JSX.Element} The rendered product page component with dynamic product details
 */
export default function ProductPage({ params }) {
  return <ProductDetail params={params} />;
}
