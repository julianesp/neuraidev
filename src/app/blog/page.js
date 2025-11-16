import React from "react";
import Link from "next/link";
import Image from "next/image";

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

export default function Blog() {
  const articles = [
    {
      slug: "como-elegir-computador-2025",
      title: "Cómo Elegir el Mejor Computador en 2025: Guía Completa",
      excerpt: "Descubre los factores clave para elegir el computador perfecto según tu presupuesto y necesidades. Aprende sobre procesadores, tarjetas gráficas, almacenamiento, RAM y más.",
      category: "Guías de Compra",
      date: "2025-01-15",
      readTime: "14 min",
      image: "/images/blog/como-elegir-computador-2025.jpg",
    },
    {
      slug: "mantenimiento-computador-guia-completa",
      title: "Mantenimiento de Computadores: Guía Completa 2025",
      excerpt: "Todo lo que necesitas saber sobre el mantenimiento preventivo y correctivo de tu PC. Consejos prácticos para mantener tu equipo funcionando como nuevo.",
      category: "Tutoriales",
      date: "2025-01-12",
      readTime: "10 min",
      image: "/images/blog/mantenimiento-pc.jpg",
    },
    {
      slug: "ssd-vs-hdd-cual-elegir",
      title: "SSD vs HDD: ¿Cuál Necesitas Realmente?",
      excerpt: "Análisis detallado de las diferencias entre discos SSD y HDD. Conoce las ventajas, desventajas y cuál es la mejor opción para tu caso específico.",
      category: "Hardware",
      date: "2025-01-10",
      readTime: "7 min",
      image: "/images/blog/ssd-hdd.jpg",
    },
    {
      slug: "ram-ddr4-vs-ddr5",
      title: "RAM DDR4 vs DDR5: ¿Vale la Pena el Upgrade?",
      excerpt: "Comparativa exhaustiva entre memoria RAM DDR4 y DDR5. Rendimiento, compatibilidad, precios y recomendaciones para diferentes usos.",
      category: "Hardware",
      date: "2025-01-08",
      readTime: "6 min",
      image: "/images/blog/ram-comparison.jpg",
    },
    {
      slug: "desarrollo-web-pequeños-negocios",
      title: "Desarrollo Web para Pequeños Negocios: Guía Práctica",
      excerpt: "¿Tu negocio necesita una página web? Descubre los beneficios, costos y qué considerar antes de crear tu presencia online.",
      category: "Desarrollo Web",
      date: "2025-01-05",
      readTime: "9 min",
      image: "/images/blog/web-development.jpg",
    },
  ];

  const categories = ["Todos", "Guías de Compra", "Tutoriales", "Hardware", "Desarrollo Web", "Noticias"];

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

        {/* Articles Grid */}
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
                    {article.readTime}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>{new Date(article.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter Section */}
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

        {/* Popular Topics */}
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
      </div>
    </div>
  );
}
