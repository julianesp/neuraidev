import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts, getCategories } from "@/lib/supabase/blog";

// Forzar revalidación para evitar caché de posts
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Blog de Tecnología | Neurai.dev",
  description: "Artículos, guías y consejos sobre tecnología, computadores, celulares, desarrollo web y más. Mantente actualizado con las últimas tendencias tecnológicas.",
  keywords: "blog tecnología, guías tecnológicas, consejos computadores, tutoriales web, Colombia",
  openGraph: {
    title: "Blog de Tecnología - Neurai.dev",
    description: "Artículos y guías sobre tecnología, computadores y desarrollo web",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Blog() {
  const articles = await getPublishedPosts();
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Blog de Tecnología
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Artículos, guías y consejos sobre tecnología, computadores, desarrollo web y más.
            Mantente actualizado con las últimas tendencias y aprende de los expertos.
          </p>
        </div>

        {/* Categories Filter */}
        {articles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  category === "Todos"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-16 mb-12">
            <div className="text-6xl mb-6">📝</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Próximamente
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Estamos preparando contenido increíble para ti. Pronto encontrarás aquí artículos, guías y tutoriales sobre tecnología, computadores, desarrollo web y mucho más.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-6xl">
                    {article.category === "Guías de Compra" && "📱"}
                    {article.category === "Tutoriales" && "🛠️"}
                    {article.category === "Hardware" && "💾"}
                    {article.category === "Desarrollo Web" && "💻"}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {article.category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {article.read_time ? `${article.read_time} min` : ""}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{new Date(article.published_at || article.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Newsletter Section */}
        {articles.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Suscríbete a Nuestro Newsletter</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Recibe las últimas noticias, guías y ofertas exclusivas directamente en tu correo.
            </p>
            <form className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        )}

        {/* Popular Topics */}
        {articles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Temas Populares
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { title: "Celulares", icon: "📱", count: "15 artículos" },
                { title: "Computadores", icon: "💻", count: "12 artículos" },
                { title: "Accesorios", icon: "🎧", count: "8 artículos" },
                { title: "Software", icon: "⚙️", count: "10 artículos" },
              ].map((topic) => (
                <div
                  key={topic.title}
                  className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="text-5xl mb-3">{topic.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{topic.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
