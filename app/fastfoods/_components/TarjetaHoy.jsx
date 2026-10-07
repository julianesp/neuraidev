import Link from "next/link";
import { Bike, Clock, UtensilsCrossed } from "lucide-react";
import { estaAbierto, formatoPrecio, horaLegible } from "@/lib/fastfoods/utils";

/**
 * Tarjeta de un especial vigente para "Hoy" (/fastfoods/hoy y el home).
 * Sin hooks: sirve en componentes de servidor y de cliente.
 */
export default function TarjetaHoy({ e, compacta = false }) {
  const primario = e.tema?.colorPrimario || "#e11d48";
  const abierto = estaAbierto(e.horario);
  const agotado = e.quedan === 0;

  return (
    <Link
      href={`/fastfoods/${e.slug}`}
      className={`group block rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:shadow-lg transition-shadow ${
        agotado ? "opacity-60" : ""
      }`}
    >
      <div className={`relative ${compacta ? "aspect-[4/3]" : "aspect-[16/10]"}`} style={{ background: primario }}>
        {e.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.foto_url} alt={e.titulo} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-10 h-10 text-white/80 fill-none" />
          </div>
        )}
        <span className="absolute top-2 left-2 rounded-full bg-white/95 text-stone-900 text-xs font-bold px-2.5 py-1 shadow">
          {agotado ? "Agotado" : e.quedan != null && e.quedan <= 5 ? `¡Quedan ${e.quedan}!` : "Especial de hoy"}
        </span>
        {e.precio ? (
          <span
            className="absolute bottom-2 right-2 rounded-full text-white text-sm font-extrabold px-3 py-1 shadow"
            style={{ background: primario }}
          >
            {formatoPrecio(e.precio)}
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <p className="font-bold leading-tight line-clamp-2 text-stone-900 dark:text-stone-100 group-hover:underline underline-offset-4">
          {e.titulo}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 min-w-0">
          <span className="w-5 h-5 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
            {e.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.logo_url} alt="" loading="lazy" className="w-full h-full object-cover" />
            )}
          </span>
          <span className="truncate">{e.negocio}{e.ciudad ? ` · ${e.ciudad}` : ""}</span>
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500 dark:text-stone-400">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3 fill-none" /> Hasta las {horaLegible(e.expira_en)}
          </span>
          {e.domicilio && (
            <span className="inline-flex items-center gap-1">
              <Bike className="w-3 h-3 fill-none" /> Domicilio
            </span>
          )}
          {abierto !== null && (
            <span className={abierto ? "text-green-700 dark:text-green-400 font-semibold" : ""}>
              {abierto ? "Abierto ahora" : "Cerrado"}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
