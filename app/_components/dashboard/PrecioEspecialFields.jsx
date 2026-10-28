"use client";

import { calcularPrecioVigente } from "@/lib/precios";

const input =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white";
const label = "block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300";

/**
 * Campos del dashboard para el precio especial de un producto:
 *   oferta_tipo  ''|'oferta'|'lanzamiento'   (metadata)
 *   precio_oferta                             (columna products.precio_oferta)
 *   oferta_hasta 'YYYY-MM-DD' opcional        (metadata)
 * La lógica de cuándo aplica vive en lib/precios.js (la misma que usa el checkout).
 */
export default function PrecioEspecialFields({ formData, setFormData }) {
  const set = (campo) => (e) =>
    setFormData((prev) => ({ ...prev, [campo]: e.target.value }));

  const tipo = formData.oferta_tipo || "";
  const precio = parseFloat(formData.precio) || 0;
  const especial = parseFloat(formData.precio_oferta) || 0;

  let aviso = null;
  if (tipo) {
    if (!especial) aviso = "Escribe el precio especial.";
    else if (especial >= precio) aviso = "El precio especial debe ser menor que el precio normal.";
    else {
      const v = calcularPrecioVigente({
        id: "x",
        precio,
        precio_oferta: especial,
        metadata: { oferta_tipo: tipo, oferta_hasta: formData.oferta_hasta || null },
      });
      aviso = v.tipo
        ? `✅ Los clientes verán $${especial.toLocaleString("es-CO")} (antes $${precio.toLocaleString("es-CO")}, -${Math.round((1 - especial / precio) * 100)}%) y pagarán ese precio.`
        : "⚠️ La fecha ya pasó: se está cobrando el precio normal.";
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        Precio especial
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Oferta o precio de lanzamiento. Se muestra tachado el precio normal y en
        el pago se cobra el precio especial. Al pasar la fecha vuelve solo al
        precio normal.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="oferta_tipo" className={label}>
            Tipo
          </label>
          <select
            id="oferta_tipo"
            value={tipo}
            onChange={set("oferta_tipo")}
            className={input}
          >
            <option value="">Sin precio especial</option>
            <option value="lanzamiento">🚀 Precio de lanzamiento</option>
            <option value="oferta">🔥 Oferta</option>
          </select>
        </div>
        <div>
          <label htmlFor="precio_oferta" className={label}>
            Precio especial
          </label>
          <input
            id="precio_oferta"
            type="number"
            min="0"
            step="100"
            disabled={!tipo}
            value={formData.precio_oferta}
            onChange={set("precio_oferta")}
            className={`${input} disabled:opacity-50`}
          />
        </div>
        <div>
          <label htmlFor="oferta_hasta" className={label}>
            Válido hasta (opcional)
          </label>
          <input
            id="oferta_hasta"
            type="date"
            disabled={!tipo}
            value={formData.oferta_hasta || ""}
            onChange={set("oferta_hasta")}
            className={`${input} disabled:opacity-50`}
          />
        </div>
      </div>
      {aviso && <p className="text-sm mt-3 text-gray-700 dark:text-gray-300">{aviso}</p>}
    </div>
  );
}

// Para productos de la categoría "servicios": en qué categorías se ofrece en combo.
export const CATEGORIAS_PRODUCTO = ["celulares", "computadoras", "generales"];

export function ServicioAplicaAFields({ formData, setFormData }) {
  const seleccion = formData.aplica_a || [];
  const toggle = (cat) =>
    setFormData((prev) => {
      const actual = prev.aplica_a || [];
      return {
        ...prev,
        aplica_a: actual.includes(cat) ? actual.filter((c) => c !== cat) : [...actual, cat],
      };
    });

  return (
    <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        Ofrecer este servicio junto a productos de…
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Aparece como &quot;¿Te lo dejo listo para usar?&quot; en la ficha de esos
        productos. Pon un stock alto (p. ej. 99) para que siempre esté disponible.
      </p>
      <div className="flex flex-wrap gap-4">
        {CATEGORIAS_PRODUCTO.map((cat) => (
          <label key={cat} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <input
              type="checkbox"
              checked={seleccion.includes(cat)}
              onChange={() => toggle(cat)}
              className="w-4 h-4"
              style={{ appearance: "auto", WebkitAppearance: "checkbox", accentColor: "#2563eb" }}
            />
            {cat}
          </label>
        ))}
      </div>
    </div>
  );
}

// Lee los campos del formulario y devuelve { precio_oferta, metadata } listos para guardar.
export function camposPrecioEspecial(formData, metadataBase = {}) {
  const metadata = { ...metadataBase };
  const tipo = formData.oferta_tipo || "";
  const especial = parseFloat(formData.precio_oferta) || 0;

  let precio_oferta = null;
  delete metadata.oferta_tipo;
  delete metadata.oferta_hasta;
  if (tipo && especial > 0) {
    precio_oferta = especial;
    metadata.oferta_tipo = tipo;
    if (formData.oferta_hasta) metadata.oferta_hasta = formData.oferta_hasta;
  }

  delete metadata.aplica_a;
  if (formData.categoria === "servicios" && formData.aplica_a?.length) {
    metadata.aplica_a = formData.aplica_a;
  }

  return { precio_oferta, metadata };
}
