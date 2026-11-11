import Link from "next/link";
import { Eye } from "lucide-react";
import { nombreCategoria, nombreMunicipio } from "@/lib/directorio/constantes";

// Fila de los negocios más visitados que se desplaza hacia la derecha.
// Al pasar el mouse (o tocar) sobre la fila se detiene.
export default function CarruselVisitados({ negocios }) {
  // Se repite hasta tener suficientes tarjetas para llenar la pantalla,
  // y se duplica el bloque para que el bucle sea continuo.
  // Con pocos negocios no se anima ni se repite: cada uno sale una sola vez.
  // El movimiento continuo solo tiene sentido cuando hay suficientes para llenar la fila.
  const animado = negocios.length >= 5;
  const bloque = negocios;
  const segundos = Math.max(20, bloque.length * 4);

  const tarjeta = (n, clave, oculto) => {
    const img = n.fotos?.[0] || n.logo_url;
    return (
      <Link
        key={clave}
        href={`/directorio/${n.slug}`}
        aria-hidden={oculto || undefined}
        tabIndex={oculto ? -1 : undefined}
        className="group flex w-64 shrink-0 gap-3 rounded-xl border border-gray-200 bg-white p-2 hover:border-blue-600 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xl font-bold text-blue-600/40">
              {n.nombre.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100">
            {n.nombre}
          </p>
          <p className="truncate text-xs text-gray-600 dark:text-gray-400">{nombreCategoria(n.categoria)}</p>
          <p className="truncate text-xs text-gray-500">{nombreMunicipio(n.municipio)}</p>
        </div>
      </Link>
    );
  };

  return (
    <section className="mt-10" aria-labelledby="h-visitados">
      <h2
        id="h-visitados"
        className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
      >
        <Eye className="h-5 w-5 text-blue-600" /> Los más visitados
      </h2>
      <style>{`
        @keyframes dir-marquee-derecha { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .dir-marquee-pista { animation: dir-marquee-derecha ${segundos}s linear infinite; }
        .dir-marquee:hover .dir-marquee-pista, .dir-marquee:focus-within .dir-marquee-pista { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .dir-marquee-pista { animation: none; } .dir-marquee { overflow-x: auto; } }
      `}</style>
      {animado ? (
        <div className="dir-marquee overflow-hidden">
          <div className="dir-marquee-pista flex w-max gap-3">
            {bloque.map((n, i) => tarjeta(n, `a-${i}`, false))}
            {bloque.map((n, i) => tarjeta(n, `b-${i}`, true))}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">{bloque.map((n, i) => tarjeta(n, `u-${i}`, false))}</div>
      )}
    </section>
  );
}
