import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * PUT /api/perfil/direcciones/[id]
 * Actualiza una dirección del usuario actual
 */
export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const {
      nombre_completo,
      telefono,
      direccion_linea1,
      direccion_linea2,
      ciudad,
      departamento,
      codigo_postal,
      pais,
      tipo,
      es_predeterminada,
      notas,
    } = body;

    const supabase = getSupabaseClient();

    // Si es predeterminada, quitar el flag de las demás
    if (es_predeterminada) {
      await supabase
        .from("user_addresses")
        .update({ es_predeterminada: false })
        .eq("clerk_user_id", userId)
        .neq("id", id);
    }

    // Actualizar la dirección
    const { data, error } = await supabase
      .from("user_addresses")
      .update({
        nombre_completo,
        telefono,
        direccion_linea1,
        direccion_linea2,
        ciudad,
        departamento,
        codigo_postal,
        pais,
        tipo,
        es_predeterminada,
        notas,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("clerk_user_id", userId) // Seguridad: solo actualizar direcciones propias
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar dirección:", error);
      return NextResponse.json(
        { error: "Error al actualizar dirección" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Dirección no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en PUT /api/perfil/direcciones/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/perfil/direcciones/[id]
 * Elimina una dirección del usuario actual
 */
export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { id } = params;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", id)
      .eq("clerk_user_id", userId); // Seguridad: solo eliminar direcciones propias

    if (error) {
      console.error("Error al eliminar dirección:", error);
      return NextResponse.json(
        { error: "Error al eliminar dirección" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en DELETE /api/perfil/direcciones/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
