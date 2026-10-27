// Consultas de servidor para precios: campañas de ofertas vigentes y servicios
// técnicos que se venden en combo. Ver lib/precios.js.
import { d1Select } from "@/lib/db";
import { aplicarPrecioVigente, parseIds, CATEGORIA_SERVICIOS } from "@/lib/precios";

// Campañas activas y dentro de su rango de fechas (ISO UTC, comparables como texto).
export async function obtenerCampanasVigentes() {
  try {
    const ahora = new Date().toISOString();
    const rows = await d1Select(
      `SELECT id, nombre, porcentaje_descuento, productos_ids, fecha_inicio, fecha_fin
         FROM ofertas
        WHERE activa = 1 AND fecha_inicio <= ? AND fecha_fin >= ?`,
      [ahora, ahora],
    );
    return (rows || []).map((c) => ({ ...c, productos_ids: parseIds(c.productos_ids) }));
  } catch (e) {
    console.error("[ofertas] no se pudieron cargar las campañas:", e);
    return [];
  }
}

// Aplica el precio vigente a una lista de productos con una sola consulta.
export async function conPreciosVigentes(productos) {
  const lista = productos || [];
  if (lista.length === 0) return lista;
  const campanas = await obtenerCampanasVigentes();
  return lista.map((p) => aplicarPrecioVigente(p, campanas));
}

// Servicios técnicos publicados (categoría 'servicios', disponibles).
export async function obtenerServiciosActivos() {
  try {
    const rows = await d1Select(
      `SELECT id, nombre, descripcion, precio, precio_oferta, metadata, imagen_principal, stock, disponible
         FROM products
        WHERE categoria = ? AND disponible = 1`,
      [CATEGORIA_SERVICIOS],
    );
    return rows || [];
  } catch (e) {
    console.error("[servicios] no se pudieron cargar:", e);
    return [];
  }
}

// Productos (no servicios) con oferta, precio de lanzamiento o campaña vigente.
// Primero los lanzamientos, luego por mayor ahorro.
export async function obtenerProductosConOferta() {
  const [productos, campanas] = await Promise.all([
    d1Select(
      `SELECT id, nombre, precio, precio_oferta, metadata, imagen_principal, imagenes, categoria, sku, stock
         FROM products
        WHERE disponible = 1 AND COALESCE(categoria, '') != ?`,
      [CATEGORIA_SERVICIOS],
    ).catch(() => []),
    obtenerCampanasVigentes(),
  ]);

  return (productos || [])
    .map((p) => aplicarPrecioVigente(p, campanas))
    .filter((p) => p.ofertaTipo)
    .sort((a, b) => {
      if (a.ofertaTipo !== b.ofertaTipo) return a.ofertaTipo === "lanzamiento" ? -1 : 1;
      return b.precioAnterior - b.precio - (a.precioAnterior - a.precio);
    });
}
