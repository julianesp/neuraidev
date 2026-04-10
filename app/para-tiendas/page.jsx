import Link from "next/link";
import { getSupabaseClient } from "@/lib/db";
import {
  Store,
  Package,
  CheckCircle,
  TrendingUp,
  ShoppingCart,
  Zap,
  Users,
  ArrowRight,
  MapPin,
} from "lucide-react";

export const metadata = {
  title: "Vende en Neurai | Espacio para Tiendas",
  description:
    "Consigue tu espacio de venta en Neurai. Tu tienda lista, activa y publicando productos desde el primer día.",
};

const BENEFICIOS = [
  {
    icon: Zap,
    titulo: "Activo desde el primer día",
    descripcion:
      "Tu perfil ya está configurado. Accede y empieza a publicar productos que quedan visibles de inmediato.",
  },
  {
    icon: Package,
    titulo: "Gestión completa de productos",
    descripcion:
      "Publica, edita y gestiona tu catálogo completo con imágenes, precios, stock y categorías.",
  },
  {
    icon: ShoppingCart,
    titulo: "Recibe pedidos",
    descripcion:
      "Tus clientes hacen sus pedidos en línea. Tú los ves en tiempo real en tu panel.",
  },
  {
    icon: TrendingUp,
    titulo: "Estadísticas en tiempo real",
    descripcion:
      "Ve tus ventas, ganancias y productos más populares en tu dashboard personalizado.",
  },
  {
    icon: Users,
    titulo: "Gestión de clientes",
    descripcion:
      "Mantén un registro de tus clientes, historial de compras y fidelización.",
  },
  // {
  //   icon: CheckCircle,
  //   titulo: "Sin complicaciones de pago",
  //   descripcion:
  //     "Los pagos en línea los gestiona Neurai. Tú solo te enfocas en vender.",
  // },
];

const PASOS = [
  { numero: "01", titulo: "Regístrate", descripcion: "Crea tu cuenta en menos de un minuto." },
  { numero: "02", titulo: "Configura tu tienda", descripcion: "Dinos el nombre, categoría y descripción." },
  { numero: "03", titulo: "Publica y vende", descripcion: "Tus productos quedan activos inmediatamente." },
];

async function getTiendas() {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("tiendas")
      .select("id, nombre, descripcion, categoria, ciudad, logo_url")
      .eq("activa", true)
      .eq("onboarding_completado", true)
      .order("created_at", { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

export default async function ParaTiendasPage() {
  const tiendas = await getTiendas();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Tu tienda lista para vender.<br />
            <span className="text-blue-200">Desde el primer día.</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Entramos, configuramos tu espacio, y solo necesitas acceder para empezar a publicar. Sin complicaciones, sin esperas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/para-tiendas/registro"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-colors text-lg"
            >
              Comenzar gratis <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-in?redirect_url=/tienda/dashboard"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/10 transition-colors text-lg"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Así de simple
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PASOS.map((paso) => (
              <div key={paso.numero} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white text-xl font-bold rounded-2xl mb-4">
                  {paso.numero}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{paso.titulo}</h3>
                <p className="text-gray-500">{paso.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Todo lo que necesitas para vender
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Tu panel incluye todo lo que una tienda necesita. Sin costos ocultos, sin configuraciones complicadas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFICIOS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.titulo}
                  className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{b.titulo}</h3>
                  <p className="text-gray-500 text-sm">{b.descripcion}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nota sobre pagos */}
      {/* <section className="py-12 px-4 bg-yellow-50 border-y border-yellow-200">
        <div className="max-w-3xl mx-auto text-center">
          <CheckCircle className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Los pagos en línea son nuestro trabajo
          </h3>
          <p className="text-gray-600">
            El procesamiento de pagos con tarjeta y pasarelas de pago es gestionado directamente por Neurai. Tú publicas, nosotros nos encargamos del cobro en línea. Así de sencillo.
          </p>
        </div>
      </section> */}

      {/* Tiendas registradas */}
      {tiendas.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Tiendas que ya venden aquí
              </h2>
              <p className="text-gray-500">
                {tiendas.length} {tiendas.length === 1 ? "tienda registrada" : "tiendas registradas"} en Neurai
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {tiendas.map((tienda) => {
                const slug = tienda.nombre
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "");
                return (
                  <Link
                    key={tienda.id}
                    href={`/tiendas/${slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {tienda.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={tienda.logo_url} alt={tienda.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {tienda.nombre}
                        </h3>
                        {tienda.ciudad && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="w-3 h-3" /> {tienda.ciudad}
                          </span>
                        )}
                      </div>
                    </div>
                    {tienda.descripcion && (
                      <p className="text-xs text-gray-500 line-clamp-2 flex-1">
                        {tienda.descripcion}
                      </p>
                    )}
                    {tienda.categoria && (
                      <span className="mt-3 inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">
                        {tienda.categoria}
                      </span>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                      Ver tienda <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Regístrate ahora y en minutos tienes tu tienda activa.
          </p>
          <Link
            href="/para-tiendas/registro"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold py-4 px-10 rounded-xl hover:bg-blue-50 transition-colors text-lg"
          >
            Crear mi tienda gratis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
