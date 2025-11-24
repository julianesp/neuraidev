"use client";

import Link from "next/link";

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Noticias
        </h1>

        <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-8 mb-8">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
            La sección de noticias se ha movido a nuestro blog.
          </p>
          <Link
            href="/Blog"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
          >
            Ir al Blog →
          </Link>
        </div>

        <div className="text-gray-600 dark:text-gray-400">
          <p>Encuentra artículos sobre tecnología, desarrollo web y más en nuestro blog.</p>
        </div>
      </div>
    </div>
  );
}
