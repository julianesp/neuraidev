import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST /api/announcements/view - Registrar que un usuario vio un anuncio
 * Body: { announcementId, sessionId }
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    const { announcementId, sessionId } = await request.json();

    if (!announcementId) {
      return NextResponse.json(
        { error: "announcementId es requerido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Registrar vista
    const { error } = await supabase
      .rpc('record_announcement_view', {
        p_announcement_id: announcementId,
        p_user_id: userId || null,
        p_session_id: sessionId || null
      });

    if (error) {
      console.error("Error registrando vista:", error);
      return NextResponse.json(
        { error: "Error registrando vista", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vista registrada"
    });

  } catch (error) {
    console.error("Error en /api/announcements/view:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
