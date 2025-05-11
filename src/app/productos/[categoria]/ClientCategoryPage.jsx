"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function ClientCategoryPage({ params }) {
  // Destructure categoria from params object
  const { categoria } = params;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        
        // In a real app, you would fetch products by category
        // For now, we'll use static data based on the category
        let productData = [];
        
        switch (categoria) {
          case "celulares":
            productData = [
              {
                id: "celular-1",
                title: "Protector Premium de Celular",
                description: "Protector de alta calidad para tu celular",
                price: 49900,
                images: [
                  "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F1.jpg?alt=media&token=191dc074-94cd-4ac1-89de-62070679a96e"
                ]
              },
              {
                id: "celular-2",
                title: "Cargador Rápido USB-C",
                description: "Cargador rápido para dispositivos modernos",
                price: 59900,
                images: [
                  "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F2.jpg?alt=media&token=dd5ebf3c-578d-4010-a256-650df448dc2b"
                ]
              }
            ];
            break;
          case "computadores":
            productData = [
              {
                id: "comp-1",
                title: "Teclado Genius Avanzado",
                description: "Teclado mecánico de alta precisión",
                price: 129900,
                images: [
                  "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fteclado_genius.jpg?alt=media&token=5a9ecc50-db16-4d9a-b00c-a01de3c506b3"
                ]
              },
              {
                id: "comp-2",
                title: "Mouse Inalámbrico Pro",
                description: "Mouse inalámbrico de precisión para gaming",
                price: 89900,
                images: [
                  "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c"
                ]
              },
              {
                id: "comp-3",
                title: "Pad Mouse Ergonómico",
                description: "Soporte de muñeca para uso prolongado con comodidad",
                price: 39900,
                images: [
                  "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c"
                ]
              }
            ];
            break;
          case "damas":
            productData = [
              {
                id: "damas-1",
                title: "Bolso Elegante",
                description: "Bolso de cuero sintético con múltiples compartimentos",
                price: 89900,
                images: [
                  "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c"
                ]
              },
              {
                id: "damas-2",
                title: "Cartera de Mano",
                description: "Cartera compacta para salidas nocturnas",
                price: 45900,
                images: [
                  "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c"
                ]
              }
            ];
            break;
          case "libros-nuevos":
            productData = [
              {
                id: "libro-nuevo-1",
                title: "Bestseller Internacional",
                description: "La novela más vendida del año",
                price: 59900,
                images: [
                  "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c"
                ]
              }
            ];
            break;
          case "libros-usados":
            productData = [
              {
                id: "libro-usado-1",
                title: "Clásico Literario",
                description: "Edición de colección en buen estado",
                price: 29900,
                images: [
                  "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c"
                ]
              }
            ];
            break;
          default:
            productData = [
              {
                id: "default-1",
                title: "Producto de Ejemplo",
                description: "Descripción del producto de ejemplo",
                price: 29900,
                images: [
                  "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c"
                ]
              }
            ];
        }
        
        setProducts(productData);
        setError(null);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Error al cargar los productos. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
      }
    }
    
    loadProducts();
  }, [categoria]);

  // Format price with Colombian peso format
  const formatPrice = (price) => {
    if (!price && price !== 0) return "$0";
    
    const numericPrice = typeof price === "string" 
      ? parseFloat(price.replace(/[^\d.-]/g, "")) 
      : price;
      
    return `$${numericPrice.toLocaleString("es-CO")}`;
  };

  const getCategoryTitle = () => {
    switch (categoria) {
      case "celulares": return "Accesorios para Celulares";
      case "computadores": return "Accesorios para Computadores";
      case "damas": return "Accesorios para Damas";
      case "libros-nuevos": return "Libros Nuevos";
      case "libros-usados": return "Libros Usados";
      default: return `Categoría: ${categoria}`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-700">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-red-500">{error}</p>
          <p className="mt-4">
            <Link href="/productos" className="text-blue-600 hover:underline">
              Volver a categorías
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{getCategoryTitle()}</h1>
      
      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p>No se encontraron productos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link 
              href={`${pathname}/${product.id}`}
              key={product.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="aspect-square relative bg-gray-50">
                <Image
                  src={Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : product.images || "/placeholder.jpg"}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  style={{ objectFit: "contain" }}
                  className="p-3"
                />
              </div>
              <div className="p-4">
                <h2 className="font-medium text-gray-800 truncate">{product.title}</h2>
                <p className="text-sm text-gray-500 h-10 overflow-hidden">{product.description}</p>
                <p className="mt-2 text-green-600 font-semibold">{formatPrice(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
