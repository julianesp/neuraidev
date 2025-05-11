// This is a server component for the productos route layout
import React from 'react';
import Link from 'next/link';

// Metadata for all products pages
export const metadata = {
  title: 'Productos | NeuraiDev',
  description: 'Explora nuestra selección de accesorios de alta calidad para celulares, computadores y más.',
};

/**
 * Breadcrumb component for product navigation
 */
function Breadcrumbs({ categoria, productId }) {
  return (
    <nav className="bg-gray-100 px-4 py-2 rounded-md mb-6 text-sm">
      <ol className="flex flex-wrap items-center">
        <li className="flex items-center">
          <Link href="/" className="text-blue-600 hover:underline">
            Inicio
          </Link>
          <span className="mx-2 text-gray-500">/</span>
        </li>
        <li className="flex items-center">
          <Link href="/productos" className="text-blue-600 hover:underline">
            Productos
          </Link>
          {categoria && (
            <>
              <span className="mx-2 text-gray-500">/</span>
              {!productId ? (
                <span className="font-medium text-gray-800">
                  {getCategoryName(categoria)}
                </span>
              ) : (
                <Link 
                  href={`/productos/${categoria}`} 
                  className="text-blue-600 hover:underline"
                >
                  {getCategoryName(categoria)}
                </Link>
              )}
            </>
          )}
          {productId && (
            <>
              <span className="mx-2 text-gray-500">/</span>
              <span className="font-medium text-gray-800">
                {productId}
              </span>
            </>
          )}
        </li>
      </ol>
    </nav>
  );
}

// Helper function to get readable category names
function getCategoryName(categoryId) {
  const categoryMap = {
    "celulares": "Accesorios para Celulares",
    "computadores": "Accesorios para Computadores",
    "damas": "Accesorios para Damas",
    "libros-nuevos": "Libros Nuevos",
    "libros-usados": "Libros Usados"
  };
  
  return categoryMap[categoryId] || categoryId;
}

/**
 * Layout component for all product pages
 */
export default function ProductsLayout({ children, params }) {
  // Extract categoria and productId from URL (if present)
  const { categoria, productId } = params || {};
  
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs categoria={categoria} productId={productId} />
        {children}
      </div>
    </div>
  );
}

