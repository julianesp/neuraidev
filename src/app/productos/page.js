// Server component for the main productos page
import React from 'react';
import Link from 'next/link';

// Define categories with their display names and descriptions
const categories = [
  {
    id: "celulares",
    name: "Accesorios para Celulares",
    description: "Encuentra los mejores accesorios para tu dispositivo móvil"
  },
  {
    id: "computadores",
    name: "Accesorios para Computadores",
    description: "Todo lo que necesitas para mejorar tu experiencia informática"
  },
  {
    id: "damas",
    name: "Accesorios para Damas",
    description: "Complementos elegantes para toda ocasión"
  },
  {
    id: "libros-nuevos",
    name: "Libros Nuevos",
    description: "Las últimas publicaciones disponibles"
  },
  {
    id: "libros-usados",
    name: "Libros Usados",
    description: "Literatura de calidad a precios accesibles"
  }
];

export default function ProductosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Nuestros Productos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id}
            href={`/productos/${category.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <div className="mt-4 text-blue-600 font-medium">
                Ver productos →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

