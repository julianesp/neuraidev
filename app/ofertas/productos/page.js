import { getSupabaseClient } from "@/lib/db";
import { obtenerOfertasActivas } from "@/lib/supabase/ofertas";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Productos en Oferta | Neurai.dev",
  description: "Encuentra los mejores descuentos en productos de tecnología, accesorios y más.",
};

function calcularPrecioFinal(precio, porcentaje) {
  return Math.round(precio * (1 - porcentaje / 100));
}

export default async function ProductosEnOfertaPage() {
  const ofertas = await obtenerOfertasActivas();

  if (ofertas.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Productos en Oferta
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          No hay ofertas activas en este momento. ¡Vuelve pronto!
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-white px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#0070f3" }}
        >
          Volver al inicio
        </Link>
      </main>
    );
  }

  // Recopilar todos los IDs únicos de productos
  const todosLosIds = [...new Set(ofertas.flatMap((o) => o.productos_ids))];

  // Consultar productos en Supabase
  const supabase = getSupabaseClient();
  const { data: productos } = await supabase
    .from("products")
    .select("id, nombre, precio, precio_oferta, imagen_principal, imagenes, categoria, slug")
    .in("id", todosLosIds);

  const productosMap = {};
  (productos || []).forEach((p) => {
    productosMap[p.id] = p;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-medium hover:underline"
          style={{ color: "#0070f3" }}
        >
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold mt-3 text-gray-900 dark:text-white">
          Productos en Oferta
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Aprovecha estos descuentos por tiempo limitado
        </p>
      </div>

      {ofertas.map((oferta) => {
        const productosDeOferta = oferta.productos_ids
          .map((id) => productosMap[id])
          .filter(Boolean);

        if (productosDeOferta.length === 0) return null;

        return (
          <section key={oferta.id} className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span
                className="text-white text-sm font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: "#0070f3" }}
              >
                {oferta.porcentaje_descuento}% OFF
              </span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {oferta.nombre}
              </h2>
              {oferta.fecha_fin && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Válido hasta{" "}
                  {new Date(oferta.fecha_fin).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {productosDeOferta.map((producto) => {
                const precioBase = producto.precio_oferta || producto.precio;
                const precioFinal = calcularPrecioFinal(precioBase, oferta.porcentaje_descuento);
                const imagen =
                  producto.imagen_principal ||
                  (Array.isArray(producto.imagenes) && producto.imagenes[0]?.url) ||
                  (Array.isArray(producto.imagenes) && producto.imagenes[0]) ||
                  null;

                const href = producto.slug && producto.categoria
                  ? `/accesorios/${producto.categoria}/${producto.slug}`
                  : "#";

                return (
                  <Link
                    key={producto.id}
                    href={href}
                    className="group rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                      {imagen ? (
                        <Image
                          src={imagen}
                          alt={producto.nombre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          📦
                        </div>
                      )}
                      <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#0070f3" }}>
                        -{oferta.porcentaje_descuento}%
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                        {producto.nombre}
                      </p>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                          ${precioFinal.toLocaleString("es-CO")}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          ${precioBase.toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
