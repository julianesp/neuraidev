import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import FacebookComments from "./FacebookComments";
import AdminButton from "./AdminButton";

export const metadata = {
  title: "Pollos Colón — Venta de pollos encubados a domicilio",
  description:
    "Venta de pollos encubados con entrega a domicilio. Consulta disponibilidad, precios y realiza tu pedido.",
};

async function getPublicaciones() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data, error } = await supabase
    .from("pollos_colon_publicaciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

export default async function PollosColonPage() {
  const publicaciones = await getPublicaciones();

  return (
    <main className="min-h-screen bg-amber-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-500 to-amber-600 py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-4">🐔</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Pollos Colón
          </h1>
          <p className="text-yellow-100 text-lg md:text-xl">
            Venta de pollos encubados — Entrega a domicilio
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            Pedidos con entrega a domicilio
          </div>
          <div className="mt-3">
            <AdminButton />
          </div>
        </div>
      </section>

      {/* Publicaciones */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        {publicaciones.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <div className="text-5xl mb-4">🥚</div>
            <p className="text-lg">Próximamente nuevas publicaciones</p>
          </div>
        ) : (
          <div className="space-y-8">
            {publicaciones.map((pub) => (
              <PublicacionCard key={pub.id} pub={pub} />
            ))}
          </div>
        )}
      </section>

      {/* Sección de comentarios Facebook */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Comentarios
        </h2>
        <FacebookComments />
      </section>
    </main>
  );
}

function PublicacionCard({ pub }) {
  const fecha = new Date(pub.created_at).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-amber-100 dark:border-gray-700">
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={pub.imagen_url}
          alt={pub.titulo}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 672px"
        />
      </div>
      <div className="p-5">
        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
          {fecha}
        </p>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {pub.titulo}
        </h2>
        {pub.descripcion && (
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {pub.descripcion}
          </p>
        )}
      </div>
    </article>
  );
}
