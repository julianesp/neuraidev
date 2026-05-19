/**
 * Servicio de slides del carrusel de presentación con Cloudflare D1
 */

import { d1Select, d1Execute, d1SelectOne } from '../db-d1';

function genId() {
  return crypto.randomUUID();
}

export async function obtenerTodosLosSlides() {
  try {
    return await d1Select('SELECT * FROM carousel_slides ORDER BY orden ASC, created_at DESC');
  } catch (error) {
    console.error('Error obteniendo slides:', error);
    return [];
  }
}

export async function obtenerSlidesActivos() {
  try {
    return await d1Select(
      'SELECT * FROM carousel_slides WHERE activo = 1 ORDER BY orden ASC, created_at DESC'
    );
  } catch (error) {
    console.error('Error obteniendo slides activos:', error);
    return [];
  }
}

export async function crearSlide(slide) {
  const id = genId();
  const now = new Date().toISOString();

  await d1Execute(
    'INSERT INTO carousel_slides (id, titulo, descripcion, imagen_url, link, boton_texto, activo, orden, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      slide.titulo,
      slide.descripcion ?? null,
      slide.imagen_url,
      slide.link ?? null,
      slide.boton_texto ?? 'Ver más',
      slide.activo !== undefined ? (slide.activo ? 1 : 0) : 1,
      slide.orden ?? 99,
      now,
      now,
    ]
  );

  return await d1SelectOne('SELECT * FROM carousel_slides WHERE id = ?', [id]);
}

export async function actualizarSlide(id, cambios) {
  const now = new Date().toISOString();
  const updates = { ...cambios, updated_at: now };

  if (typeof updates.activo === 'boolean') {
    updates.activo = updates.activo ? 1 : 0;
  }

  const cols = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const vals = [...Object.values(updates), id];

  await d1Execute(`UPDATE carousel_slides SET ${cols} WHERE id = ?`, vals);
  return await d1SelectOne('SELECT * FROM carousel_slides WHERE id = ?', [id]);
}

export async function eliminarSlide(id) {
  await d1Execute('DELETE FROM carousel_slides WHERE id = ?', [id]);
  return true;
}
