'use client';

import Link from 'next/link';
import CategoryImageCarousel from './CategoryImageCarousel';

/**
 * Tarjeta de categoría que muestra un carrusel de imágenes de productos
 */
export default function CategoryCard({ categoria }) {
  return (
    <Link
      href={categoria.ruta}
      className="group bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20 flex flex-col h-full min-h-[400px]"
    >
      {/* Carrusel de imágenes */}
      <div className="relative">
        <CategoryImageCarousel
          categoryId={categoria.id}
          fallbackIcon={
            <div
              className={`${categoria.color} p-4 rounded-full text-white`}
            >
              {categoria.icono}
            </div>
          }
        />
      </div>

      {/* Información de la categoría */}
      <div className="p-6 flex flex-col items-center text-center flex-grow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
          {categoria.nombre}
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
          {categoria.descripcion}
        </p>

        <div className="mt-auto inline-flex items-center text-primary font-medium text-sm group-hover:underline">
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
  );
}
