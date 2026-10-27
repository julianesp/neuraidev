// Promociones (combos con % de descuento sobre varios productos) leídas en el
// servidor. Los componentes de cliente no pueden consultar D1 directamente:
// todo pasa por /api/promociones, que ya devuelve los productos incluidos.
import { d1Select } from "@/lib/db";
import { obtenerCampanasVigentes } from "@/lib/ofertas-server";
import { aplicarPrecioVigente, parseIds } from "@/lib/precios";

// Columnas editables desde el dashboard (lo demás del body se ignora)
export const CAMPOS_PROMOCION = [
  "nombre", "descripcion", "tipo", "activo", "productos_ids", "descuento_tipo",
  "descuento_valor", "precio_combo", "cantidad_minima", "cantidad_maxima",
  "fecha_inicio", "fecha_fin", "imagen_url", "color_badge", "icono",
  "posicion_orden", "metadata",
];

// Body del dashboard → columnas de la tabla (fechas en ISO UTC)
export function datosPromocion(body) {
  const datos = {};
  for (const k of CAMPOS_PROMOCION) {
    if (!(k in body)) continue;
    let v = body[k];
    if ((k === 'fecha_inicio' || k === 'fecha_fin') && v) v = new Date(v).toISOString();
    if (v === '') v = null;
    if (typeof v === 'boolean') v = v ? 1 : 0;
    if (v !== null && typeof v === 'object') v = JSON.stringify(v);
    datos[k] = v;
  }
  return datos;
}

export function normalizarPromocion(p) {
  if (!p) return p;
  return {
    ...p,
    productos_ids: parseIds(p.productos_ids),
    activo: p.activo === 1 || p.activo === true,
    descuento_valor: Number(p.descuento_valor) || 0,
  };
}

// Activa y dentro de fechas (una fecha vacía no limita)
export function promocionVigente(p, ahora = new Date()) {
  if (!p?.activo) return false;
  if (p.fecha_inicio && new Date(p.fecha_inicio) > ahora) return false;
  if (p.fecha_fin && new Date(p.fecha_fin) < ahora) return false;
  return true;
}

// Precio de un producto dentro de la promoción: precio vigente (oferta /
// lanzamiento incluidos) menos el % de la promoción. Lo usan la página de la
// promoción y el checkout, así el cliente paga lo que vio.
export function precioEnPromocion(precioVigente, promo) {
  const pct = Number(promo?.descuento_valor) || 0;
  if (!(pct > 0 && pct < 100)) return Math.round(precioVigente);
  return Math.round(precioVigente * (1 - pct / 100));
}

export async function obtenerPromociones({ soloVigentes = false } = {}) {
  const rows = await d1Select(
    `SELECT * FROM promociones ORDER BY COALESCE(posicion_orden, 0) ASC, created_at DESC`,
  );
  const promos = (rows || []).map(normalizarPromocion);
  return soloVigentes ? promos.filter((p) => promocionVigente(p)) : promos;
}

export async function obtenerPromocion(id) {
  const rows = await d1Select(`SELECT * FROM promociones WHERE id = ? LIMIT 1`, [id]);
  return rows?.[0] ? normalizarPromocion(rows[0]) : null;
}

// Agrega a cada promoción sus productos con precio vigente y precio en promo.
export async function conProductos(promos) {
  const ids = [...new Set(promos.flatMap((p) => p.productos_ids))];
  if (ids.length === 0) return promos.map((p) => ({ ...p, productos: [] }));

  const [rows, campanas] = await Promise.all([
    d1Select(
      `SELECT id, nombre, precio, precio_oferta, metadata, imagen_principal, imagenes, categoria, stock, disponible
         FROM products WHERE id IN (${ids.map(() => "?").join(", ")})`,
      ids,
    ),
    obtenerCampanasVigentes(),
  ]);
  const porId = new Map(
    (rows || []).map((r) => {
      let imagenes = r.imagenes;
      if (typeof imagenes === "string") {
        try { imagenes = JSON.parse(imagenes); } catch { imagenes = []; }
      }
      return [String(r.id), aplicarPrecioVigente({ ...r, imagenes: imagenes || [] }, campanas)];
    }),
  );

  return promos.map((p) => {
    const productos = p.productos_ids
      .map((id) => porId.get(String(id)))
      .filter(Boolean)
      .map((prod) => ({ ...prod, precio_promocion: precioEnPromocion(prod.precio, p) }));
    const total = productos.reduce((s, x) => s + x.precio, 0);
    const totalPromo = productos.reduce((s, x) => s + x.precio_promocion, 0);
    return { ...p, productos, precio_total: total, precio_promocion: totalPromo };
  });
}
