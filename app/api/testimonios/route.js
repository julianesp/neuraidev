import { NextResponse } from 'next/server';
import { d1Select, d1Execute } from '@/lib/db-d1';
import { isAdminServer } from '@/lib/auth/server-roles';
import { currentUser } from '@clerk/nextjs/server';

// GET /api/testimonios
// Público: devuelve solo los testimonios aprobados (para la vitrina).
// Admin (?estado=pendiente|rechazado|todos): cola de moderación / gestión.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');

    // Cualquier estado distinto de 'aprobado' es información de moderación:
    // exige sesión de admin. ('todos' también, obviamente.)
    if (estado && estado !== 'aprobado') {
      const user = await currentUser();
      if (!user || !isAdminServer(user)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
    }

    let testimonios;
    if (estado === 'todos') {
      testimonios = await d1Select(
        `SELECT * FROM testimonios ORDER BY created_at DESC`
      );
    } else {
      const filtro = estado || 'aprobado';
      testimonios = await d1Select(
        `SELECT * FROM testimonios WHERE estado = ? ORDER BY created_at DESC`,
        [filtro]
      );
    }

    return NextResponse.json({ testimonios });
  } catch (error) {
    console.error('Error en GET /api/testimonios:', error);
    return NextResponse.json(
      { error: 'Error al obtener los testimonios' },
      { status: 500 }
    );
  }
}

// POST /api/testimonios
// Público: un cliente deja su testimonio. Entra siempre como 'pendiente'
// y NO se muestra hasta que el admin lo apruebe.
export async function POST(request) {
  try {
    const body = await request.json();
    const { cliente_nombre, cliente_email, mensaje, producto_relacionado, calificacion } = body;

    if (!cliente_nombre || !cliente_nombre.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    if (!mensaje || !mensaje.trim()) {
      return NextResponse.json({ error: 'El mensaje es requerido' }, { status: 400 });
    }
    if (mensaje.length > 1000) {
      return NextResponse.json(
        { error: 'El mensaje es demasiado largo (máximo 1000 caracteres)' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const ahora = new Date().toISOString();
    let calif = parseInt(calificacion);
    if (isNaN(calif) || calif < 1 || calif > 5) calif = null;

    await d1Execute(
      `INSERT INTO testimonios
         (id, cliente_email, cliente_nombre, mensaje, producto_relacionado, calificacion, estado, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?)`,
      [
        id,
        cliente_email?.trim() || null,
        cliente_nombre.trim(),
        mensaje.trim(),
        producto_relacionado?.trim() || null,
        calif,
        ahora,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message:
          '¡Gracias! Tu comentario fue enviado y será revisado antes de publicarse.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/testimonios:', error);
    return NextResponse.json(
      { error: 'Error al enviar el testimonio' },
      { status: 500 }
    );
  }
}

// PATCH /api/testimonios
// Admin: aprobar o rechazar un testimonio.
// Body: { id, estado: 'aprobado' | 'rechazado' }
export async function PATCH(request) {
  try {
    const user = await currentUser();
    if (!user || !isAdminServer(user)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, estado } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    if (!['aprobado', 'rechazado', 'pendiente'].includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    await d1Execute(
      `UPDATE testimonios SET estado = ?, revisado_at = ? WHERE id = ?`,
      [estado, new Date().toISOString(), id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en PATCH /api/testimonios:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el testimonio' },
      { status: 500 }
    );
  }
}

// DELETE /api/testimonios?id=...
// Admin: eliminar un testimonio definitivamente.
export async function DELETE(request) {
  try {
    const user = await currentUser();
    if (!user || !isAdminServer(user)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await d1Execute(`DELETE FROM testimonios WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/testimonios:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el testimonio' },
      { status: 500 }
    );
  }
}
