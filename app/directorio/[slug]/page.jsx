import Link from "next/link";
import { after } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { d1SelectOne } from "@/lib/db-d1";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Pencil, Facebook, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { nombreCategoria, nombreMunicipio } from "@/lib/directorio/constantes";
import { obtenerPorSlug, registrarVista } from "@/lib/directorio/negocios";
import { DIAS, formatearHora, parsearHorario } from "@/lib/directorio/horario";
import GaleriaFicha from "../_components/GaleriaFicha";
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

  // ¿Quien mira es el dueño de la ficha? Entonces se muestra el botón de editar.
  let esDueno = false;
  try {
    const user = await currentUser();
    if (user) {
      const fila = await d1SelectOne("SELECT owner_id FROM directorio_negocios WHERE id = ?", [n.id]);
      esDueno = fila?.owner_id === user.id;
    }
  } catch {
    esDueno = false;
  }

  const lugar = nombreMunicipio(n.municipio);
  const horario = parsearHorario(n.horario);
  // Día de hoy en hora de Colombia, para resaltarlo en el horario.
  const nombreHoy = new Intl.DateTimeFormat("es-CO", { weekday: "long", timeZone: "America/Bogota" })
    .format(new Date())
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const hoy = DIAS.find((d) => d.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === nombreHoy)?.id;
  // Mapa incrustado (sin API key). Con dirección busca la dirección; sin ella, el negocio en el municipio.
  const tienePin = n.lat != null && n.lng != null;
  const consultaMapa = tienePin
    ? `${n.lat},${n.lng}`
    : n.direccion
    ? `${n.direccion}, ${lugar}, Putumayo, Colombia`
    : `${n.nombre}, ${lugar}, Putumayo, Colombia`;
  const mapa = tienePin
    ? `https://www.google.com/maps/search/?api=1&query=${n.lat},${n.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${n.direccion ? `${n.direccion}, ` : ""}${n.nombre}, ${lugar}, Putumayo, Colombia`
      )}`;
  const mapaEmbed = `https://www.google.com/maps?q=${encodeURIComponent(consultaMapa)}&z=${tienePin ? 17 : 15}&output=embed&hl=es`;
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
    sameAs: [n.facebook, n.instagram].filter(Boolean),
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-24 pb-8 sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/directorio" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Volver al directorio
      </Link>

      {esDueno && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-50 px-4 py-3 dark:bg-blue-900/30">
          <p className="text-sm text-blue-900 dark:text-blue-100">Este es tu negocio. Puedes cambiar sus datos y fotos.</p>
          <Link
            href={`/directorio/mis-negocios?editar=${n.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold !text-white shadow transition hover:scale-105 hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Editar mi negocio
          </Link>
        </div>
      )}

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

      {n.fotos.length > 0 && <GaleriaFicha fotos={n.fotos} nombre={n.nombre} />}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <section className="space-y-6">
          {n.descripcion ? (
            <p className="whitespace-pre-line leading-relaxed text-gray-800 dark:text-gray-200">{n.descripcion}</p>
          ) : null}

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Ubicación</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <iframe
                title={`Mapa de ${n.nombre}`}
                src={mapaEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="h-72 w-full border-0 sm:h-80"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {n.direccion ? `${n.direccion}, ` : ""}
              {lugar}.{" "}
              <a href={mapa} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                Abrir en Google Maps
              </a>
            </p>
          </div>
        </section>

        <aside className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          {n.whatsapp ? (
            <a
              href={urlWhatsapp(n.whatsapp, n.nombre)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium !text-white hover:bg-blue-700"
            >
              <MessageCircle className="h-5 w-5" /> Escribir por WhatsApp
            </a>
          ) : null}
          {n.telefono ? (
            <a
              href={`tel:+${n.telefono}`}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              <Phone className="h-5 w-5" /> Llamar {n.telefono.replace(/^57/, "")}
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
            {horario ? (
              <li className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <dl className="grid flex-1 grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                  {DIAS.map((d) => (
                    <div key={d.id} className={`col-span-2 grid grid-cols-subgrid ${d.id === hoy ? "font-semibold text-blue-600" : ""}`}>
                      <dt>{d.nombre}</dt>
                      <dd>
                        {horario[d.id]
                          ? `${formatearHora(horario[d.id].a)} - ${formatearHora(horario[d.id].c)}`
                          : "Cerrado"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ) : n.horario ? (
              <li className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span className="whitespace-pre-line">{n.horario}</span>
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
