// Descuentos de promociones (tabla `promociones`) calculados a partir del
// carrito. Funciones puras: las usan el carrito (para mostrar el descuento) y
// el checkout de ePayco en el servidor (para cobrarlo), con el mismo resultado.
//
// Reglas (descuento por porcentaje):
//   · Promoción de UN producto: si se llevan al menos `cantidad_minima`
//     unidades, el % aplica a las unidades hasta `cantidad_maxima` (si hay).
//   · Combo de VARIOS productos: cada "juego" es una unidad de cada producto;
//     aplica si hay al menos `cantidad_minima` juegos (mínimo 1), hasta
//     `cantidad_maxima` juegos.
import { parseIds } from "@/lib/precios";

export function normalizarPromocion(p) {
  if (!p) return p;
  return {
    ...p,
    productos_ids: parseIds(p.productos_ids),
    activo: p.activo === 1 || p.activo === true,
    descuento_valor: Number(p.descuento_valor) || 0,
    cantidad_minima: Math.max(parseInt(p.cantidad_minima, 10) || 1, 1),
    cantidad_maxima: parseInt(p.cantidad_maxima, 10) || null,
  };
}

// Activa y dentro de fechas (una fecha vacía no limita)
export function promocionVigente(p, ahora = new Date()) {
  if (!p?.activo) return false;
  if (p.fecha_inicio && new Date(p.fecha_inicio) > ahora) return false;
  if (p.fecha_fin && new Date(p.fecha_fin) < ahora) return false;
  return true;
}

function porcentaje(promo) {
  const pct = Number(promo?.descuento_valor) || 0;
  return pct > 0 && pct < 100 ? pct : 0;
}

/**
 * @param {Array<{id:string, cantidad:number, precio:number}>} lineas  precio = unitario vigente
 * @param {Array} promos  promociones vigentes (normalizadas)
 * @returns {{ total:number, descuentos:Array<{promocion_id,nombre,monto,unidades}>, porLinea:Object<string,number> }}
 */
export function calcularDescuentosPromociones(lineas, promos) {
  // Cantidad y precio por producto (pueden venir varias líneas del mismo id, p. ej. colores)
  const porProducto = new Map();
  for (const l of lineas || []) {
    const id = String(l.id);
    const actual = porProducto.get(id) || { cantidad: 0, precio: Number(l.precio) || 0 };
    actual.cantidad += Number(l.cantidad) || 0;
    porProducto.set(id, actual);
  }

  const descuentos = [];
  const porLinea = {};
  // Cada unidad recibe como máximo un descuento de promoción
  const usadas = new Map();
  const libres = (id) => (porProducto.get(id)?.cantidad || 0) - (usadas.get(id) || 0);

  // Primero las de mayor descuento
  const ordenadas = [...(promos || [])].sort((a, b) => porcentaje(b) - porcentaje(a));

  for (const promo of ordenadas) {
    const pct = porcentaje(promo);
    const ids = (promo.productos_ids || []).map(String);
    if (!pct || ids.length === 0 || !ids.every((id) => porProducto.has(id))) continue;

    const minimo = Math.max(parseInt(promo.cantidad_minima, 10) || 1, 1);
    const maximo = parseInt(promo.cantidad_maxima, 10) || Infinity;
    const juegos = Math.min(...ids.map(libres));
    if (juegos < minimo) continue;
    const unidades = Math.min(juegos, maximo);

    let monto = 0;
    for (const id of ids) {
      const m = porProducto.get(id).precio * unidades * (pct / 100);
      porLinea[id] = (porLinea[id] || 0) + m;
      usadas.set(id, (usadas.get(id) || 0) + unidades);
      monto += m;
    }
    descuentos.push({
      promocion_id: promo.id,
      nombre: promo.nombre,
      monto: Math.round(monto),
      unidades,
    });
  }

  return {
    total: descuentos.reduce((s, d) => s + d.monto, 0),
    descuentos,
    porLinea,
  };
}

/**
 * Promociones en las que participa un producto, con un texto corto para la
 * ficha: "Llevando 5 o más: 10% de descuento".
 */
export function textoPromocion(promo) {
  const pct = porcentaje(promo);
  if (!pct) return null;
  const ids = promo.productos_ids || [];
  const minimo = Math.max(parseInt(promo.cantidad_minima, 10) || 1, 1);
  if (ids.length > 1) {
    return `Combo ${promo.nombre}: ${pct}% de descuento llevando los ${ids.length} productos`;
  }
  return minimo > 1
    ? `Llevando ${minimo} o más: ${pct}% de descuento`
    : `${pct}% de descuento`;
}
