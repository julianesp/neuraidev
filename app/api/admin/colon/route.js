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

// GET /api/admin/colon
// Config completa (con storage_paths) + eventos con sus fotos, para el dashboard.
export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const config = await d1SelectOne(
      `SELECT id, banner_url, banner_path, perfil_url, perfil_path, titulo, descripcion
       FROM colon_config WHERE id = 'colon'`
    );

    const eventos = await d1Select(
      `SELECT id, titulo, descripcion, portada_url, portada_path, fecha_evento, destacado, orden
       FROM colon_eventos
       ORDER BY orden ASC, created_at DESC`
    );

    const fotos = await d1Select(
      `SELECT id, evento_id, url, storage_path, orden
       FROM colon_evento_fotos
       ORDER BY orden ASC, created_at ASC`
    );

    const fotosPorEvento = {};
    for (const f of fotos) {
      if (!fotosPorEvento[f.evento_id]) fotosPorEvento[f.evento_id] = [];
      fotosPorEvento[f.evento_id].push(f);
    }

    return NextResponse.json({
      config: config || { id: 'colon' },
      eventos: eventos.map((e) => ({ ...e, fotos: fotosPorEvento[e.id] || [] })),
    });
  } catch (error) {
    console.error('Error en GET /api/admin/colon:', error);
    return NextResponse.json({ error: 'Error al obtener los datos' }, { status: 500 });
  }
}

// POST /api/admin/colon — acciones según body.accion:
//   'crear_evento'  { titulo, descripcion?, portada_url?, portada_path?, fecha_evento?, destacado? }
//   'agregar_foto'  { evento_id, url, storage_path? }
export async function POST(request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const ahora = new Date().toISOString();

    if (body.accion === 'crear_evento') {
      const titulo = (body.titulo || '').trim();
      if (!titulo) {
        return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
      }
      const id = crypto.randomUUID();
      const maxOrden = await d1SelectOne(
        `SELECT COALESCE(MAX(orden), 0) AS m FROM colon_eventos`
      );
      await d1Execute(
        `INSERT INTO colon_eventos
           (id, titulo, descripcion, portada_url, portada_path, fecha_evento, destacado, orden, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          titulo,
          (body.descripcion || '').trim() || null,
          body.portada_url || null,
          body.portada_path || null,
          (body.fecha_evento || '').trim() || null,
          body.destacado ? 1 : 0,
          (maxOrden?.m || 0) + 1,
          ahora,
        ]
      );
      return NextResponse.json({ success: true, id });
    }

    if (body.accion === 'agregar_foto') {
      const eventoId = body.evento_id;
      const url = (body.url || '').trim();
      if (!eventoId || !url) {
        return NextResponse.json({ error: 'evento_id y url son requeridos' }, { status: 400 });
      }
      const evento = await d1SelectOne(`SELECT id FROM colon_eventos WHERE id = ?`, [eventoId]);
      if (!evento) {
        return NextResponse.json({ error: 'El evento no existe' }, { status: 404 });
      }
      const maxOrden = await d1SelectOne(
        `SELECT COALESCE(MAX(orden), 0) AS m FROM colon_evento_fotos WHERE evento_id = ?`,
        [eventoId]
      );
      const id = crypto.randomUUID();
      await d1Execute(
        `INSERT INTO colon_evento_fotos (id, evento_id, url, storage_path, orden, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, eventoId, url, body.storage_path || null, (maxOrden?.m || 0) + 1, ahora]
      );
      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (error) {
    console.error('Error en POST /api/admin/colon:', error);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}

// PATCH /api/admin/colon — según body.tipo:
//   'config' { banner_url?, banner_path?, perfil_url?, perfil_path?, titulo?, descripcion? }
//   'evento' { id, titulo?, descripcion?, portada_url?, portada_path?, fecha_evento?, destacado? }
// Devuelve old_path cuando se reemplaza una imagen, para que el cliente limpie R2.
export async function PATCH(request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const ahora = new Date().toISOString();

    if (body.tipo === 'config') {
      const anterior = await d1SelectOne(
        `SELECT banner_path, perfil_path FROM colon_config WHERE id = 'colon'`
      );
      const oldPaths = [];

      const campos = [];
      const params = [];
      const setStr = (col, val) => {
        if (typeof val === 'string') {
          campos.push(`${col} = ?`);
          params.push(val.trim() || null);
        }
      };
      // Al cambiar banner/perfil, recordamos la ruta vieja para borrarla de R2.
      if (typeof body.banner_url === 'string') {
        setStr('banner_url', body.banner_url);
        if (typeof body.banner_path === 'string') {
          campos.push('banner_path = ?');
          params.push(body.banner_path || null);
          if (anterior?.banner_path && anterior.banner_path !== body.banner_path) {
            oldPaths.push(anterior.banner_path);
          }
        }
      }
      if (typeof body.perfil_url === 'string') {
        setStr('perfil_url', body.perfil_url);
        if (typeof body.perfil_path === 'string') {
          campos.push('perfil_path = ?');
          params.push(body.perfil_path || null);
          if (anterior?.perfil_path && anterior.perfil_path !== body.perfil_path) {
            oldPaths.push(anterior.perfil_path);
          }
        }
      }
      setStr('titulo', body.titulo);
      setStr('descripcion', body.descripcion);

      if (campos.length === 0) {
        return NextResponse.json({ error: 'No hay cambios' }, { status: 400 });
      }
      campos.push('updated_at = ?');
      params.push(ahora);
      await d1Execute(`UPDATE colon_config SET ${campos.join(', ')} WHERE id = 'colon'`, params);
      return NextResponse.json({ success: true, storage_paths: oldPaths });
    }

    if (body.tipo === 'evento') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
      }
      const anterior = await d1SelectOne(
        `SELECT portada_path FROM colon_eventos WHERE id = ?`,
        [id]
      );
      const oldPaths = [];

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
      if (typeof body.fecha_evento === 'string') {
        campos.push('fecha_evento = ?');
        params.push(body.fecha_evento.trim() || null);
      }
      if (typeof body.destacado !== 'undefined') {
        campos.push('destacado = ?');
        params.push(body.destacado ? 1 : 0);
      }
      if (typeof body.portada_url === 'string') {
        campos.push('portada_url = ?');
        params.push(body.portada_url.trim() || null);
        if (typeof body.portada_path === 'string') {
          campos.push('portada_path = ?');
          params.push(body.portada_path || null);
          if (anterior?.portada_path && anterior.portada_path !== body.portada_path) {
            oldPaths.push(anterior.portada_path);
          }
        }
      }
      if (campos.length === 0) {
        return NextResponse.json({ error: 'No hay cambios' }, { status: 400 });
      }
      params.push(id);
      await d1Execute(`UPDATE colon_eventos SET ${campos.join(', ')} WHERE id = ?`, params);
      return NextResponse.json({ success: true, storage_paths: oldPaths });
    }

    return NextResponse.json({ error: 'Tipo no reconocido' }, { status: 400 });
  } catch (error) {
    console.error('Error en PATCH /api/admin/colon:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

// DELETE /api/admin/colon?foto=<id>    -> elimina una foto de galería
// DELETE /api/admin/colon?evento=<id>  -> elimina un evento y sus fotos
// Devuelve storage_paths para que el cliente limpie R2.
export async function DELETE(request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const fotoId = searchParams.get('foto');
    const eventoId = searchParams.get('evento');

    if (fotoId) {
      const foto = await d1SelectOne(
        `SELECT storage_path FROM colon_evento_fotos WHERE id = ?`,
        [fotoId]
      );
      await d1Execute(`DELETE FROM colon_evento_fotos WHERE id = ?`, [fotoId]);
      return NextResponse.json({
        success: true,
        storage_paths: foto?.storage_path ? [foto.storage_path] : [],
      });
    }

    if (eventoId) {
      const portada = await d1SelectOne(
        `SELECT portada_path FROM colon_eventos WHERE id = ?`,
        [eventoId]
      );
      const fotos = await d1Select(
        `SELECT storage_path FROM colon_evento_fotos WHERE evento_id = ? AND storage_path IS NOT NULL`,
        [eventoId]
      );
      await d1Execute(`DELETE FROM colon_evento_fotos WHERE evento_id = ?`, [eventoId]);
      await d1Execute(`DELETE FROM colon_eventos WHERE id = ?`, [eventoId]);
      const paths = fotos.map((f) => f.storage_path);
      if (portada?.portada_path) paths.push(portada.portada_path);
      return NextResponse.json({ success: true, storage_paths: paths });
    }

    return NextResponse.json({ error: 'Falta ?foto= o ?evento=' }, { status: 400 });
  } catch (error) {
    console.error('Error en DELETE /api/admin/colon:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
