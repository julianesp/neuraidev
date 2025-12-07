import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/perfil
 * Obtiene el perfil del usuario actual
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Buscar o crear perfil
    let { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    // Si no existe, crear uno nuevo
    if (error && error.code === "PGRST116") {
      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          clerk_user_id: userId,
          preferencias_notificaciones: {
            email_promociones: true,
            email_pedidos: true,
            email_novedades: false,
            push_promociones: false,
            push_pedidos: true,
          },
        })
        .select()
        .single();

      if (createError) {
        console.error("Error al crear perfil:", createError);
        return NextResponse.json(
          { error: "Error al crear perfil" },
          { status: 500 }
        );
      }

      profile = newProfile;
    } else if (error) {
      console.error("Error al obtener perfil:", error);
      return NextResponse.json(
        { error: "Error al obtener perfil" },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error en GET /api/perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/perfil
 * Actualiza el perfil del usuario actual
 */
export async function PUT(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { telefono, fecha_nacimiento, preferencias_notificaciones } = body;

    const supabase = getSupabaseClient();

    // Actualizar perfil
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        telefono,
        fecha_nacimiento,
        preferencias_notificaciones,
        updated_at: new Date().toISOString(),
      })
      .eq("clerk_user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar perfil:", error);
      return NextResponse.json(
        { error: "Error al actualizar perfil" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en PUT /api/perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
