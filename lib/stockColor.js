/**
 * Stock por color de un producto. Se guarda en products.metadata.stock_por_color
 * como { "Negro": 1, "Rosa": 2 }. Si el producto no lo tiene, se usa el stock
 * general (products.stock) como antes.
 */

export function leerMetadata(metadata) {
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata) || {};
    } catch {
      return {};
    }
  }
  return metadata && typeof metadata === "object" ? metadata : {};
}

/** Mapa { color: unidades } o null si el producto no maneja stock por color */
export function stockPorColor(metadata) {
  const m = leerMetadata(metadata);
  const mapa = m.stock_por_color;
  if (!mapa || typeof mapa !== "object" || Array.isArray(mapa)) return null;
  const limpio = {};
  for (const [color, n] of Object.entries(mapa)) {
    const v = parseInt(n, 10);
    if (Number.isFinite(v)) limpio[color] = Math.max(v, 0);
  }
  return Object.keys(limpio).length ? limpio : null;
}

/** Unidades de un color, o null si ese color no tiene stock propio */
export function stockDeColor(metadata, color) {
  const mapa = stockPorColor(metadata);
  if (!mapa || !color || typeof color !== "string") return null;
  return color in mapa ? mapa[color] : null;
}

export function sumaStock(mapa) {
  return Object.values(mapa || {}).reduce((t, n) => t + (parseInt(n, 10) || 0), 0);
}
