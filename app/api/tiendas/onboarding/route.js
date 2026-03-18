import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, descripcion, categoria, ciudad, telefono } = body;

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    if (!categoria) {
      return NextResponse.json({ error: "La categoría es obligatoria" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Verificar si ya existe perfil
    const { data: existente } = await supabase
      .from("tiendas")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (existente) {
      // Actualizar
      const { error } = await supabase
        .from("tiendas")
        .update({
          nombre: nombre.trim(),
          descripcion: descripcion?.trim() || null,
          categoria,
          ciudad: ciudad?.trim() || null,
          telefono: telefono?.trim() || null,
          onboarding_completado: true,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_user_id", userId);

      if (error) throw error;
    } else {
      // Insertar nuevo
      const { error } = await supabase.from("tiendas").insert({
        clerk_user_id: userId,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        categoria,
        ciudad: ciudad?.trim() || null,
        telefono: telefono?.trim() || null,
        onboarding_completado: true,
        activa: true,
      });

      if (error) throw error;
    }

    // Asignar rol "tienda" en Clerk automáticamente
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { role: "tienda" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en onboarding de tienda:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("tiendas")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({ tienda: data || null });
  } catch (error) {
    console.error("Error obteniendo tienda:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
