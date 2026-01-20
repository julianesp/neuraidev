"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Calendar, Globe, Facebook } from "lucide-react";
import Image from "next/image";

export default function ExternalNews() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarNoticias();
  }, []);

  const cargarNoticias = async () => {
    try {
      const response = await fetch("/api/noticias");
      if (response.ok) {
        const data = await response.json();
        setNoticias(data.noticias || []);
      }
    } catch (error) {
      console.error("Error al cargar noticias:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse"
              >
                <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (noticias.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Globe className="w-10 h-10 text-blue-600" />
            Noticias Destacadas
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Mantente informado con las últimas noticias de tecnología y actualidad
          </p>
        </div>

        {/* Grid de noticias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((noticia, index) => (
            <article
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              {/* Imagen */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {noticia.imagen ? (
                  <Image
                    src={noticia.imagen}
                    alt={noticia.titulo}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Globe className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                {/* Badge del tipo */}
                {noticia.tipo === "facebook" && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
                    <Facebook className="w-3 h-3" />
                    Facebook
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-6">
                {/* Título */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {noticia.titulo}
                </h3>

                {/* Descripción */}
                {noticia.descripcion && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {noticia.descripcion}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Fecha */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {formatearFecha(noticia.fecha)}
                  </div>

                  {/* Link */}
                  <a
                    href={noticia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold group/link"
                  >
                    Ver más
                    <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>

                {/* Fuente */}
                {noticia.sitioWeb && (
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Fuente: {noticia.sitioWeb}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
