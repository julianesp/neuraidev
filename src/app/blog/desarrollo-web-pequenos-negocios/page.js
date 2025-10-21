import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Desarrollo Web para Pequeños Negocios 2025 | Neurai.dev",
  description: "Guía completa: tipos de sitios web, costos, beneficios y cómo elegir la mejor opción para tu negocio en Colombia.",
  keywords: "desarrollo web Colombia, sitio web negocio, tienda online, página web empresa",
};

export default function DesarrolloWebNegocios() {
  return (
    <article className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-blue-600 hover:text-blue-800">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">Blog</Link>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Desarrollo Web para Pequeños Negocios: Guía 2025
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl mb-6">
            Descubre todo lo que necesitas saber sobre crear un sitio web para tu negocio.
          </p>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-lg text-white mt-12">
            <h3 className="text-2xl font-bold mb-4">¿Necesitas un Sitio Web?</h3>
            <p className="mb-6">Contáctanos para una consulta gratuita.</p>
            <Link href="/servicios/tecnicos" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold inline-block">
              Ver Servicios
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
