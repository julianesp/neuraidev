import Link from "next/link";
import { Search, Store } from "lucide-react";
import {
  CATEGORIAS,
  MUNICIPIOS,
  categoriaValida,
  municipioValido,
  nombreCategoria,
  nombreMunicipio,
} from "@/lib/directorio/constantes";
import { contarPor, listarPublicos, masVisitados } from "@/lib/directorio/negocios";
import TarjetaNegocio from "./_components/TarjetaNegocio";
import CarruselVisitados from "./_components/CarruselVisitados";
import CarruselProductos from "./_components/CarruselProductos";
import { loadCategoryProducts } from "@/utils/loadCategoryProducts";
import { generateProductSlug } from "@/utils/slugify";

// Productos de la tienda para la fila de abajo: destacados primero.
async function productosTienda() {
  try {
    const listas = await Promise.all(
      ["celulares", "computadoras", "generales"].map(async (categoria) =>
        ((await loadCategoryProducts(categoria)) || []).map((p) => ({ ...p, _cat: categoria }))
      )
    );
    return listas
      .flat()
      .filter((p) => p.disponible && (p.imagenPrincipal || p.imagenes?.length) && generateProductSlug(p))
      .sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0))
      .slice(0, 16)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        imagen: p.imagenPrincipal || p.imagenes?.[0]?.url,
        href: `/accesorios/${p._cat}/${generateProductSlug(p)}`,
      }));
  } catch (error) {
    console.error("[directorio] Error cargando productos:", error);
    return [];
  }
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const partes = [];
  if (categoriaValida(sp.categoria)) partes.push(nombreCategoria(sp.categoria));
  if (municipioValido(sp.municipio)) partes.push(`en ${nombreMunicipio(sp.municipio)}`);
  if (!partes.length) return {};
  return {
    title: `${partes.join(" ")}, Putumayo | Directorio`,
    description: `Negocios y servicios: ${partes.join(" ")}. Contacta directo por WhatsApp o teléfono.`,
    alternates: { canonical: "/directorio" },
  };
}

function href(sp, cambios) {
  const q = new URLSearchParams();
  const merged = { ...sp, ...cambios };
  for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
  const s = q.toString();
  return `/directorio${s ? `?${s}` : ""}`;
}

export default async function DirectorioPage({ searchParams }) {
  const sp = await searchParams;
  const filtros = {
    q: typeof sp.q === "string" ? sp.q : "",
    municipio: municipioValido(sp.municipio) ? sp.municipio : "",
    categoria: categoriaValida(sp.categoria) ? sp.categoria : "",
    pagina: sp.pagina,
  };

  let resultado = { negocios: [], total: 0, pagina: 1, paginas: 1 };
  let porMunicipio = {};
  let porCategoria = {};
  let visitados = [];
  const productos = await productosTienda();
  try {
    [resultado, porMunicipio, porCategoria, visitados] = await Promise.all([
      listarPublicos(filtros),
      contarPor("municipio"),
      contarPor("categoria"),
      masVisitados(12),
    ]);
  } catch (error) {
    console.error("[directorio] Error cargando:", error);
  }

  const hayFiltros = filtros.q || filtros.municipio || filtros.categoria;
  const base = { q: filtros.q, municipio: filtros.municipio, categoria: filtros.categoria };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-24 pb-8 sm:pt-28 sm:pb-12">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Directorio de negocios del Putumayo
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-gray-400">
          Tiendas, restaurantes, hoteles, talleres, profesionales y servicios de todo el
          departamento. Contáctalos directo por WhatsApp o teléfono.
        </p>
      </header>

      <form action="/directorio" className="mx-auto mt-6 grid max-w-3xl gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          name="q"
          defaultValue={filtros.q}
          placeholder="¿Qué buscas? Ej: droguería, hotel, mecánico"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        <select
          name="municipio"
          defaultValue={filtros.municipio}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">Todo el Putumayo</option>
          {MUNICIPIOS.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.nombre}
            </option>
          ))}
        </select>
        <select
          name="categoria"
          defaultValue={filtros.categoria}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.nombre}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          <Search className="h-4 w-4" /> Buscar
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/directorio/mis-negocios"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
        >
          <Store className="h-4 w-4" /> ¿Tienes un negocio? Publícalo gratis
        </Link>
      </div>

      {!hayFiltros && visitados.length > 0 && <CarruselVisitados negocios={visitados} />}

      {!hayFiltros && (
        <>
          {MUNICIPIOS.some((m) => porMunicipio[m.slug]) && (
          <section className="mt-10" aria-labelledby="h-municipios">
            <h2 id="h-municipios" className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Por municipio
            </h2>
            <div className="flex flex-wrap gap-2">
              {MUNICIPIOS.filter((m) => porMunicipio[m.slug]).map((m) => (
                <Link
                  key={m.slug}
                  href={href({}, { municipio: m.slug })}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 hover:border-blue-600 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  {m.nombre}
                  <span className="ml-1.5 text-xs text-gray-500">{porMunicipio[m.slug]}</span>
                </Link>
              ))}
            </div>
          </section>
          )}

          <section className="mt-8" aria-labelledby="h-categorias">
            <h2 id="h-categorias" className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Por categoría
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIAS.filter((c) => porCategoria[c.slug]).map((c) => (
                <Link
                  key={c.slug}
                  href={href({}, { categoria: c.slug })}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 hover:border-blue-600 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <span>{c.nombre}</span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                    {porCategoria[c.slug]}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="mt-10" aria-labelledby="h-resultados">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="h-resultados" className="text-lg font-semibold text-gray-900 dark:text-white">
            {hayFiltros ? `${resultado.total} resultado${resultado.total === 1 ? "" : "s"}` : "Últimos negocios"}
          </h2>
          {hayFiltros && (
            <Link href="/directorio" className="text-sm text-blue-600 hover:underline">
              Quitar filtros
            </Link>
          )}
        </div>

        {resultado.negocios.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-600 dark:border-gray-700 dark:text-gray-400">
            {hayFiltros
              ? "No encontramos negocios con esos filtros."
              : "Aún no hay negocios publicados. ¡Sé el primero!"}{" "}
            <Link href="/directorio/mis-negocios" className="font-medium text-blue-600 hover:underline">
              Publica el tuyo gratis
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultado.negocios.map((n) => (
              <TarjetaNegocio key={n.id} negocio={n} />
            ))}
          </div>
        )}

        {resultado.paginas > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Paginación">
            {resultado.pagina > 1 && (
              <Link
                href={href(base, { pagina: String(resultado.pagina - 1) })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:border-blue-600 dark:border-gray-700 dark:text-gray-200"
              >
                ← Anterior
              </Link>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Página {resultado.pagina} de {resultado.paginas}
            </span>
            {resultado.pagina < resultado.paginas && (
              <Link
                href={href(base, { pagina: String(resultado.pagina + 1) })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:border-blue-600 dark:border-gray-700 dark:text-gray-200"
              >
                Siguiente →
              </Link>
            )}
          </nav>
        )}
      </section>

      {productos.length > 0 && <CarruselProductos productos={productos} />}
    </main>
  );
}
