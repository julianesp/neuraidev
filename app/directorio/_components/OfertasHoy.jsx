import Link from "next/link";
import { Tag } from "lucide-react";
import { nombreMunicipio } from "@/lib/directorio/constantes";
import { formatearVence } from "@/lib/directorio/ofertas";

// Fila de ofertas vigentes de todos los negocios del directorio.
export default function OfertasHoy({ ofertas }) {
  return (
    <section className="mt-10" aria-labelledby="h-ofertas">
      <h2 id="h-ofertas" className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <Tag className="h-5 w-5 text-blue-600" /> Ofertas de hoy
      </h2>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "thin" }}>
        {ofertas.map((o) => (
          <Link
            key={o.id}
            href={`/directorio/${o.slug}`}
            className="group relative flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-blue-200 bg-white transition hover:border-blue-600 hover:shadow-md dark:border-blue-900/60 dark:bg-gray-900"
          >
            <div className="relative h-32 bg-blue-50 dark:bg-gray-800">
              {o.portada ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={o.portada} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Tag className="h-10 w-10 text-blue-600/40" />
                </div>
              )}
              <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Oferta
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <p className="line-clamp-2 font-semibold leading-snug text-gray-900 group-hover:text-blue-600 dark:text-gray-100">
                {o.titulo}
              </p>
              <p className="truncate text-sm text-gray-700 dark:text-gray-300">{o.nombre}</p>
              <p className="text-xs text-gray-500">
                {nombreMunicipio(o.municipio)} · vence el {formatearVence(o.vence)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
