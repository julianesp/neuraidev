"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Smartphone,
  Monitor,
  Heart,
  BookOpen,
  Bike,
  Wrench,
  Package,
  Star,
  Store,
} from "lucide-react";

const categorias = [
  {
    id: "celulares",
    nombre: "Accesorios para Celulares",
    descripcion: "Cables, cargadores, fundas y más para tu smartphone",
    ruta: "/accesorios/celulares",
    icono: <Smartphone className="w-8 h-8" />,
    color: "bg-blue-500",
  },
  {
    id: "computadoras",
    nombre: "Accesorios para Computadoras",
    descripcion: "Teclados, mouse, cables y componentes para PC",
    ruta: "/accesorios/computadoras",
    icono: <Monitor className="w-8 h-8" />,
    color: "bg-green-500",
  },
  {
    id: "damas",
    nombre: "Accesorios para Damas",
    descripcion: "Productos de belleza y cuidado personal",
    ruta: "/accesorios/damas",
    icono: <Heart className="w-8 h-8" />,
    color: "bg-pink-500",
  },
  {
    id: "libros-nuevos",
    nombre: "Libros Nuevos",
    descripcion: "Colección de libros nuevos de diferentes géneros",
    ruta: "/accesorios/libros-nuevos",
    icono: <BookOpen className="w-8 h-8" />,
    color: "bg-orange-500",
  },
  {
    id: "libros-usados",
    nombre: "Libros Usados",
    descripcion: "Libros de segunda mano en buen estado",
    ruta: "/accesorios/libros-usados",
    icono: <BookOpen className="w-8 h-8" />,
    color: "bg-purple-500",
  },
  {
    id: "libros-usados",
    nombre: "Libros Usados",
    descripcion: "Libros de segunda mano en excelente estado",
    ruta: "/accesorios/libros-usados",
    icono: <BookOpen className="w-8 h-8" />,
    color: "bg-amber-600",
  },
  {
    id: "bicicletas",
    nombre: "Accesorios para Bicicletas",
    descripcion: "Repuestos y accesorios para ciclistas",
    ruta: "/accesorios/bicicletas",
    icono: <Bike className="w-8 h-8" />,
    color: "bg-red-500",
  },
  {
    id: "generales",
    nombre: "Accesorios Generales",
    descripcion: "Variedad de productos para diferentes necesidades",
    ruta: "/accesorios/generales",
    icono: <Package className="w-8 h-8" />,
    color: "bg-gray-500",
  },
  {
    id: "destacados",
    nombre: "Productos Destacados",
    descripcion: "Los mejores productos seleccionados especialmente",
    ruta: "/accesorios/destacados",
    icono: <Star className="w-8 h-8" />,
    color: "bg-yellow-500",
  },
];

export default function NeuraIStorePage() {
  return (
    <main className="min-h-screen py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-full">
              <Store className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🏪 NeuraIStore
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-primary dark:text-secondary mb-4">
            Accesorios y Tecnología
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tu tienda especializada en accesorios tecnológicos, libros y
            productos de calidad. Explora todas nuestras categorías y encuentra
            exactamente lo que necesitas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorias.map((categoria) => (
            <Link
              key={categoria.id}
              href={categoria.ruta}
              className="group bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`${categoria.color} p-4 rounded-full text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  {categoria.icono}
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {categoria.nombre}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {categoria.descripcion}
                </p>

                <div className="mt-4 inline-flex items-center text-primary font-medium text-sm group-hover:underline">
                  Ver productos
                  <svg
                    className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"
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
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Contáctanos y te ayudaremos a encontrar el accesorio perfecto para
            ti. También ofrecemos servicios técnicos especializados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://wa.me/573174503604"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
              </svg>
              Contactar por WhatsApp
            </Link>
            <Link
              href="/servicios/tecnicos"
              className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Wrench className="w-5 h-5 mr-2" />
              Servicios Técnicos
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            📍 Información de la Tienda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-500 p-3 rounded-full mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Horarios
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Lunes a Sábado
                <br />
                8:00 AM - 6:00 PM
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-500 p-3 rounded-full mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Contacto
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                +57 317 450 3604
                <br />
                neurai.dev
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-500 p-3 rounded-full mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Modalidad
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Atención Virtual
                <br />y Domicilios
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
