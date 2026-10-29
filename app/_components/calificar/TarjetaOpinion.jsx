import { Star, Quote, ShoppingBag } from "lucide-react";

// Facebook "f" (sin dependencias extra)
function IconoFacebook({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function leerProductos(json) {
  try {
    const lista = JSON.parse(json || "[]");
    return Array.isArray(lista) ? lista.filter((p) => p?.imagen) : [];
  } catch {
    return [];
  }
}

/**
 * Foto del cliente con los productos que compró girando a su alrededor, cada
 * uno en un círculo. La órbita gira y cada imagen gira al revés para seguir
 * derecha. Se pausa al pasar el mouse; sin animación con "reducir movimiento".
 */
function FotoConProductos({ foto, inicial, nombre, productos }) {
  const radio = 50; // px desde el centro hasta cada círculo
  return (
    <div className="group relative w-[136px] h-[136px] shrink-0">
      {/* Anillo guía */}
      <div className="absolute inset-[18px] rounded-full border border-dashed border-blue-200 dark:border-blue-900" />
      <div className="absolute inset-0 rounded-full animate-[orbita_24s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {productos.map((p, i) => {
          const angulo = (360 / productos.length) * i;
          return (
            <div
              key={p.id}
              className="absolute left-1/2 top-1/2 -ml-[17px] -mt-[17px]"
              style={{ transform: `rotate(${angulo}deg) translateY(-${radio}px) rotate(-${angulo}deg)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imagen}
                alt={p.nombre}
                title={p.nombre}
                loading="lazy"
                className="w-[34px] h-[34px] rounded-full object-cover bg-white border-2 border-white dark:border-gray-800 shadow-md ring-1 ring-blue-600/30 animate-[contraorbita_24s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
              />
            </div>
          );
        })}
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt={`Foto de ${nombre}`}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 shadow"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow">
            {inicial}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Opinión aprobada de un cliente: foto de Facebook (si autorizó), estrellas,
 * comentario, nombre y botón para escribirle en Facebook.
 */
export default function TarjetaOpinion({ opinion }) {
  const o = opinion;
  const inicial = (o.cliente_nombre || "?").trim().charAt(0).toUpperCase();
  const productos = leerProductos(o.productos_json);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        {productos.length > 0 ? (
          <FotoConProductos
            foto={o.avatar_url}
            inicial={inicial}
            nombre={o.cliente_nombre}
            productos={productos}
          />
        ) : o.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={o.avatar_url}
            alt={`Foto de ${o.cliente_nombre}`}
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-600 shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
            {inicial}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">
            {o.cliente_nombre}
          </p>
          {o.calificacion > 0 && (
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4"
                  fill={i < o.calificacion ? "currentColor" : "none"}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Quote className="w-6 h-6 text-blue-200 dark:text-blue-900 mb-1" />
      <p className="text-gray-700 dark:text-gray-300 italic flex-1">
        &ldquo;{o.mensaje}&rdquo;
      </p>

      {o.producto_relacionado && (
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-3">
          <ShoppingBag className="w-3 h-3" />
          {o.producto_relacionado}
        </p>
      )}

      {o.facebook_url && (
        <a
          href={o.facebook_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-4 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <IconoFacebook className="w-4 h-4" />
          Escríbele en Facebook
        </a>
      )}
    </div>
  );
}
