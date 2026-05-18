/**
 * Servicio de ofertas con Cloudflare D1
 */

import { d1Select, d1Execute, d1SelectOne } from '../db-d1';

function genId() {
  return crypto.randomUUID();
}

export async function obtenerTodasLasOfertas() {
  try {
    return await d1Select('SELECT * FROM ofertas ORDER BY created_at DESC');
  } catch (error) {
    console.error('Error obteniendo ofertas:', error);
    return [];
  }
}

export async function obtenerOfertasActivas() {
  try {
    const ahora = new Date().toISOString();
    return await d1Select(
      'SELECT * FROM ofertas WHERE activa = 1 AND fecha_inicio <= ? AND fecha_fin >= ? ORDER BY porcentaje_descuento DESC',
      [ahora, ahora]
    );
  } catch (error) {
    console.error('Error obteniendo ofertas activas:', error);
    return [];
  }
}

export async function obtenerOfertaDeProducto(productoId) {
  try {
    const ahora = new Date().toISOString();
    const ofertas = await d1Select(
      'SELECT * FROM ofertas WHERE activa = 1 AND fecha_inicio <= ? AND fecha_fin >= ? AND productos_ids LIKE ? ORDER BY porcentaje_descuento DESC LIMIT 1',
      [ahora, ahora, `%${productoId}%`]
    );
    return ofertas[0] ?? null;
  } catch (error) {
    console.error('Error obteniendo oferta de producto:', error);
    return null;
  }
}

export async function obtenerOfertasDeProductos(productosIds) {
  try {
    const ahora = new Date().toISOString();
    const ofertas = await d1Select(
      'SELECT * FROM ofertas WHERE activa = 1 AND fecha_inicio <= ? AND fecha_fin >= ?',
      [ahora, ahora]
    );

    const mapaOfertas = {};
    productosIds.forEach(productoId => {
      const ofertasDelProducto = ofertas.filter(oferta => {
        try {
          const ids = typeof oferta.productos_ids === 'string'
            ? JSON.parse(oferta.productos_ids)
            : oferta.productos_ids;
          return ids.includes(productoId);
        } catch {
          return String(oferta.productos_ids).includes(productoId);
        }
      });
      if (ofertasDelProducto.length > 0) {
        ofertasDelProducto.sort((a, b) => b.porcentaje_descuento - a.porcentaje_descuento);
        mapaOfertas[productoId] = ofertasDelProducto[0];
      }
    });

    return mapaOfertas;
  } catch (error) {
    console.error('Error obteniendo ofertas de productos:', error);
    return {};
  }
}

export async function crearOferta(oferta) {
  const id = genId();
  const now = new Date().toISOString();
  const productosIds = Array.isArray(oferta.productos_ids)
    ? JSON.stringify(oferta.productos_ids)
    : oferta.productos_ids;

  await d1Execute(
    'INSERT INTO ofertas (id, nombre, descripcion, porcentaje_descuento, productos_ids, fecha_inicio, fecha_fin, activa, tipo_oferta, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      oferta.nombre,
      oferta.descripcion ?? null,
      oferta.porcentaje_descuento,
      productosIds,
      oferta.fecha_inicio,
      oferta.fecha_fin,
      oferta.activa !== undefined ? (oferta.activa ? 1 : 0) : 1,
      oferta.tipo_oferta ?? null,
      now,
      now,
    ]
  );

  return await d1SelectOne('SELECT * FROM ofertas WHERE id = ?', [id]);
}

export async function actualizarOferta(id, cambios) {
  const now = new Date().toISOString();
  const updates = { ...cambios, updated_at: now };

  if (Array.isArray(updates.productos_ids)) {
    updates.productos_ids = JSON.stringify(updates.productos_ids);
  }
  if (typeof updates.activa === 'boolean') {
    updates.activa = updates.activa ? 1 : 0;
  }

  const cols = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const vals = [...Object.values(updates), id];

  await d1Execute(`UPDATE ofertas SET ${cols} WHERE id = ?`, vals);
  return await d1SelectOne('SELECT * FROM ofertas WHERE id = ?', [id]);
}

export async function eliminarOferta(id) {
  await d1Execute('DELETE FROM ofertas WHERE id = ?', [id]);
  return true;
}

export function toggleOferta(id, activa) {
  return actualizarOferta(id, { activa });
}

export function calcularPrecioConDescuento(precioOriginal, porcentajeDescuento) {
  const descuento = (precioOriginal * porcentajeDescuento) / 100;
  return precioOriginal - descuento;
}

export async function obtenerEstadisticasOfertas() {
  try {
    const ahora = new Date().toISOString();
    const ofertas = await d1Select('SELECT * FROM ofertas');

    const total = ofertas.length;
    const activas = ofertas.filter(o => o.activa === 1 || o.activa === true).length;
    const vigentes = ofertas.filter(o =>
      (o.activa === 1 || o.activa === true) &&
      o.fecha_inicio <= ahora &&
      o.fecha_fin >= ahora
    ).length;
    const expiradas = ofertas.filter(o => o.fecha_fin < ahora).length;
    const futuras = ofertas.filter(o => o.fecha_inicio > ahora).length;

    return { total, activas, vigentes, expiradas, futuras };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { total: 0, activas: 0, vigentes: 0, expiradas: 0, futuras: 0 };
  }
}
