import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/announcements - Obtener anuncios activos
 * Query params:
 * - active: true/false (default: true) - Solo anuncios activos
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const supabase = getSupabaseClient();

    let announcements;

    if (activeOnly) {
      // Usar la función de Supabase para obtener solo anuncios activos
      const { data, error } = await supabase
        .rpc('get_active_announcements');

      if (error) {
        console.error("Error obteniendo anuncios activos:", error);
        return NextResponse.json(
          { error: "Error obteniendo anuncios", details: error.message },
          { status: 500 }
        );
      }

      announcements = data;
    } else {
      // Obtener todos los anuncios (para admin)
      const { data, error } = await supabase
        .from('community_announcements')
        .select('*')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error obteniendo anuncios:", error);
        return NextResponse.json(
          { error: "Error obteniendo anuncios", details: error.message },
          { status: 500 }
        );
      }

      announcements = data;
    }

    return NextResponse.json({
      success: true,
      announcements,
      count: announcements.length
    });

  } catch (error) {
    console.error("Error en /api/announcements:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/announcements - Crear nuevo anuncio
 * Requiere autenticación
 */
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado. Debes estar registrado para crear anuncios." },
        { status: 401 }
      );
    }

    const { title, content, type, priority, endDate, icon, imageUrl, redirectUrl, authorName } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Título y contenido son requeridos" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Obtener información del usuario de Clerk
    const { clerkClient } = await import("@clerk/nextjs/server");
    const user = await clerkClient().users.getUser(userId);

    // Usar authorName del formulario o nombre del usuario
    const finalAuthorName = authorName || user.fullName || user.firstName || user.username || 'Usuario';
    const authorEmail = user.emailAddresses?.[0]?.emailAddress || '';

    // Crear anuncio
    const { data, error } = await supabase
      .from('community_announcements')
      .insert({
        title,
        content,
        type: type || 'info',
        priority: priority || 5,
        author_id: userId,
        author_name: finalAuthorName,
        author_email: authorEmail,
        end_date: endDate || null,
        icon: icon || '📢',
        image_url: imageUrl || null,
        redirect_url: redirectUrl || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error("Error creando anuncio:", error);
      return NextResponse.json(
        { error: "Error creando anuncio", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      announcement: data
    }, { status: 201 });

  } catch (error) {
    console.error("Error en POST /api/announcements:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/announcements - Actualizar anuncio
 */
export async function PATCH(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id, title, content, type, priority, endDate, status, icon, imageUrl, redirectUrl, authorName } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID del anuncio es requerido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Construir objeto de actualización
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (priority !== undefined) updateData.priority = priority;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (status !== undefined) updateData.status = status;
    if (icon !== undefined) updateData.icon = icon;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (redirectUrl !== undefined) updateData.redirect_url = redirectUrl;
    if (authorName !== undefined) updateData.author_name = authorName;

    const { data, error } = await supabase
      .from('community_announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando anuncio:", error);
      return NextResponse.json(
        { error: "Error actualizando anuncio", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      announcement: data
    });

  } catch (error) {
    console.error("Error en PATCH /api/announcements:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/announcements - Eliminar anuncio
 */
export async function DELETE(request) {
  try {
    const { userId } = await auth();

    // Verificar autenticación (permitir en desarrollo desde localhost)
    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost = request.headers.get('host')?.includes('localhost') ||
                        request.headers.get('host')?.includes('127.0.0.1');

    if (!userId && !(isDev && isLocalhost)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "ID del anuncio es requerido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('community_announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error eliminando anuncio:", error);
      return NextResponse.json(
        { error: "Error eliminando anuncio", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Anuncio eliminado exitosamente"
    });

  } catch (error) {
    console.error("Error en DELETE /api/announcements:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
