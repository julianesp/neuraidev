import Link from "next/link";
import Image from "next/image";
import { obtenerProductosConOferta } from "@/lib/ofertas-server";
import { TIPOS_OFERTA } from "@/lib/precios";
import { generateProductSlug, buildProductUrl } from "@/utils/slugify";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/ofertas/productos" },
  title: "Ofertas y precios de lanzamiento",
  description:
    "Productos de tecnología con descuento y precios de lanzamiento por tiempo limitado en neurai.dev.",
};

function primeraImagen(p) {
  if (p.imagen_principal) return p.imagen_principal;
  let imgs = p.imagenes;
  if (typeof imgs === "string") {
    try { imgs = JSON.parse(imgs); } catch { imgs = []; }
  }
  const img = Array.isArray(imgs) ? imgs[0] : null;
  return typeof img === "string" ? img : img?.url || null;
}

export default async function ProductosEnOfertaPage() {
  const productos = await obtenerProductosConOferta();

  if (productos.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Ofertas y lanzamientos
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          No hay ofertas activas en este momento. ¡Vuelve pronto!
        </p>
        <Link
          href="/"
          className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Volver al inicio
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold mt-3 text-gray-900 dark:text-white">
          Ofertas y precios de lanzamiento
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Precios especiales por tiempo limitado
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {productos.map((producto) => {
          const imagen = primeraImagen(producto);
          const tipo = TIPOS_OFERTA[producto.ofertaTipo];
          const pct = Math.round((1 - producto.precio / producto.precioAnterior) * 100);
          const href = buildProductUrl(producto.categoria, generateProductSlug(producto));

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
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  -{pct}%
                </span>
              </div>
              <div className="p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">
                  {tipo.emoji} {producto.ofertaNombre || tipo.etiqueta}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                  {producto.nombre}
                </p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    ${producto.precio.toLocaleString("es-CO")}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    ${producto.precioAnterior.toLocaleString("es-CO")}
                  </span>
                </div>
                {producto.ofertaHasta && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Hasta el{" "}
                    {new Date(producto.ofertaHasta).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "long",
                      timeZone: "America/Bogota",
                    })}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
