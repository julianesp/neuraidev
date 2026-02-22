import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/db';
import { sendNewProductNotification } from '@/lib/emailService';
import { auth } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth/roles';

/**
 * POST /api/notifications/send-new-product
 * Enviar notificaciones de nuevo producto a suscriptores
 * Solo puede ser llamado por administradores o internamente
 */
export async function POST(request) {
  try {
    // Verificar autenticación y permisos de admin
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await auth();
    const adminStatus = await isAdmin(user);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const body = await request.json();
    const { producto } = body;

    if (!producto || !producto.id) {
      return NextResponse.json(
        { error: 'Información del producto requerida' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Obtener suscriptores activos y confirmados
    let query = supabase
      .from('product_subscribers')
      .select('*')
      .eq('activo', true)
      .eq('confirmado', true);

    // Si el producto tiene categoría, filtrar suscriptores interesados
    if (producto.categoria) {
      // Obtener todos que quieren notificaciones de todos los productos
      // O los que tienen esta categoría en sus intereses
      query = query.or(`notificar_todos.eq.true,categorias_interes.cs.{${producto.categoria}}`);
    }

    const { data: subscribers, error } = await query;

    if (error) {
      console.error('Error obteniendo suscriptores:', error);
      return NextResponse.json(
        { error: 'Error al obtener suscriptores' },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay suscriptores para notificar',
        notificaciones_enviadas: 0,
      });
    }

    console.log(`📧 Enviando notificaciones a ${subscribers.length} suscriptores...`);

    // Enviar emails
    const resultado = await sendNewProductNotification(subscribers, producto);

    // Registrar en log de notificaciones
    const logsToInsert = resultado.results.map(r => ({
      subscriber_id: subscribers.find(s => s.email === r.email)?.id,
      product_id: producto.id,
      product_name: producto.nombre,
      product_category: producto.categoria,
      email_enviado_a: r.email,
      enviado: r.success,
      error: r.success ? null : JSON.stringify(r.error),
      enviado_at: r.success ? new Date().toISOString() : null,
    }));

    await supabase.from('product_notifications_log').insert(logsToInsert);

    // Actualizar timestamp de última notificación para cada suscriptor
    const successEmails = resultado.results.filter(r => r.success).map(r => r.email);
    if (successEmails.length > 0) {
      await supabase
        .from('product_subscribers')
        .update({ ultima_notificacion: new Date().toISOString() })
        .in('email', successEmails);
    }

    const exitosos = resultado.results.filter(r => r.success).length;
    const fallidos = resultado.results.filter(r => !r.success).length;

    console.log(`✅ Notificaciones enviadas: ${exitosos} exitosas, ${fallidos} fallidas`);

    return NextResponse.json({
      success: true,
      message: `Notificaciones enviadas: ${exitosos} exitosas, ${fallidos} fallidas`,
      notificaciones_enviadas: exitosos,
      notificaciones_fallidas: fallidos,
      total_suscriptores: subscribers.length,
      detalles: resultado.results,
    });

  } catch (error) {
    console.error('Error en POST /api/notifications/send-new-product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
