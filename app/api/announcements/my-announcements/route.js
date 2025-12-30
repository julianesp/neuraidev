import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/announcements/my-announcements - Obtener anuncios del usuario actual
 * Solo retorna los anuncios creados por el usuario autenticado
 */
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Obtener solo los anuncios del usuario actual
    const { data, error } = await supabase
      .from('community_announcements')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error obteniendo mis anuncios:", error);
      return NextResponse.json(
        { error: "Error obteniendo tus anuncios", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      announcements: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error("Error en /api/announcements/my-announcements:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
