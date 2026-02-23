import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/db';
import crypto from 'crypto';

/**
 * POST /api/notifications/subscribe
 * Suscribir un usuario a notificaciones de productos
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, nombre, notificar_todos = true, categorias_interes = [], clerk_user_id = null } = body;

    // Validación
    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Verificar si el email ya está suscrito
    const { data: existingSubscriber } = await supabase
      .from('product_subscribers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    // Generar token de confirmación
    const tokenConfirmacion = crypto.randomBytes(32).toString('hex');

    if (existingSubscriber) {
      // Si ya existe, actualizar preferencias
      const { data, error } = await supabase
        .from('product_subscribers')
        .update({
          nombre: nombre || existingSubscriber.nombre,
          clerk_user_id: clerk_user_id || existingSubscriber.clerk_user_id,
          notificar_todos,
          categorias_interes: notificar_todos ? [] : categorias_interes,
          activo: true,
          updated_at: new Date().toISOString(),
        })
        .eq('email', email.toLowerCase())
        .select()
        .single();

      if (error) {
        console.error('Error actualizando suscriptor:', error);
        return NextResponse.json(
          { error: 'Error al actualizar la suscripción' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Suscripción actualizada exitosamente',
        subscriber: {
          email: data.email,
          nombre: data.nombre,
          notificar_todos: data.notificar_todos,
          categorias_interes: data.categorias_interes,
        },
      });
    }

    // Crear nuevo suscriptor
    const { data, error } = await supabase
      .from('product_subscribers')
      .insert({
        email: email.toLowerCase(),
        nombre: nombre || null,
        clerk_user_id: clerk_user_id,
        notificar_todos,
        categorias_interes: notificar_todos ? [] : categorias_interes,
        token_confirmacion: tokenConfirmacion,
        confirmado: clerk_user_id ? true : false, // Si tiene Clerk, marcar como confirmado automáticamente
        activo: true,
        ip_registro: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando suscriptor:', error);
      return NextResponse.json(
        { error: 'Error al crear la suscripción' },
        { status: 500 }
      );
    }

    // TODO: Enviar email de confirmación
    // await sendConfirmationEmail(data.email, data.nombre, tokenConfirmacion);

    return NextResponse.json({
      success: true,
      message: 'Suscripción creada exitosamente. Revisa tu email para confirmar.',
      subscriber: {
        email: data.email,
        nombre: data.nombre,
        notificar_todos: data.notificar_todos,
        categorias_interes: data.categorias_interes,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/notifications/subscribe:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/subscribe
 * Dar de baja una suscripción
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email && !token) {
      return NextResponse.json(
        { error: 'Se requiere email o token' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    let query = supabase.from('product_subscribers').update({ activo: false });

    if (token) {
      query = query.eq('token_confirmacion', token);
    } else {
      query = query.eq('email', email.toLowerCase());
    }

    const { error } = await query;

    if (error) {
      console.error('Error desuscribiendo:', error);
      return NextResponse.json(
        { error: 'Error al cancelar la suscripción' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Has sido desuscrito exitosamente',
    });

  } catch (error) {
    console.error('Error en DELETE /api/notifications/subscribe:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
