import { NextResponse } from 'next/server';
import { d1Select, d1SelectOne, d1Execute } from '@/lib/db-d1';
import { isAdminServer } from '@/lib/auth/server-roles';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const user = await currentUser();
  if (!user || !isAdminServer(user)) return null;
  return user;
}

// GET /api/admin/trabajos
// Lista todos los trabajos (incluidos los que no tienen fotos) con sus fotos.
export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const trabajos = await d1Select(
      `SELECT id, titulo, descripcion, orden
       FROM trabajos_tecnico
       ORDER BY orden ASC, created_at ASC`
    );

    const fotos = await d1Select(
      `SELECT id, trabajo_id, url, storage_path, orden
       FROM trabajos_fotos
       ORDER BY orden ASC, created_at ASC`
    );

    const fotosPorTrabajo = {};
    for (const f of fotos) {
      if (!fotosPorTrabajo[f.trabajo_id]) fotosPorTrabajo[f.trabajo_id] = [];
      fotosPorTrabajo[f.trabajo_id].push(f);
    }

    const resultado = trabajos.map((t) => ({
      ...t,
      fotos: fotosPorTrabajo[t.id] || [],
    }));

    return NextResponse.json({ trabajos: resultado });
  } catch (error) {
    console.error('Error en GET /api/admin/trabajos:', error);
    return NextResponse.json({ error: 'Error al obtener los trabajos' }, { status: 500 });
  }
}

// POST /api/admin/trabajos
// Dos acciones según el body:
//   { accion: 'crear_trabajo', titulo, descripcion? }        -> nuevo caso
//   { accion: 'agregar_foto', trabajo_id, url, storage_path? } -> foto a un caso
export async function POST(request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const ahora = new Date().toISOString();

    if (body.accion === 'crear_trabajo') {
      const titulo = (body.titulo || '').trim();
      if (!titulo) {
        return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
      }
      const id = crypto.randomUUID();
      // El nuevo caso va al final.
      const maxOrden = await d1SelectOne(
        `SELECT COALESCE(MAX(orden), 0) AS m FROM trabajos_tecnico`
      );
      await d1Execute(
        `INSERT INTO trabajos_tecnico (id, titulo, descripcion, orden, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, titulo, (body.descripcion || '').trim() || null, (maxOrden?.m || 0) + 1, ahora]
      );
      return NextResponse.json({ success: true, id });
    }

    if (body.accion === 'agregar_foto') {
      const trabajoId = body.trabajo_id;
      const url = (body.url || '').trim();
      if (!trabajoId || !url) {
        return NextResponse.json({ error: 'trabajo_id y url son requeridos' }, { status: 400 });
      }
      const trabajo = await d1SelectOne(
        `SELECT id FROM trabajos_tecnico WHERE id = ?`,
        [trabajoId]
      );
      if (!trabajo) {
        return NextResponse.json({ error: 'El trabajo no existe' }, { status: 404 });
      }
      const maxOrden = await d1SelectOne(
        `SELECT COALESCE(MAX(orden), 0) AS m FROM trabajos_fotos WHERE trabajo_id = ?`,
        [trabajoId]
      );
      const id = crypto.randomUUID();
      await d1Execute(
        `INSERT INTO trabajos_fotos (id, trabajo_id, url, storage_path, orden, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, trabajoId, url, body.storage_path || null, (maxOrden?.m || 0) + 1, ahora]
      );
      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (error) {
    console.error('Error en POST /api/admin/trabajos:', error);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}

// PATCH /api/admin/trabajos
// Edita un caso: { id, titulo?, descripcion? }
export async function PATCH(request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const campos = [];
    const params = [];
    if (typeof body.titulo === 'string') {
      campos.push('titulo = ?');
      params.push(body.titulo.trim());
    }
    if (typeof body.descripcion === 'string') {
      campos.push('descripcion = ?');
      params.push(body.descripcion.trim() || null);
    }
    if (campos.length === 0) {
      return NextResponse.json({ error: 'No hay cambios' }, { status: 400 });
    }
    params.push(id);
    await d1Execute(`UPDATE trabajos_tecnico SET ${campos.join(', ')} WHERE id = ?`, params);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en PATCH /api/admin/trabajos:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

// DELETE /api/admin/trabajos?foto=<id>   -> elimina una foto
// DELETE /api/admin/trabajos?trabajo=<id> -> elimina un caso completo y sus fotos
// Devuelve las storage_path borradas para que el cliente limpie R2 si aplica.
export async function DELETE(request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const fotoId = searchParams.get('foto');
    const trabajoId = searchParams.get('trabajo');

    if (fotoId) {
      const foto = await d1SelectOne(
        `SELECT storage_path FROM trabajos_fotos WHERE id = ?`,
        [fotoId]
      );
      await d1Execute(`DELETE FROM trabajos_fotos WHERE id = ?`, [fotoId]);
      return NextResponse.json({
        success: true,
        storage_paths: foto?.storage_path ? [foto.storage_path] : [],
      });
    }

    if (trabajoId) {
      const fotos = await d1Select(
        `SELECT storage_path FROM trabajos_fotos WHERE trabajo_id = ? AND storage_path IS NOT NULL`,
        [trabajoId]
      );
      // ON DELETE CASCADE puede no estar activo en D1 si falta PRAGMA; borramos explícito.
      await d1Execute(`DELETE FROM trabajos_fotos WHERE trabajo_id = ?`, [trabajoId]);
      await d1Execute(`DELETE FROM trabajos_tecnico WHERE id = ?`, [trabajoId]);
      return NextResponse.json({
        success: true,
        storage_paths: fotos.map((f) => f.storage_path),
      });
    }

    return NextResponse.json({ error: 'Falta ?foto= o ?trabajo=' }, { status: 400 });
  } catch (error) {
    console.error('Error en DELETE /api/admin/trabajos:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
