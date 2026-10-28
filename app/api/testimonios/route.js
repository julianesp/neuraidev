import { NextResponse } from 'next/server';
import { d1Select, d1Execute } from '@/lib/db-d1';
import { isAdminServer } from '@/lib/auth/server-roles';
import { currentUser } from '@clerk/nextjs/server';
import { notifyNuevaCalificacion } from '@/lib/notificationService';
import { normalizarFacebookUrl } from '@/lib/facebook';
import { copiarImagenAR2 } from '@/lib/r2-copiar-imagen';

// Columnas que se pueden mostrar al público (nunca email ni user_id)
const COLUMNAS_PUBLICAS =
  'id, cliente_nombre, mensaje, producto_relacionado, calificacion, tipo, avatar_url, facebook_url, created_at';

// D1 responde "no such column" si aún no se aplicó migrations/add-testimonios-facebook.sql
const faltaColumnaFacebook = (e) => /facebook_url/.test(String(e?.message || e));

// producto = compra en la tienda · formateo = servicio técnico · web = desarrollo web
const TIPOS = ['producto', 'formateo', 'web'];

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
      // El público solo recibe columnas seguras; el admin (otros estados) todo
      const columnas = filtro === 'aprobado' ? COLUMNAS_PUBLICAS : '*';
      const consultar = (cols) =>
        d1Select(
          `SELECT ${cols} FROM testimonios WHERE estado = ? ORDER BY created_at DESC`,
          [filtro]
        );
      testimonios = await consultar(columnas).catch((e) => {
        if (!faltaColumnaFacebook(e)) throw e;
        return consultar(columnas.replace(', facebook_url', ''));
      });
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

    // Campo trampa invisible del formulario /calificar: solo lo llenan los bots.
    if (body.website) {
      return NextResponse.json({ success: true }, { status: 201 });
    }
    const tipo = TIPOS.includes(body.tipo) ? body.tipo : 'producto';

    if (!cliente_nombre || !cliente_nombre.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    if (!mensaje || !mensaje.trim()) {
      return NextResponse.json({ error: 'El mensaje es requerido' }, { status: 400 });
    }
    if (cliente_nombre.length > 80) {
      return NextResponse.json({ error: 'El nombre es demasiado largo' }, { status: 400 });
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

    // Foto y Facebook: solo con el consentimiento del cliente. La foto sale de
    // la cuenta de Facebook conectada en Clerk (nunca de una URL que mande el
    // navegador) y se copia a R2 porque las URLs de Facebook caducan.
    let avatarUrl = null;
    let facebookUrl = null;
    let userId = null;
    if (body.consentimiento_publicar === true) {
      facebookUrl = normalizarFacebookUrl(body.facebook_url);
      const user = await currentUser().catch(() => null);
      const fb = user?.externalAccounts?.find((a) => /facebook/.test(a.provider || ''));
      if (fb) {
        userId = user.id;
        avatarUrl = await copiarImagenAR2(fb.imageUrl || user.imageUrl, `testimonios/${id}`);
      }
    }

    const fila = {
      id,
      cliente_email: cliente_email?.trim() || null,
      cliente_nombre: cliente_nombre.trim(),
      mensaje: mensaje.trim(),
      producto_relacionado: producto_relacionado?.trim().slice(0, 120) || null,
      calificacion: calif,
      tipo,
      estado: 'pendiente',
      created_at: ahora,
      avatar_url: avatarUrl,
      user_id: userId,
      facebook_url: facebookUrl,
    };
    const insertar = (datos) => {
      const cols = Object.keys(datos);
      return d1Execute(
        `INSERT INTO testimonios (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
        Object.values(datos)
      );
    };
    await insertar(fila).catch((e) => {
      if (!faltaColumnaFacebook(e)) throw e;
      const { facebook_url, ...sinFacebook } = fila;
      return insertar(sinFacebook);
    });

    // Aviso a Telegram para revisarla y publicarla desde el panel
    notifyNuevaCalificacion({
      nombre: cliente_nombre.trim(),
      email: cliente_email?.trim() || null,
      calificacion: calif,
      mensaje: mensaje.trim(),
      tipo,
      producto: producto_relacionado?.trim() || null,
      conFoto: Boolean(avatarUrl),
      facebook: facebookUrl,
    }).catch(() => {});

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
// Body: { id, estado: 'aprobado' | 'rechazado' } o { id, quitar_foto, quitar_facebook }
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

    // Quitar la foto o el Facebook antes de publicar (sin cambiar el estado)
    if (body.quitar_foto || body.quitar_facebook) {
      if (body.quitar_foto) {
        await d1Execute(`UPDATE testimonios SET avatar_url = NULL WHERE id = ?`, [id]);
      }
      if (body.quitar_facebook) {
        await d1Execute(`UPDATE testimonios SET facebook_url = NULL WHERE id = ?`, [id]).catch((e) => {
          if (!faltaColumnaFacebook(e)) throw e;
        });
      }
      return NextResponse.json({ success: true });
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
