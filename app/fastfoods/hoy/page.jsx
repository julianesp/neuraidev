import Link from "next/link";
import { getCiudades, getEspecialesDeHoy } from "@/lib/fastfoods/pedidos";
import TarjetaHoy from "@/app/fastfoods/_components/TarjetaHoy";

// Los especiales vencen a la hora que diga cada negocio: sin caché.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "¿Qué hay para comer hoy? | Especiales de comidas rápidas",
  description:
    "Los especiales de esta noche de los negocios de comidas cerca de ti, con precio, porciones y pedidos en línea.",
  alternates: { canonical: "https://neurai.dev/fastfoods/hoy" },
};

export default async function HoyPage({ searchParams }) {
  const { ciudad: ciudadParam } = await searchParams;
  const [ciudades, especiales] = await Promise.all([
    getCiudades().catch(() => []),
    getEspecialesDeHoy({ ciudad: ciudadParam || null }).catch((e) => {
      console.error("[fastfoods] hoy", e);
      return [];
    }),
  ]);
  const ciudad = ciudades.find((c) => c.toLowerCase() === (ciudadParam || "").toLowerCase()) || null;

  return (
    <div className="min-h-screen bg-orange-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-20 sm:pt-32">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
          ¿Qué hay para comer hoy{ciudad ? ` en ${ciudad}` : ""}?
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Los especiales de hoy de los negocios de comidas. Pide en línea y paga al recibir.
        </p>

        {ciudades.length > 1 && (
          <nav aria-label="Filtrar por ciudad" className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {[null, ...ciudades].map((c) => {
              const activa = (c || null) === ciudad;
              return (
                <Link
                  key={c || "todas"}
                  href={c ? `/fastfoods/hoy?ciudad=${encodeURIComponent(c)}` : "/fastfoods/hoy"}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium border ${
                    activa
                      ? "bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900 dark:border-white"
                      : "border-stone-300 dark:border-stone-700"
                  }`}
                >
                  {c || "Todas"}
                </Link>
              );
            })}
          </nav>
        )}

        {especiales.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 p-8 text-center">
            <p className="font-semibold">Todavía no hay especiales publicados hoy{ciudad ? ` en ${ciudad}` : ""}.</p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Vuelve más tarde o mira{" "}
              <Link href="/fastfoods#negocios" className="underline underline-offset-4">
                todos los negocios
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {especiales.map((e) => (
              <li key={e.id}>
                <TarjetaHoy e={e} />
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-center text-sm text-stone-600 dark:text-stone-400">
          ¿Tienes un negocio de comidas?{" "}
          <Link href="/fastfoods" className="font-semibold underline underline-offset-4">
            Publica tus especiales gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
