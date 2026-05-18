/**
 * Servicio de productos con Cloudflare D1
 */

import { d1Select, d1Execute, d1SelectOne } from '../db-d1';

export async function obtenerProductos(filtros = {}) {
  try {
    const conditions = [];
    const params = [];

    if (filtros.mostrarTodos !== true) {
      conditions.push('disponible = 1');
      conditions.push('stock > 0');
    }

    if (filtros.categoria) {
      conditions.push('categoria = ?');
      params.push(filtros.categoria);
    }

    if (filtros.destacado !== undefined) {
      conditions.push('destacado = ?');
      params.push(filtros.destacado ? 1 : 0);
    }

    let sql = 'SELECT * FROM products';
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    if (filtros.limite) {
      sql += ' LIMIT ?';
      params.push(filtros.limite);
    }

    return await d1Select(sql, params);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }
}

export function obtenerProductosPorCategoria(categoria) {
  return obtenerProductos({ categoria });
}

export function obtenerProductosDestacados(limite = 10) {
  return obtenerProductos({ destacado: true, limite });
}

export function obtenerProductosRecientes(limite = 10) {
  return obtenerProductos({ limite });
}

export async function obtenerProductoPorId(id) {
  try {
    return await d1SelectOne('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return null;
  }
}

export async function obtenerProductoPorSKU(sku) {
  try {
    return await d1SelectOne('SELECT * FROM products WHERE sku = ? LIMIT 1', [sku]);
  } catch (error) {
    console.error('Error obteniendo producto por SKU:', error);
    return null;
  }
}

export async function buscarProductos(termino, mostrarTodos = false) {
  try {
    const t = `%${termino}%`;
    let sql = 'SELECT * FROM products WHERE (LOWER(nombre) LIKE LOWER(?) OR LOWER(descripcion) LIKE LOWER(?))';
    const params = [t, t];

    if (!mostrarTodos) {
      sql += ' AND disponible = 1 AND stock > 0';
    }
    sql += ' ORDER BY created_at DESC';

    return await d1Select(sql, params);
  } catch (error) {
    console.error('Error buscando productos:', error);
    return [];
  }
}

export async function crearProducto(producto) {
  const now = new Date().toISOString();
  const id = producto.id || crypto.randomUUID();
  const p = { ...producto, id, created_at: producto.created_at || now, updated_at: now };

  // Serializar campos de objeto
  for (const [k, v] of Object.entries(p)) {
    if (v !== null && v !== undefined && typeof v === 'object') {
      p[k] = JSON.stringify(v);
    } else if (typeof v === 'boolean') {
      p[k] = v ? 1 : 0;
    }
  }

  const cols = Object.keys(p);
  const vals = Object.values(p);
  const placeholders = cols.map(() => '?').join(', ');

  await d1Execute(
    `INSERT INTO products (${cols.join(', ')}) VALUES (${placeholders})`,
    vals
  );

  return await d1SelectOne('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
}

export async function actualizarProducto(id, cambios) {
  const existing = await d1SelectOne('SELECT id FROM products WHERE id = ? LIMIT 1', [id]);
  if (!existing) throw new Error(`Producto con ID ${id} no encontrado`);

  const updates = { ...cambios, updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(updates)) {
    if (v !== null && v !== undefined && typeof v === 'object') {
      updates[k] = JSON.stringify(v);
    } else if (typeof v === 'boolean') {
      updates[k] = v ? 1 : 0;
    }
  }

  const cols = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const vals = [...Object.values(updates), id];

  await d1Execute(`UPDATE products SET ${cols} WHERE id = ?`, vals);
  return await d1SelectOne('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
}

export async function eliminarProducto(id) {
  await d1Execute('DELETE FROM products WHERE id = ?', [id]);
  return true;
}

export function actualizarStock(id, nuevoStock) {
  return actualizarProducto(id, { stock: nuevoStock, disponible: nuevoStock > 0 });
}

export async function obtenerEstadisticasProductos() {
  try {
    const productos = await d1Select('SELECT id, disponible, destacado, stock FROM products');
    const total = productos.length;
    const disponibles = productos.filter(p => p.disponible === 1 || p.disponible === true).length;
    const destacados = productos.filter(p => p.destacado === 1 || p.destacado === true).length;
    const sinStock = productos.filter(p => p.stock === 0).length;
    return { total, disponibles, destacados, sinStock };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { total: 0, disponibles: 0, destacados: 0, sinStock: 0 };
  }
}
