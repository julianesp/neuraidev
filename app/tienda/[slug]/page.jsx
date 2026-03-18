import { getSupabaseClient } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Store, MapPin, Phone, Share2 } from "lucide-react";

async function getTiendaPorSlug(slug) {
  const supabase = getSupabaseClient();
  const { data: tiendas } = await supabase
    .from("tiendas")
    .select("*")
    .eq("activa", true);

  if (!tiendas) return null;

  return tiendas.find((t) => {
    const tiendaSlug = t.nombre
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return tiendaSlug === slug;
  }) || null;
}

async function getProductos() {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select("id, nombre, precio, precio_oferta, imagen_principal, categoria, stock, disponible, slug")
    .eq("disponible", true)
    .gt("stock", 0)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tienda = await getTiendaPorSlug(slug);
  if (!tienda) return { title: "Tienda no encontrada" };
  return {
    title: `${tienda.nombre} | Neurai`,
    description: tienda.descripcion || `Productos de ${tienda.nombre} en Neurai`,
  };
}

export default async function TiendaPublicaPage({ params }) {
  const { slug } = await params;
  const tienda = await getTiendaPorSlug(slug);
  if (!tienda) notFound();

  const productos = await getProductos();

  const categorias = [...new Set(productos.map((p) => p.categoria))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la tienda */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              {tienda.logo_url
                ? <img src={tienda.logo_url} alt={tienda.nombre} className="w-full h-full object-cover rounded-2xl" />
                : <Store className="w-10 h-10 text-white" />}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{tienda.nombre}</h1>
              {tienda.descripcion && (
                <p className="text-blue-100 mt-1 max-w-lg">{tienda.descripcion}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-blue-200">
                {tienda.ciudad && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {tienda.ciudad}
                  </span>
                )}
                {tienda.telefono && (
                  <a href={`https://wa.me/57${tienda.telefono}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white transition-colors">
                    <Phone className="w-3.5 h-3.5" /> {tienda.telefono}
                  </a>
                )}
                {tienda.categoria && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full capitalize text-xs">
                    {tienda.categoria}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {productos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">Esta tienda aún no tiene productos</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Productos <span className="text-gray-400 font-normal text-base">({productos.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {productos.map((p) => (
                <Link
                  key={p.id}
                  href={p.slug ? `/accesorios/${p.categoria}/${p.slug}` : `/producto/${p.id}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {p.imagen_principal
                      ? <img src={p.imagen_principal} alt={p.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    }
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{p.nombre}</p>
                    <div className="flex items-center gap-2">
                      {p.precio_oferta ? (
                        <>
                          <span className="text-sm font-bold text-blue-600">
                            ${p.precio_oferta.toLocaleString("es-CO")}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ${p.precio?.toLocaleString("es-CO")}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">
                          ${p.precio?.toLocaleString("es-CO")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer de la tienda */}
      <div className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        Tienda publicada en{" "}
        <Link href="/" className="text-blue-600 hover:underline font-medium">Neurai.dev</Link>
      </div>
    </div>
  );
}
