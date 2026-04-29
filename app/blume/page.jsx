import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import AdminButton from "./AdminButton";

export const metadata = {
  title: "Blume — Decoraciones y adornos manuales",
  description:
    "Floreros, adornos y decoraciones hechos a mano. Creaciones únicas con materiales de calidad. Pedidos personalizados.",
  icons: {
    icon: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo%20Helena.jpeg",
    apple: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo%20Helena.jpeg",
  },
};

async function getPublicaciones() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data, error } = await supabase
    .from("blume_publicaciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

export default async function BlumePage() {
  const publicaciones = await getPublicaciones();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="relative py-14 px-4 text-center" style={{ background: "linear-gradient(135deg, #0070f3, #0050c8)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-4">🌸</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Blume</h1>
          <p className="text-blue-100 text-lg md:text-xl">
            Adornos y decoraciones hechos a mano
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            Pedidos personalizados disponibles
          </div>
        </div>
        <div className="absolute top-16 left-4">
          <AdminButton />
        </div>
      </section>

      {/* Publicaciones */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        {publicaciones.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <div className="text-5xl mb-4">🌺</div>
            <p className="text-lg">Próximamente nuevas creaciones</p>
          </div>
        ) : (
          <div className="space-y-4">
            {publicaciones.map((pub) => (
              <PublicacionCard key={pub.id} pub={pub} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const WHATSAPP_NUMBER = "573219728044";

function PublicacionCard({ pub }) {
  const fecha = new Date(pub.created_at).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const imagenes = pub.imagenes_urls?.length ? pub.imagenes_urls : pub.imagen_url ? [pub.imagen_url] : [];
  const whatsappMsg = encodeURIComponent(`Hola, me interesa este adorno de Blume: "${pub.titulo}"`);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 flex gap-3 p-3">
      {imagenes.length === 1 ? (
        <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
          <Image src={imagenes[0]} alt={pub.titulo} fill className="object-cover" sizes="112px" />
        </div>
      ) : imagenes.length > 1 ? (
        <div className="grid grid-cols-2 gap-0.5 w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
          {imagenes.slice(0, 4).map((url, idx) => (
            <div key={idx} className="relative">
              <Image src={url} alt={`${pub.titulo} ${idx + 1}`} fill className="object-cover" sizes="56px" />
              {idx === 3 && imagenes.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+{imagenes.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">{fecha}</p>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">{pub.titulo}</h2>
          {pub.descripcion && (
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2">{pub.descripcion}</p>
          )}
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors self-start"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Pedir por WhatsApp
        </a>
      </div>
    </article>
  );
}
