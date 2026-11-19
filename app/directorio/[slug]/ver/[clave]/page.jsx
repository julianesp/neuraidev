import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { nombreMunicipio } from "@/lib/directorio/constantes";
import { obtenerPorSlug } from "@/lib/directorio/negocios";
import { productosPorNegocios } from "@/lib/directorio/productos";
import { pesos } from "@/lib/directorio/planes";

// Página de UNA foto de la ficha (producto o foto suelta). Su enlace va en el mensaje de WhatsApp
// de "Lo quiero": WhatsApp lee el og:image de aquí y muestra la foto como vista previa en el chat,
// así el negocio ve qué le piden sin abrir nada. Quien sí la abre ve la foto y el enlace a la ficha.
//   clave = "p-<id del producto>" | "f-<índice de la foto>"

export const dynamic = "force-dynamic";

async function cargar(slug, clave) {
  let n;
  try {
    n = await obtenerPorSlug(slug);
  } catch (error) {
    console.error("[directorio] Error cargando foto:", error);
    return null;
  }
  if (!n) return null;

  const [tipo, ...resto] = String(clave || "").split("-");
  const valor = resto.join("-");
  if (tipo === "f") {
    const i = Number(valor);
    const url = Number.isInteger(i) ? n.fotos[i] : null;
    return url ? { negocio: n, url, producto: null } : null;
  }
  if (tipo === "p" && n.plan_activo) {
    const productos = (await productosPorNegocios([n.id]).catch(() => ({})))[n.id] || [];
    const p = productos.find((x) => x.id === valor);
    return p?.imagen_url ? { negocio: n, url: p.imagen_url, producto: p } : null;
  }
  return null;
}

export async function generateMetadata({ params }) {
  const { slug, clave } = await params;
  const d = await cargar(slug, clave);
  if (!d) return { title: "Foto no encontrada", robots: { index: false } };
  const { negocio: n, url, producto: p } = d;
  const titulo = p ? `${p.nombre}${p.precio ? ` · ${pesos(p.precio)}` : ""}` : `Foto de ${n.nombre}`;
  const descripcion = `${n.nombre} · ${nombreMunicipio(n.municipio)} · neurai.dev/directorio`;
  return {
    title: titulo,
    description: descripcion,
    robots: { index: false, follow: true },
    alternates: { canonical: `/directorio/${n.slug}` },
    openGraph: {
      title: titulo,
      description: descripcion,
      type: "website",
      url: `https://neurai.dev/directorio/${n.slug}/ver/${clave}`,
      images: [{ url, alt: titulo }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion, images: [url] },
  };
}

export default async function FotoNegocioPage({ params }) {
  const { slug, clave } = await params;
  const d = await cargar(slug, clave);
  if (!d) notFound();
  const { negocio: n, url, producto: p } = d;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-24 pb-10 sm:pt-28">
      <Link href={`/directorio/${n.slug}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Ver {n.nombre}
      </Link>

      <div className="mt-4 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={p ? p.nombre : `Foto de ${n.nombre}`} className="mx-auto max-h-[75vh] w-auto object-contain" />
      </div>

      <div className="mt-4">
        {p && (
          <>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{p.nombre}</h1>
            <p className="text-lg font-bold text-blue-600">{p.precio ? pesos(p.precio) : "Consultar precio"}</p>
            {p.descripcion && <p className="mt-1 text-gray-700 dark:text-gray-300">{p.descripcion}</p>}
          </>
        )}
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {n.nombre} · {nombreMunicipio(n.municipio)}
        </p>
        <Link
          href={`/directorio/${n.slug}`}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-semibold !text-white hover:bg-blue-700"
        >
          Ver el negocio
        </Link>
      </div>
    </main>
  );
}
