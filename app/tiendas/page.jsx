import { getSupabaseClient } from "@/lib/db";
import Link from "next/link";
import { Store, MapPin, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Tiendas | Neurai.dev",
  description: "Descubre todos los negocios y tiendas que venden en Neurai.dev",
};

async function getTiendas() {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("tiendas")
    .select("id, nombre, descripcion, categoria, ciudad, logo_url")
    .eq("activa", true)
    .eq("onboarding_completado", true)
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function TiendasPage() {
  const tiendas = await getTiendas();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tiendas en Neurai
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {tiendas.length} {tiendas.length === 1 ? "tienda registrada" : "tiendas registradas"}
          </p>
        </div>

        {tiendas.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">Aún no hay tiendas registradas</p>
            <Link
              href="/para-tiendas"
              className="mt-4 inline-block text-blue-600 hover:underline text-sm"
            >
              ¿Tienes un negocio? Regístralo aquí
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {tiendas.map((tienda) => {
              const slug = tienda.nombre
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");
              return (
                <Link
                  key={tienda.id}
                  href={`/tiendas/${slug}`}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                    {tienda.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tienda.logo_url}
                        alt={tienda.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                    {tienda.nombre}
                  </h2>
                  {tienda.ciudad && (
                    <span className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <MapPin className="w-3 h-3" /> {tienda.ciudad}
                    </span>
                  )}
                  {tienda.descripcion && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {tienda.descripcion}
                    </p>
                  )}
                  {tienda.categoria && (
                    <span className="mt-3 inline-block text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full capitalize">
                      {tienda.categoria}
                    </span>
                  )}
                  <div className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 group-hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                    Ver productos <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-3">¿Tienes un negocio?</p>
          <Link
            href="/para-tiendas"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Store className="w-4 h-4" />
            Registra tu tienda gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
