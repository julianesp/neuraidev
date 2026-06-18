"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, ArrowRight } from "lucide-react";

/**
 * Sección de la homepage que muestra los últimos artículos publicados del blog,
 * para invitar a los usuarios a leer las publicaciones.
 */
export default function BlogDestacado() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/blog/posts?published=true&limit=3")
      .then((res) => res.json())
      .then((data) => {
        if (active) setPosts(data.posts || []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Si no hay posts y ya cargó, no renderizar la sección
  if (!loading && posts.length === 0) return null;

  const firstImage = (post) => {
    if (!post.image_url) return null;
    try {
      const parsed = JSON.parse(post.image_url);
      if (Array.isArray(parsed)) return parsed[0]?.url || null;
    } catch {
      return post.image_url;
    }
    return post.image_url;
  };

  return (
    <section className="w-full py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Newspaper className="w-9 h-9 text-blue-600" />
            Desde el Blog
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Guías, novedades y consejos de tecnología. Lee nuestras últimas
            publicaciones.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => {
              const img = firstImage(post);
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative h-44 bg-gradient-to-br from-blue-400 to-indigo-500 overflow-hidden">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Newspaper className="w-16 h-16 text-white opacity-80" />
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute top-3 left-3 bg-white/90 text-gray-900 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                      Leer artículo <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
          >
            Ver todas las publicaciones <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
