import Link from "next/link";
import { BarChart3, Camera, Clock, MapPin, MessageCircle, Search, Check } from "lucide-react";
import { FOTOS_GRATIS, FOTOS_PLAN, OFERTAS_GRATIS, OFERTAS_PLAN, PLANES, TRIAL_DIAS, pesos } from "@/lib/directorio/planes";

export const metadata = {
  title: "Publica tu negocio en el directorio del Putumayo",
  description:
    "Que te encuentren los clientes del Putumayo: ficha con fotos, WhatsApp directo, mapa y horario. Publica tu negocio gratis y mira cuántos te contactan.",
  alternates: { canonical: "/directorio/publicar" },
};

const BENEFICIOS = [
  { Icono: Search, titulo: "Te encuentran", texto: "Aparece cuando buscan por municipio o categoría: droguerías en Sibundoy, hoteles en Colón, restaurantes en Mocoa…" },
  { Icono: MessageCircle, titulo: "WhatsApp directo", texto: "Un toque y el cliente te escribe con el mensaje listo. Sin intermediarios ni comisiones." },
  { Icono: MapPin, titulo: "Mapa de Google", texto: "Tu ubicación exacta con el botón “Cómo llegar”, para que nadie se pierda de camino a tu local." },
  { Icono: Clock, titulo: "Horario y ofertas", texto: "Muestra tu horario por día con la insignia “Abierto ahora” y publica ofertas con fecha que ve todo el que entra al directorio." },
  { Icono: Camera, titulo: "Fotos de tu negocio", texto: "Muestra tu local, tus productos o tus trabajos con una galería que se amplía al tocarla." },
  { Icono: BarChart3, titulo: "Mira tus resultados", texto: "Cuántas personas vieron tu ficha, te escribieron, quisieron llamarte o pidieron cómo llegar." },
];

const PASOS = [
  { n: "1", titulo: "Crea tu cuenta", texto: "Entra con Google en un minuto." },
  { n: "2", titulo: "Llena tu ficha", texto: "Nombre, categoría, WhatsApp, fotos, horario y ubicación en el mapa." },
  { n: "3", titulo: "Te publicamos", texto: "Revisamos tu ficha y queda visible para todo el Putumayo." },
];

const PREGUNTAS = [
  { p: "¿Tiene costo publicar?", r: `Publicar tu ficha es gratis, con hasta ${FOTOS_GRATIS} fotos. Si quieres hasta ${FOTOS_PLAN} fotos puedes activar un plan, y los primeros ${TRIAL_DIAS} días los pruebas sin pagar.` },
  { p: "¿Necesito tarjeta para empezar?", r: "No. Para publicar solo necesitas una cuenta de Google. Pagas únicamente si decides activar el plan de más fotos." },
  { p: "¿Cuánto tarda en publicarse?", r: "Revisamos cada ficha para mantener el directorio confiable. Apenas la aprobamos queda visible." },
  { p: "¿Puedo editar mi ficha después?", r: "Sí, cuando quieras: cambiar fotos, horario, teléfono o ubicación. Los cambios de datos simples se ven de inmediato." },
  { p: "¿Qué pasa si no renuevo el plan?", r: `Tu negocio sigue publicado. Solo se muestran ${FOTOS_GRATIS} fotos; las demás se guardan y reaparecen cuando renueves.` },
  { p: "¿Puedo tener más de un negocio?", r: "Sí, hasta 5 por cuenta." },
];

export default function PublicarPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-24 sm:pt-28">
      {/* Hero */}
      <section className="text-center">
        <p className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
          Directorio de negocios del Putumayo
        </p>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl">
          Que todo el Putumayo
          <br />
          encuentre tu negocio
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Tiendas, restaurantes, talleres, hoteles y servicios en un solo lugar. Tus clientes te escriben por
          WhatsApp en un toque.
        </p>
        <Link
          href="/directorio/mis-negocios"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold !text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:scale-110 hover:bg-blue-700 hover:shadow-2xl hover:ring-4 hover:ring-blue-300 active:scale-100"
        >
          Publicar mi negocio gratis
        </Link>
        <p className="mt-3 text-sm text-gray-500">Sin tarjeta · Listo en unos minutos</p>
        <Link href="/directorio/neurai-colon" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
          Mira un ejemplo de ficha →
        </Link>
      </section>

      {/* Beneficios */}
      <section className="mt-16" aria-labelledby="h-beneficios">
        <h2 id="h-beneficios" className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Todo lo que tu negocio gana
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFICIOS.map(({ Icono, titulo, texto }) => (
            <div key={titulo} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <span className="inline-flex rounded-lg bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-900/40">
                <Icono className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{titulo}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pasos */}
      <section className="mt-16" aria-labelledby="h-pasos">
        <h2 id="h-pasos" className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Publica en 3 pasos
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {PASOS.map((p) => (
            <li key={p.n} className="rounded-xl bg-blue-50 p-5 dark:bg-blue-900/20">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white">{p.n}</span>
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{p.titulo}</h3>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Planes */}
      <section className="mt-16" aria-labelledby="h-planes">
        <h2 id="h-planes" className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Empieza gratis, crece cuando quieras
        </h2>
        <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
          Publicar es gratis. Con el plan muestras más fotos y publicas más ofertas.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">Gratis</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {[`Ficha completa con hasta ${FOTOS_GRATIS} fotos`, "WhatsApp, mapa y horario", `${OFERTAS_GRATIS} oferta vigente a la vez`, "Estadísticas de tu ficha"].map((t) => (
                <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-blue-600 bg-white p-6 shadow-lg dark:bg-gray-900">
            <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white">{TRIAL_DIAS} días de prueba gratis</span>
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">Plan mensual</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {pesos(PLANES.mensual.precio)}<span className="text-base font-normal text-gray-500"> /mes</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {[`Hasta ${FOTOS_PLAN} fotos en tu galería`, `Hasta ${OFERTAS_PLAN} ofertas vigentes a la vez`, "Todo lo del plan gratis"].map((t) => (
                <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
              Ahorras {pesos(PLANES.mensual.precio * 6 - PLANES.semestral.precio)}
            </span>
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">6 meses</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {pesos(PLANES.semestral.precio)}<span className="text-base font-normal text-gray-500"> /6 meses</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {[`Hasta ${FOTOS_PLAN} fotos y ${OFERTAS_PLAN} ofertas a la vez`, "Un solo pago, medio año tranquilo", "Equivale a unos $8.300 al mes"].map((t) => (
                <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Preguntas */}
      <section className="mt-16" aria-labelledby="h-preguntas">
        <h2 id="h-preguntas" className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Preguntas frecuentes
        </h2>
        <div className="mx-auto max-w-3xl divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
          {PREGUNTAS.map((q) => (
            <details key={q.p} className="group p-4">
              <summary className="cursor-pointer list-none font-medium text-gray-900 dark:text-white">
                <span className="flex items-center justify-between gap-3">
                  {q.p}
                  <span className="text-blue-600 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{q.r}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cierre */}
      <section className="mt-16 rounded-2xl bg-blue-600 px-6 py-10 text-center">
        <h2 className="text-2xl font-bold !text-white sm:text-3xl">Tus clientes ya están buscando en el Putumayo</h2>
        <p className="mt-2 !text-blue-100">Que te encuentren a ti.</p>
        <Link
          href="/directorio/mis-negocios"
          className="mt-6 inline-flex rounded-xl bg-white px-8 py-4 text-lg font-bold !text-blue-700 shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-2xl"
        >
          Publicar mi negocio gratis
        </Link>
      </section>
    </main>
  );
}
