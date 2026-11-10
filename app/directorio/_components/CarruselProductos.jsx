import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const precio = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

// Fila de productos de la tienda que transita continuamente.
// Se detiene al pasar el mouse (o el foco) por encima.
export default function CarruselProductos({ productos }) {
  const veces = Math.max(1, Math.ceil(8 / productos.length));
  const bloque = Array.from({ length: veces }, () => productos).flat();
  const segundos = Math.max(30, bloque.length * 5);

  const tarjeta = (p, clave, oculto) => (
    <Link
      key={clave}
      href={p.href}
      aria-hidden={oculto || undefined}
      tabIndex={oculto ? -1 : undefined}
      className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-blue-600 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="aspect-square bg-gray-100 dark:bg-gray-800">
        {p.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imagen} alt={p.nombre} loading="lazy" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-gray-100">
          {p.nombre}
        </p>
        <p className="mt-1 text-sm font-bold text-blue-600">{precio(p.precio)}</p>
        <span className="mt-1.5 inline-block rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">
          Ver
        </span>
      </div>
    </Link>
  );

  return (
    <section className="mt-14" aria-labelledby="h-productos">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2
          id="h-productos"
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
        >
          <ShoppingBag className="h-5 w-5 text-blue-600" /> Productos de neurai.dev
        </h2>
        <Link href="/accesorios" className="text-sm font-medium text-blue-600 hover:underline">
          Ver toda la tienda →
        </Link>
      </div>
      <style>{`
        @keyframes prod-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .prod-marquee-pista { animation: prod-marquee ${segundos}s linear infinite; }
        .prod-marquee:hover .prod-marquee-pista, .prod-marquee:focus-within .prod-marquee-pista { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .prod-marquee-pista { animation: none; } .prod-marquee { overflow-x: auto; } }
      `}</style>
      <div className="prod-marquee overflow-hidden">
        <div className="prod-marquee-pista flex w-max gap-3">
          {bloque.map((p, i) => tarjeta(p, `a-${i}`, false))}
          {bloque.map((p, i) => tarjeta(p, `b-${i}`, true))}
        </div>
      </div>
    </section>
  );
}
