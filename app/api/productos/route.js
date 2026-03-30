import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUserWithRole } from '@/lib/auth/server-roles';

// Cliente de Supabase con Service Role (bypass RLS)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * GET /api/productos - Obtener todos los productos (para admin)
 */
export async function GET(request) {
  try {
    // Verificar autenticación con Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar si es admin para decidir el filtro
    const { isAdmin } = await getCurrentUserWithRole();

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const disponible = searchParams.get('disponible');

    // Crear cliente admin que bypasea RLS
    const supabase = createAdminClient();

    // Si es admin, traer todos los productos; si no, solo los del usuario
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('clerk_user_id', userId);
    }

    // Filtrar por disponibilidad si se solicita
    if (disponible === 'true') {
      query = query.eq('disponible', true).gt('stock', 0);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [API] Error obteniendo productos:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [API] ${data?.length || 0} productos obtenidos`);

    // Devolver en formato esperado por el componente
    return NextResponse.json({
      productos: data || [],
      total: data?.length || 0
    });

  } catch (error) {
    console.error('❌ [API] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/productos - Crear nuevo producto
 * Opcionalmente envía notificaciones a suscriptores
 */
export async function POST(request) {
  try {
    // Verificar autenticación con Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { send_notifications = true, ...productoData } = body;

    // Crear cliente admin que bypasea RLS
    const supabase = createAdminClient();

    // Insertar producto vinculado al usuario autenticado
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...productoData, clerk_user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('❌ [API] Error creando producto:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [API] Producto creado:', data.id);

    // Enviar notificaciones automáticamente si está habilitado
    let notificationResult = null;
    if (send_notifications && data) {
      try {
        console.log('📧 [API] Enviando notificaciones para producto:', data.nombre);

        // Llamar al endpoint de notificaciones
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const notificationResponse = await fetch(`${baseUrl}/api/notifications/send-new-product`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Pasar el token de autenticación para que la API de notificaciones
            // pueda verificar que es una llamada interna autorizada
            'Authorization': `Bearer ${userId}`,
          },
          body: JSON.stringify({
            producto: {
              id: data.id,
              nombre: data.nombre,
              descripcion: data.descripcion,
              precio: data.precio,
              categoria: data.categoria,
              imagenes: data.imagenes,
            },
          }),
        });

        if (notificationResponse.ok) {
          notificationResult = await notificationResponse.json();
          console.log('✅ [API] Notificaciones enviadas:', notificationResult.notificaciones_enviadas);
        } else {
          console.warn('⚠️ [API] Error enviando notificaciones:', await notificationResponse.text());
        }
      } catch (notificationError) {
        // No fallar la creación del producto si las notificaciones fallan
        console.error('⚠️ [API] Error al enviar notificaciones (no crítico):', notificationError);
      }
    }

    return NextResponse.json({
      ...data,
      _notifications: notificationResult ? {
        enviadas: notificationResult.notificaciones_enviadas || 0,
        fallidas: notificationResult.notificaciones_fallidas || 0,
      } : null,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [API] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
