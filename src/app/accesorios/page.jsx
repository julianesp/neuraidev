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
    descripción: "Variedad de productos para diferentes necesidades",
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

export default function AccesoriosPage() {
  return (
    <main className="min-h-screen py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Todos los Accesorios
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explora nuestra amplia selección de accesorios organizados por
            categorías. Encuentra exactamente lo que buscas para tus
            dispositivos y necesidades.
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
            ti
          </p>
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
        </div>
      </div>
    </main>
  );
}
