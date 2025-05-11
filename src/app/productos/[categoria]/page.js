// No "use client" directive - This is a server component
import React from 'react';
import ClientCategoryPage from './ClientCategoryPage';

/**
 * Server component for rendering category pages
 * This handles URL paths like /productos/celulares/
 */
export default async function CategoryPage({ params }) {
  // No param destructuring in server component to avoid sync access issues
  
  // In a real app, you could fetch data here if needed
  // const products = await fetchProductsByCategory(params.categoria);
  
  // Render the client component and pass the entire params object
  return <ClientCategoryPage params={params} />;
}

/**
 * Generate static paths for main categories
 * This helps Next.js optimize these common routes
 */
export function generateStaticParams() {
  // Define main categories
  return [
    { categoria: "celulares" },
    { categoria: "computadores" },
    { categoria: "damas" },
    { categoria: "libros-nuevos" },
    { categoria: "libros-usados" },
  ];
}
