// Promociones (combos con % de descuento sobre varios productos) leídas en el
// servidor. Los componentes de cliente no pueden consultar D1 directamente:
// todo pasa por /api/promociones, que ya devuelve los productos incluidos.
import { d1Select } from "@/lib/db";
import { obtenerCampanasVigentes } from "@/lib/ofertas-server";
import { aplicarPrecioVigente } from "@/lib/precios";
import {
  calcularDescuentosPromociones,
  normalizarPromocion,
  promocionVigente,
} from "@/lib/promociones";

export { normalizarPromocion, promocionVigente };

// Promociones vigentes listas para calcular descuentos del carrito.
export async function obtenerPromocionesVigentes() {
  try {
    return await obtenerPromociones({ soloVigentes: true });
  } catch (e) {
    console.error("[promociones] no se pudieron cargar:", e);
    return [];
  }
}

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

  // Precio de cada producto dentro de la promo, para la mínima cantidad que la
  // activa (una promo de 1 producto con mínimo 5 se muestra por 5 unidades).
  return promos.map((p) => {
    const productos = p.productos_ids.map((id) => porId.get(String(id))).filter(Boolean);
    const unidades = productos.length === 1 ? p.cantidad_minima : Math.max(p.cantidad_minima, 1);
    const lineas = productos.map((x) => ({ id: x.id, cantidad: unidades, precio: x.precio }));
    const { porLinea } = calcularDescuentosPromociones(lineas, [p]);
    const conPromo = productos.map((x) => ({
      ...x,
      precio_promocion: Math.round(x.precio - (porLinea[String(x.id)] || 0) / unidades),
    }));
    const total = conPromo.reduce((s, x) => s + x.precio * unidades, 0);
    const totalPromo = conPromo.reduce((s, x) => s + x.precio_promocion * unidades, 0);
    return {
      ...p,
      productos: conPromo,
      unidades,
      precio_total: total,
      precio_promocion: totalPromo,
    };
  });
}
