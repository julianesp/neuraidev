"use client";

import { useCart } from "@/context/CartContext";
import { textoPromocion } from "@/lib/promociones";

// En la ficha del producto: promociones vigentes en las que participa
// ("Llevando 5 o más: 10% de descuento"). El descuento se aplica solo en el carrito.
export default function AvisoPromocion({ producto }) {
  const { promociones } = useCart();
  const id = String(producto?.id || "");
  const textos = (promociones || [])
    .filter((p) => (p.productos_ids || []).map(String).includes(id))
    .map((p) => ({ id: p.id, texto: textoPromocion(p), hasta: p.fecha_fin }))
    .filter((p) => p.texto);

  if (textos.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {textos.map((p) => (
        <div
          key={p.id}
          className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3"
        >
          <p className="font-bold text-blue-700 dark:text-blue-300">🔥 {p.texto}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            El descuento se aplica automáticamente en el carrito
            {p.hasta &&
              ` · hasta el ${new Date(p.hasta).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
                timeZone: "America/Bogota",
              })}`}
            .
          </p>
        </div>
      ))}
    </div>
  );
}
