"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, MapPin, ChevronRight, ArrowRight } from "lucide-react";

export default function TiendasDestacadas() {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tiendas/publicas")
      .then((r) => r.json())
      .then((data) => setTiendas(data.tiendas || []))
      .catch(() => setTiendas([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (tiendas.length === 0) return null;

  return (
    <section className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tiendas en Neurai
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Negocios locales que venden aquí
            </p>
          </div>
          <Link
            href="/tiendas"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tiendas.map((tienda) => {
            const slug = tienda.nombre
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");
            return (
              <Link
                key={tienda.id}
                href={`/tiendas/${slug}`}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {tienda.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tienda.logo_url}
                        alt={tienda.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 transition-colors">
                      {tienda.nombre}
                    </h3>
                    {tienda.ciudad && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" /> {tienda.ciudad}
                      </span>
                    )}
                  </div>
                </div>
                {tienda.descripcion && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {tienda.descripcion}
                  </p>
                )}
                {tienda.categoria && (
                  <span className="mt-2 inline-block text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full capitalize">
                    {tienda.categoria}
                  </span>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                  Ver tienda <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
