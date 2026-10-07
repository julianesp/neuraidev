import Link from "next/link";
import { Clock, MessageCircle, Smartphone, UtensilsCrossed } from "lucide-react";
import { getNegociosPublicados } from "@/lib/fastfoods/data";
import { estaAbierto } from "@/lib/fastfoods/utils";

// Lista quién está abierto y quién tiene especial ahora: sin caché.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Negocios de comidas | Menú, especial del día y pedidos por WhatsApp",
  description:
    "Comidas rápidas cerca de ti: mira el especial de hoy y pide por WhatsApp. ¿Tienes un negocio de comidas? Crea su página gratis en neurai.dev.",
  alternates: { canonical: "https://neurai.dev/fastfoods" },
};

const BENEFICIOS = [
  { icono: Clock, titulo: "Especial del día", texto: "Súbelo en un minuto y desaparece solo a la hora que digas." },
  { icono: MessageCircle, titulo: "Pedidos por WhatsApp", texto: "Tus clientes arman el pedido y te llega listo a tu WhatsApp." },
  { icono: Smartphone, titulo: "Todo desde el celular", texto: "Menú, precios, fotos y horario, sin saber de páginas web." },
];

export default async function FastfoodsPage() {
  const negocios = await getNegociosPublicados().catch((e) => {
    console.error("[fastfoods] directorio", e);
    return [];
  });

  return (
    <div className="min-h-screen bg-orange-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <section className="max-w-5xl mx-auto px-4 pt-28 pb-12 sm:pt-32">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
          Para negocios de comidas
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-balance max-w-3xl">
          La página de tu negocio, con pedidos por WhatsApp
        </h1>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-300 max-w-2xl text-pretty">
          Publica tu menú y el especial de esta noche, comparte el enlace en tus grupos y recibe
          los pedidos armados. Entras con tu cuenta de Google y queda publicada al instante.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/mi-negocio"
            className="inline-flex items-center justify-center rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-3.5 text-lg transition-colors"
          >
            Crear la página de mi negocio
          </Link>
          <Link
            href="/mi-negocio"
            className="inline-flex items-center justify-center rounded-2xl border border-stone-300 dark:border-stone-700 font-semibold px-6 py-3.5 text-lg"
          >
            Ya tengo mi negocio: administrarlo
          </Link>
          {negocios.length > 0 && (
            <a
              href="#negocios"
              className="inline-flex items-center justify-center rounded-2xl border border-stone-300 dark:border-stone-700 font-semibold px-6 py-3.5 text-lg"
            >
              Ver negocios
            </a>
          )}
        </div>

        <ul className="mt-10 grid sm:grid-cols-3 gap-4">
          {BENEFICIOS.map(({ icono: Icono, titulo, texto }) => (
            <li key={titulo} className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5">
              <Icono className="w-6 h-6 text-rose-600 dark:text-rose-400 fill-none" />
              <h2 className="mt-3 font-bold">{titulo}</h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {negocios.length > 0 && (
        <section id="negocios" className="max-w-5xl mx-auto px-4 pb-20 scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">Negocios</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {negocios.map((n) => {
              const abierto = estaAbierto(n.horario);
              return (
                <li key={n.id}>
                  <Link
                    href={`/fastfoods/${n.slug}`}
                    className="group block rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-28" style={{ background: n.tema.colorPrimario }}>
                      {n.portada_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.portada_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                      )}
                      {n.especiales > 0 && (
                        <span className="absolute top-2 left-2 rounded-full bg-white text-rose-600 text-xs font-bold px-2.5 py-1 shadow">
                          Especial hoy
                        </span>
                      )}
                    </div>
                    <div className="relative p-4 pt-9">
                      <div className="absolute -top-7 left-4 w-14 h-14 rounded-2xl overflow-hidden border-4 border-white dark:border-stone-900 bg-orange-50 dark:bg-stone-800 flex items-center justify-center">
                        {n.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={n.logo_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <UtensilsCrossed className="w-6 h-6 fill-none" style={{ color: n.tema.colorPrimario }} />
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold leading-tight group-hover:underline underline-offset-4">{n.nombre}</h3>
                        {abierto !== null && (
                          <span
                            className={`flex-shrink-0 text-xs font-semibold rounded-full px-2 py-0.5 ${
                              abierto
                                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                            }`}
                          >
                            {abierto ? "Abierto" : "Cerrado"}
                          </span>
                        )}
                      </div>
                      {(n.descripcion || n.ciudad) && (
                        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                          {[n.ciudad, n.descripcion].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
