import { ShoppingCart } from "lucide-react";
import { pesos } from "@/lib/directorio/planes";
import EnlaceRastreado from "./EnlaceRastreado";

// Catálogo público del negocio: cada producto con foto, nombre, precio y botón "Lo quiero"
// que abre WhatsApp con el mensaje del pedido ya escrito.
export default function CatalogoFicha({ productos, negocio }) {
  const enlacePedido = (p) => {
    const precio = p.precio ? ` (${pesos(p.precio)})` : "";
    const lineas = [
      `Hola, quiero pedir: ${p.nombre}${precio} de ${negocio.nombre}.`,
      p.imagen_url || "",
      `Lo vi en https://neurai.dev/directorio/${negocio.slug}`,
    ].filter(Boolean);
    return `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(lineas.join("\n\n"))}`;
  };

  return (
    <section className="mt-8" aria-labelledby="h-catalogo">
      <h2 id="h-catalogo" className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <ShoppingCart className="h-5 w-5 text-blue-600" /> Catálogo
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {productos.map((p) => (
          <article
            key={p.id}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
              {p.imagen_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imagen_url}
                  alt={p.nombre}
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover ${p.disponible ? "" : "opacity-50"}`}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl font-bold text-blue-600/30">
                  {p.nombre.charAt(0).toUpperCase()}
                </div>
              )}
              {!p.disponible && (
                <span className="absolute left-2 top-2 rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-bold text-white">
                  Agotado
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">{p.nombre}</h3>
              {p.descripcion && <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{p.descripcion}</p>}
              <p className="mt-auto pt-1 text-base font-bold text-blue-600">
                {p.precio ? pesos(p.precio) : <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Consultar precio</span>}
              </p>
              {p.disponible && negocio.whatsapp ? (
                <EnlaceRastreado
                  negocioId={negocio.id}
                  tipo="whatsapp"
                  href={enlacePedido(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold !text-white transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-lg"
                >
                  <ShoppingCart className="h-4 w-4" /> Lo quiero
                </EnlaceRastreado>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
