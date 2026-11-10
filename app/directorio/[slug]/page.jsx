import Link from "next/link";
import { after } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Facebook, Globe, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { nombreCategoria, nombreMunicipio } from "@/lib/directorio/constantes";
import { obtenerPorSlug, registrarVista } from "@/lib/directorio/negocios";
import { urlWhatsapp } from "../_components/TarjetaNegocio";

export const dynamic = "force-dynamic";

const cargar = async (slug) => {
  try {
    return await obtenerPorSlug(slug);
  } catch (error) {
    console.error("[directorio] Error cargando ficha:", error);
    return null;
  }
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const n = await cargar(slug);
  if (!n) return { title: "Negocio no encontrado", robots: { index: false } };
  const lugar = nombreMunicipio(n.municipio);
  const descripcion =
    n.descripcion?.slice(0, 155) ||
    `${n.nombre}, ${nombreCategoria(n.categoria)} en ${lugar}, Putumayo. Contacto, dirección y horario.`;
  const imagen = n.fotos?.[0] || n.logo_url;
  return {
    title: `${n.nombre} - ${nombreCategoria(n.categoria)} en ${lugar}`,
    description: descripcion,
    alternates: { canonical: `/directorio/${n.slug}` },
    openGraph: { title: n.nombre, description: descripcion, ...(imagen && { images: [imagen] }) },
  };
}

export default async function FichaNegocioPage({ params }) {
  const { slug } = await params;
  const n = await cargar(slug);
  if (!n) notFound();
  after(() => registrarVista(n.id).catch(() => {}));

  const lugar = nombreMunicipio(n.municipio);
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${n.direccion ? `${n.direccion}, ` : ""}${n.nombre}, ${lugar}, Putumayo, Colombia`
  )}`;
  const reporte = `https://wa.me/573174503604?text=${encodeURIComponent(
    `Quiero reportar un problema con la ficha "${n.nombre}": https://neurai.dev/directorio/${n.slug}`
  )}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: n.nombre,
    description: n.descripcion || undefined,
    url: `https://neurai.dev/directorio/${n.slug}`,
    telephone: n.telefono ? `+57${n.telefono.replace(/^57/, "")}` : undefined,
    image: n.fotos?.length ? n.fotos : n.logo_url || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: n.direccion || undefined,
      addressLocality: lugar,
      addressRegion: "Putumayo",
      addressCountry: "CO",
    },
    sameAs: [n.sitio_web, n.facebook, n.instagram].filter(Boolean),
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-24 pb-8 sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/directorio" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Volver al directorio
      </Link>

      <header className="mt-4 flex items-start gap-4">
        {n.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={n.logo_url}
            alt={`Logo de ${n.nombre}`}
            className="h-20 w-20 shrink-0 rounded-xl border border-gray-200 bg-white object-cover dark:border-gray-700"
          />
        ) : null}
        <div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/directorio?categoria=${n.categoria}`}
              className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
            >
              {nombreCategoria(n.categoria)}
            </Link>
            <Link
              href={`/directorio?municipio=${n.municipio}`}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              {lugar}
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{n.nombre}</h1>
        </div>
      </header>

      {n.fotos.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {n.fotos.map((url, i) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 ${
                i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${n.nombre} foto ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <section>
          {n.descripcion ? (
            <p className="whitespace-pre-line leading-relaxed text-gray-800 dark:text-gray-200">{n.descripcion}</p>
          ) : null}
        </section>

        <aside className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          {n.whatsapp ? (
            <a
              href={urlWhatsapp(n.whatsapp, n.nombre)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 font-medium text-white hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5" /> Escribir por WhatsApp
            </a>
          ) : null}
          {n.telefono ? (
            <a
              href={`tel:${n.telefono}`}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              <Phone className="h-5 w-5" /> Llamar {n.telefono}
            </a>
          ) : null}

          <ul className="space-y-2 pt-1 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <span>
                {n.direccion ? `${n.direccion}, ` : ""}
                {lugar}.{" "}
                <a href={mapa} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Cómo llegar
                </a>
              </span>
            </li>
            {n.horario ? (
              <li className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span className="whitespace-pre-line">{n.horario}</span>
              </li>
            ) : null}
            {n.sitio_web ? (
              <li className="flex gap-2">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <a href={n.sitio_web} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-blue-600 hover:underline">
                  Sitio web
                </a>
              </li>
            ) : null}
            {n.facebook ? (
              <li className="flex gap-2">
                <Facebook className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <a href={n.facebook} target="_blank" rel="noopener noreferrer nofollow" className="text-blue-600 hover:underline">
                  Facebook
                </a>
              </li>
            ) : null}
            {n.instagram ? (
              <li className="flex gap-2">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <a href={n.instagram} target="_blank" rel="noopener noreferrer nofollow" className="text-blue-600 hover:underline">
                  Instagram
                </a>
              </li>
            ) : null}
          </ul>

          <a
            href={reporte}
            target="_blank"
            rel="noopener noreferrer"
            className="block pt-2 text-center text-xs text-gray-500 hover:text-blue-600"
          >
            Reportar un problema con esta ficha
          </a>
        </aside>
      </div>
    </main>
  );
}
