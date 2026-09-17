import { NextResponse } from 'next/server';
import { d1Select, d1SelectOne, d1Execute } from '@/lib/db-d1';
import { currentUser } from '@clerk/nextjs/server';
import { notifyNuevaCalificacion } from '@/lib/notificationService';

export const dynamic = 'force-dynamic';

// Devuelve el email principal del usuario autenticado (Google/Clerk), en minúsculas.
function getUserEmail(user) {
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    null;
  return email ? email.toLowerCase() : null;
}

// GET /api/formateo/mi-invitacion
// El usuario autenticado consulta si tiene una invitación pendiente para
// calificar el servicio técnico. Si la tiene, el front le muestra el modal.
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ tieneInvitacion: false });
    }

    const email = getUserEmail(user);
    if (!email) {
      return NextResponse.json({ tieneInvitacion: false });
    }

    const invitacion = await d1SelectOne(
      `SELECT id, email, nombre_cliente, estado
       FROM formateo_invitaciones
       WHERE email = ? AND estado = 'pendiente'
       LIMIT 1`,
      [email]
    );

    if (!invitacion) {
      return NextResponse.json({ tieneInvitacion: false });
    }

    return NextResponse.json({
      tieneInvitacion: true,
      nombreSugerido:
        invitacion.nombre_cliente ||
        user.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        '',
    });
  } catch (error) {
    console.error('Error en GET /api/formateo/mi-invitacion:', error);
    return NextResponse.json({ tieneInvitacion: false });
  }
}

// POST /api/formateo/mi-invitacion
// El usuario autenticado envía su calificación del servicio técnico.
// Body: { calificacion: 1-5, mensaje, nombre? }
// - Guarda un testimonio tipo 'formateo' en estado 'pendiente' (NO se publica).
// - Marca la invitación como 'calificado'.
// - Notifica al admin por Telegram.
export async function POST(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 });
    }

    const email = getUserEmail(user);
    if (!email) {
      return NextResponse.json({ error: 'No se pudo leer tu email' }, { status: 400 });
    }

    // Verificar que realmente tenga una invitación pendiente (anti-abuso).
    const invitacion = await d1SelectOne(
      `SELECT id, estado FROM formateo_invitaciones WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!invitacion) {
      return NextResponse.json(
        { error: 'No tienes una invitación para calificar' },
        { status: 403 }
      );
    }
    if (invitacion.estado === 'calificado') {
      return NextResponse.json(
        { error: 'Ya has enviado tu calificación. ¡Gracias!' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const mensaje = (body.mensaje || '').trim();
    let calificacion = parseInt(body.calificacion);

    if (isNaN(calificacion) || calificacion < 1 || calificacion > 5) {
      return NextResponse.json(
        { error: 'La calificación debe ser de 1 a 5 estrellas' },
        { status: 400 }
      );
    }
    if (!mensaje) {
      return NextResponse.json({ error: 'Escribe un comentario' }, { status: 400 });
    }
    if (mensaje.length > 1000) {
      return NextResponse.json(
        { error: 'El comentario es demasiado largo (máximo 1000 caracteres)' },
        { status: 400 }
      );
    }

    const nombre =
      (body.nombre || '').trim() ||
      user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      'Cliente';

    const testimonioId = crypto.randomUUID();
    const ahora = new Date().toISOString();

    // Guardar como testimonio pendiente de moderación, tipo 'formateo'.
    await d1Execute(
      `INSERT INTO testimonios
         (id, cliente_email, cliente_nombre, mensaje, producto_relacionado,
          calificacion, estado, created_at, tipo, avatar_url, user_id)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?, 'formateo', ?, ?)`,
      [
        testimonioId,
        email,
        nombre,
        mensaje,
        'Servicio técnico / Formateo',
        calificacion,
        ahora,
        user.imageUrl || null,
        user.id || null,
      ]
    );

    // Marcar la invitación como calificada para no volver a mostrar el modal.
    await d1Execute(
      `UPDATE formateo_invitaciones
       SET estado = 'calificado', testimonio_id = ?, calificado_at = ?
       WHERE id = ?`,
      [testimonioId, ahora, invitacion.id]
    );

    // Notificar al admin por Telegram (no bloquea la respuesta si falla).
    notifyNuevaCalificacion({ nombre, email, calificacion, mensaje }).catch(() => {});

    return NextResponse.json({
      success: true,
      message:
        '¡Gracias por tu calificación! La revisaremos y se publicará pronto.',
    });
  } catch (error) {
    console.error('Error en POST /api/formateo/mi-invitacion:', error);
    return NextResponse.json(
      { error: 'Error al enviar tu calificación' },
      { status: 500 }
    );
  }
}
