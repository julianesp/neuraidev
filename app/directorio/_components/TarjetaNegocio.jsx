import Link from "next/link";
import { MapPin, Phone, MessageCircle, Star } from "lucide-react";
import { estaAbierto } from "@/lib/directorio/horario";
import EnlaceRastreado from "./EnlaceRastreado";
import { nombreCategoria, nombreMunicipio } from "@/lib/directorio/constantes";

export const urlWhatsapp = (numero, nombre) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(
    `Hola, vi tu negocio${nombre ? ` "${nombre}"` : ""} en neurai.dev/directorio y quisiera más información.`
  )}`;

export default function TarjetaNegocio({ negocio: n }) {
  const portada = n.fotos?.[0] || n.logo_url;
  const abierto = estaAbierto(n.horario);
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-800">
      <Link href={`/directorio/${n.slug}`} className="block h-full w-full" aria-label={`Ver ${n.nombre}`}>
        {portada ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portada} alt={n.nombre} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-bold text-blue-600/30">
            {n.nombre.charAt(0).toUpperCase()}
          </div>
        )}
        {n.destacado ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
            <Star className="h-3 w-3" /> Destacado
          </span>
        ) : null}
      </Link>
        <Link
          href={`/directorio/${n.slug}`}
          className="absolute bottom-3 left-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold !text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
        >
          Ver
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-fit rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            {nombreCategoria(n.categoria)}
          </span>
          {abierto !== null && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                abierto
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${abierto ? "bg-white" : "bg-gray-400"}`} />
              {abierto ? "Abierto ahora" : "Cerrado"}
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold leading-snug text-gray-900 dark:text-gray-100">
          <Link href={`/directorio/${n.slug}`} className="hover:text-blue-600">
            {n.nombre}
          </Link>
        </h3>
        <p className="flex items-start gap-1 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {n.direccion ? `${n.direccion} · ` : ""}
            {nombreMunicipio(n.municipio)}
          </span>
        </p>

        <div className="mt-auto pt-2">
          <div className="flex flex-col gap-2">
            {n.whatsapp ? (
              <EnlaceRastreado
                negocioId={n.id}
                tipo="whatsapp"
                href={urlWhatsapp(n.whatsapp, n.nombre)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium !text-white hover:bg-blue-700"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </EnlaceRastreado>
            ) : null}
            {n.telefono ? (
              <EnlaceRastreado
                negocioId={n.id}
                tipo="llamar"
                href={`tel:+${n.telefono}`}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                <Phone className="h-4 w-4" /> Llamar
              </EnlaceRastreado>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
