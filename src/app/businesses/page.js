// /businesses/page.js - Página principal que muestra todos los negocios
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Lista de todos los negocios disponibles
const businessList = [
  {
    id: "peluqueria-bella",
    name: "Peluquería Bella",
    type: "Peluquería",
    description: "Cortes modernos y tratamientos de belleza",
    image: "/images/peluqueria-bella.jpg",
    color: "from-pink-500 to-purple-600",
  },
  {
    id: "tienda-tech",
    name: "TechStore Pro",
    type: "Tecnología",
    description: "Los mejores gadgets y accesorios tecnológicos",
    image: "/images/tech-store.jpg",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "boutique-moda",
    name: "Boutique Elegance",
    type: "Ropa y Moda",
    description: "Moda exclusiva para toda ocasión",
    image: "/images/boutique-moda.jpg",
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "accesorios-cell",
    name: "CellMania",
    type: "Accesorios Móviles",
    description: "Todo para tu celular en un solo lugar",
    image: "/images/cell-accessories.jpg",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "supermercado-local",
    name: "Super Familiar",
    type: "Supermercado",
    description: "Productos frescos para toda la familia",
    image: "/images/supermercado.jpg",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "restaurante-sabor",
    name: "Restaurante Sabor",
    type: "Restaurante",
    description: "Deliciosa comida casera y platos especiales",
    image: "/images/restaurante.jpg",
    color: "from-yellow-500 to-orange-600",
  },
];

export default function BusinessesHomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-blue-300 rounded-full blur-lg animate-bounce delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-purple-300 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            🏪 Directorio de Negocios
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Descubre los mejores negocios locales. Cada uno con su propia
            personalidad y especialidades únicas.
          </p>
        </div>
      </div>

      {/* Business Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businessList.map((business, index) => (
            <Link key={business.id} href={`/businesses/${business.id}`}>
              <div
                className="group cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl">
                  {/* Business Image */}
                  <div className="relative overflow-hidden rounded-xl mb-6 h-48 bg-gray-200">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${business.color} opacity-80`}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl text-white">
                        {business.type === "Peluquería" && "💇‍♀️"}
                        {business.type === "Tecnología" && "📱"}
                        {business.type === "Ropa y Moda" && "👗"}
                        {business.type === "Accesorios Móviles" && "🔌"}
                        {business.type === "Supermercado" && "🛒"}
                        {business.type === "Restaurante" && "🍽️"}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Business Info */}
                  <div className="space-y-3">
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${business.color}`}
                    >
                      {business.type}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {business.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {business.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6">
                    <div
                      className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${business.color} text-white rounded-xl font-medium transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl`}
                    >
                      Ver Tienda
                      <svg
                        className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Quieres agregar tu negocio?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Únete a nuestra plataforma y llega a más clientes
          </p>
          <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg">
            Registrar mi Negocio
          </button>
        </div>
      </div>
    </div>
  );
}
