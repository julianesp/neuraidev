// Precio vigente de un producto: un único lugar para decidir cuánto cuesta un
// producto HOY. Lo usan las páginas (para mostrarlo) y el checkout de ePayco
// (para cobrarlo), así lo que ve el cliente es exactamente lo que paga.
//
// Fuentes de descuento, se queda la que deje el precio más bajo:
//   1) Precio especial del propio producto (dashboard → editar producto):
//        products.precio_oferta            → el precio rebajado
//        metadata.oferta_tipo              → 'oferta' | 'lanzamiento'
//        metadata.oferta_hasta             → 'YYYY-MM-DD' (opcional, inclusive)
//   2) Campañas de la tabla `ofertas` (dashboard → ofertas): un % de descuento
//      sobre varios productos dentro de un rango de fechas.
//
// Funciones puras: sirven en servidor y en cliente.

export const TIPOS_OFERTA = {
  oferta: { etiqueta: "Oferta", emoji: "🔥" },
  lanzamiento: { etiqueta: "Precio de lanzamiento", emoji: "🚀" },
};

export function parseMetadata(metadata) {
  if (!metadata) return {};
  if (typeof metadata === "object") return metadata;
  try {
    return JSON.parse(metadata) || {};
  } catch {
    return {};
  }
}

export function parseIds(ids) {
  if (Array.isArray(ids)) return ids.map(String);
  if (typeof ids === "string" && ids.trim()) {
    try {
      const arr = JSON.parse(ids);
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

// 'YYYY-MM-DD' se interpreta como el final de ese día en hora de Colombia.
export function finDeDia(fecha) {
  if (!fecha) return null;
  const s = String(fecha);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(s)
    ? new Date(`${s}T23:59:59-05:00`)
    : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @param {object} producto  fila de `products` (precio crudo, precio_oferta, metadata)
 * @param {Array}  campanas  ofertas vigentes (ver lib/ofertas-server.js)
 * @returns {{ precio:number, precioNormal:number, tipo:string|null, hasta:string|null, nombre:string|null }}
 */
export function calcularPrecioVigente(producto, campanas = [], ahora = new Date()) {
  const precioNormal = Number(producto?.precioNormal ?? producto?.precio) || 0;
  let mejor = { precio: precioNormal, precioNormal, tipo: null, hasta: null, nombre: null };
  if (precioNormal <= 0) return mejor;

  // 1) Precio especial del producto
  const meta = parseMetadata(producto.metadata);
  const especial = Number(producto.precio_oferta);
  const hasta = finDeDia(meta.oferta_hasta);
  if (
    Number.isFinite(especial) &&
    especial > 0 &&
    especial < precioNormal &&
    (!hasta || hasta >= ahora)
  ) {
    mejor = {
      precio: Math.round(especial),
      precioNormal,
      tipo: meta.oferta_tipo === "lanzamiento" ? "lanzamiento" : "oferta",
      hasta: hasta ? hasta.toISOString() : null,
      nombre: null,
    };
  }

  // 2) Campañas por porcentaje
  const id = String(producto.id);
  for (const c of campanas) {
    if (!parseIds(c.productos_ids).includes(id)) continue;
    const pct = Number(c.porcentaje_descuento);
    if (!(pct > 0 && pct < 100)) continue;
    const precio = Math.round(precioNormal * (1 - pct / 100));
    if (precio < mejor.precio) {
      mejor = {
        precio,
        precioNormal,
        tipo: "oferta",
        hasta: c.fecha_fin || null,
        nombre: c.nombre || null,
      };
    }
  }

  return mejor;
}

/**
 * Devuelve el producto con `precio` = precio a cobrar y `precioAnterior` = precio
 * normal tachado (solo si hay descuento). Idempotente: aplicarlo dos veces no
 * descuenta dos veces.
 */
export function aplicarPrecioVigente(producto, campanas = [], ahora = new Date()) {
  if (!producto) return producto;
  const base = {
    ...producto,
    precioNormal: Number(producto.precioNormal ?? producto.precio) || 0,
  };
  const v = calcularPrecioVigente(base, campanas, ahora);
  return {
    ...base,
    precio: v.precio,
    precioAnterior: v.tipo ? v.precioNormal : null,
    ofertaTipo: v.tipo,
    ofertaHasta: v.hasta,
    ofertaNombre: v.nombre,
  };
}

// Servicios técnicos (categoría 'servicios') que se ofrecen como combo con un
// producto. Cada servicio dice en qué categorías se sugiere (metadata.aplica_a).
export const CATEGORIA_SERVICIOS = "servicios";

export function serviciosParaCategoria(servicios, categoria) {
  return (servicios || []).filter((s) => {
    const aplica = parseMetadata(s.metadata).aplica_a;
    return Array.isArray(aplica) && aplica.includes(categoria);
  });
}
