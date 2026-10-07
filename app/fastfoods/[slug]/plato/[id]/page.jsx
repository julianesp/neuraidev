import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getPlato, negocioPublico } from "@/lib/fastfoods/data";
import { formatoPrecio, horaLegible, urlPlato, variablesTema } from "@/lib/fastfoods/utils";
import { BarraPedido, BotonAgregar, CarritoProvider } from "@/app/fastfoods/_components/Carrito";
import BotonCompartir from "@/app/fastfoods/_components/BotonCompartir";

export const dynamic = "force-dynamic";

/**
 * Página propia de un plato: es el enlace que se comparte, y su vista previa
 * (og:image) es la foto del plato, no el logo de neurai.dev.
 */
export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  const datos = await getPlato(slug, id);
  if (!datos) return { title: "Plato no encontrado" };
  const { negocio, plato } = datos;

  const titulo = `${plato.nombre}${plato.precio ? ` — ${formatoPrecio(plato.precio)}` : ""} | ${negocio.nombre}`;
  const descripcion =
    plato.descripcion || `Pídelo en ${negocio.nombre}${negocio.ciudad ? `, ${negocio.ciudad}` : ""}.`;
  // JPG/PNG: imagen armada con nombre y precio. WebP: la foto tal cual (next/og no la lee).
  const imagen =
    plato.foto_url && !/\.(jpe?g|png)(\?|$)/i.test(plato.foto_url)
      ? plato.foto_url
      : `https://neurai.dev/fastfoods/${slug}/plato/${id}/imagen`;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: urlPlato(slug, id) },
    openGraph: {
      title: titulo,
      description: descripcion,
      url: urlPlato(slug, id),
      type: "website",
      images: [{ url: imagen, width: 1200, height: 630, alt: plato.nombre }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion, images: [imagen] },
  };
}

export default async function PlatoPage({ params }) {
  const { slug, id } = await params;
  const datos = await getPlato(slug, id);
  if (!datos) notFound();
  const negocio = negocioPublico(datos.negocio);
  const { plato } = datos;
  const pedible = !plato.vencido && plato.precio && plato.quedan !== 0;
  const pedibles = pedible
    ? { [plato.id]: { id: plato.id, nombre: plato.nombre, precio: plato.precio, quedan: plato.quedan } }
    : {};

  return (
    <div style={variablesTema(negocio.tema)} className="min-h-screen bg-[var(--ff-fondo)] text-[var(--ff-texto)]">
      <CarritoProvider negocio={negocio} pedibles={pedibles}>
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-5 pt-24 sm:pt-28 pb-10">
          <Link
            href={`/fastfoods/${negocio.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ff-texto-suave)] hover:text-[var(--ff-texto)] mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> {negocio.nombre}
          </Link>

          <article className="rounded-3xl overflow-hidden bg-[var(--ff-tarjeta)] border border-[var(--ff-borde)] md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="relative bg-[var(--ff-borde)] aspect-square md:aspect-auto md:min-h-[28rem]">
              {plato.foto_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={plato.foto_url} alt={plato.nombre} className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>
            <div className="p-5 sm:p-8 flex flex-col justify-center">
              {plato.tipo === "especial" && (
                <span className="self-start rounded-full bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)] px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  Especial de hoy
                </span>
              )}
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold leading-tight text-balance">{plato.nombre}</h1>
              {plato.descripcion && (
                <p className="mt-2 text-lg text-[var(--ff-texto-suave)] text-pretty">{plato.descripcion}</p>
              )}
              {plato.precio ? <p className="mt-4 text-3xl font-extrabold">{formatoPrecio(plato.precio)}</p> : null}
              {plato.tipo === "especial" && !plato.vencido && (
                <p className="mt-1 text-sm text-[var(--ff-texto-suave)] inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 fill-none" /> Hasta las {horaLegible(plato.expira_en)}
                  {plato.quedan != null && ` · ${plato.quedan === 0 ? "Agotado" : `quedan ${plato.quedan}`}`}
                </p>
              )}

              {plato.vencido ? (
                <p className="mt-5 rounded-2xl border border-[var(--ff-borde)] px-4 py-3">
                  Este especial ya terminó.{" "}
                  <Link href={`/fastfoods/${negocio.slug}`} className="font-semibold underline underline-offset-4">
                    Mira el menú de {negocio.nombre}
                  </Link>
                </p>
              ) : (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {pedible ? (
                    <span className="inline-flex items-center gap-3">
                      <BotonAgregar id={plato.id} nombre={plato.nombre} />
                      <span className="text-sm text-[var(--ff-texto-suave)]">Agregar al pedido</span>
                    </span>
                  ) : null}
                  <BotonCompartir
                    url={urlPlato(negocio.slug, plato.id)}
                    titulo={plato.nombre}
                    texto={`${plato.nombre}${plato.precio ? ` a ${formatoPrecio(plato.precio)}` : ""} en ${negocio.nombre}`}
                    conTexto
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ff-borde)] px-4 py-2 hover:bg-[var(--ff-borde)]"
                  />
                </div>
              )}

              <Link
                href={`/fastfoods/${negocio.slug}#menu`}
                className="mt-6 self-start font-semibold text-[var(--ff-primario)] underline underline-offset-4"
              >
                Ver el menú completo
              </Link>
            </div>
          </article>
        </div>
        <BarraPedido />
      </CarritoProvider>
    </div>
  );
}
