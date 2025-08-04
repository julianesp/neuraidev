"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Store, ShoppingBag, Star, ArrowRight } from "lucide-react";

const categorias = [
  {
    id: "electrodomesticos",
    nombre: "Electrodomésticos",
    descripcion: "Equipos para el hogar y la cocina",
    icono: <Package className="w-8 h-8" />,
    color: "bg-blue-500",
    proximamente: true
  },
  {
    id: "hogar-decoracion",
    nombre: "Hogar y Decoración",
    descripcion: "Artículos para decorar y organizar tu hogar",
    icono: <Store className="w-8 h-8" />,
    color: "bg-green-500",
    proximamente: true
  },
  {
    id: "moda-accesorios",
    nombre: "Moda y Accesorios",
    descripcion: "Ropa, calzado y accesorios de moda",
    icono: <ShoppingBag className="w-8 h-8" />,
    color: "bg-pink-500",
    proximamente: true
  },
  {
    id: "deportes-fitness",
    nombre: "Deportes y Fitness",
    descripcion: "Equipos y accesorios deportivos",
    icono: <Star className="w-8 h-8" />,
    color: "bg-orange-500",
    proximamente: true
  }
];

export default function ProductosPage() {
  return (
    <main className="min-h-screen py-14">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Productos Generales
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Próximamente tendremos una amplia selección de productos para satisfacer todas tus necesidades.
            Mientras tanto, explora nuestros accesorios disponibles.
          </p>
        </div>

        {/* Categorías próximamente */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              className="group bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-xl p-6 shadow-lg border border-white/20 relative overflow-hidden"
            >
              {/* Etiqueta de "Próximamente" */}
              <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Próximamente
              </div>
              
              <div className="flex flex-col items-center text-center opacity-75">
                <div className={`${categoria.color} p-4 rounded-full text-white mb-4 opacity-60`}>
                  {categoria.icono}
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {categoria.nombre}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {categoria.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de accesorios disponibles */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-2xl p-8 mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              ¡Mientras tanto, explora nuestros accesorios!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Tenemos una amplia variedad de accesorios disponibles para celulares, computadoras, 
              bicicletas, libros y mucho más.
            </p>
            <Link
              href="/accesorios"
              className="inline-flex items-center bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors group"
            >
              Ver todos los accesorios
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Sección de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ¿Qué encontrarás? */}
          <div className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Qué encontrarás próximamente?
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span>Electrodomésticos para el hogar y la cocina</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span>Artículos de decoración y organización</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span>Ropa, calzado y accesorios de moda</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span>Equipos deportivos y de fitness</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span>Y mucho más...</span>
              </li>
            </ul>
          </div>

          {/* Suscríbete para recibir noticias */}
          <div className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ¡Mantente informado!
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Contáctanos para recibir actualizaciones sobre nuevos productos y ofertas especiales.
            </p>
            <Link
              href="https://wa.me/573174503604?text=Hola,%20me%20gustaría%20recibir%20información%20sobre%20nuevos%20productos%20en%20NeuraIdev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors w-full justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
              </svg>
              Contáctanos por WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}