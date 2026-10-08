import Link from "next/link";
import { Wallet, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Herramientas gratuitas",
  description:
    "Herramientas gratuitas de neurai.dev para organizar tu día a día, como el presupuesto personal mensual.",
  alternates: { canonical: "/herramientas" },
};

const herramientas = [
  {
    href: "/herramientas/presupuesto",
    nombre: "Presupuesto",
    descripcion:
      "Registra tu sueldo, lo que vas a ganar y tus gastos para saber cuánto te queda cada mes.",
    icono: <Wallet className="w-7 h-7" />,
    color: "from-emerald-500 to-blue-600",
  },
];

export default function HerramientasPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Herramientas
        </h1>
        <p className="mt-2 mb-8 text-gray-600 dark:text-gray-300 max-w-2xl">
          Herramientas gratuitas para organizarte. No necesitas crear una
          cuenta: tus datos se guardan en tu navegador.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {herramientas.map((h) => (
            <Link
              key={h.href}
              href={h.href}
              className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${h.color} text-white mb-4`}
              >
                {h.icono}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {h.nombre}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {h.descripcion}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                Abrir <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
