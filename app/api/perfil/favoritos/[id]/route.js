import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * DELETE /api/perfil/favoritos/[id]
 * Elimina un producto de favoritos
 * [id] es el producto_id
 */
export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = params;
    const supabase = getSupabaseClient();

    console.log(`🗑️ Eliminando favorito del producto: ${id}`);

    // Eliminar por producto_id (que es lo que se envía desde el frontend)
    const { data, error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("clerk_user_id", userId)
      .eq("producto_id", id)
      .select();

    if (error) {
      console.error("❌ Error al eliminar favorito:", error);
      return NextResponse.json(
        { error: "Error al eliminar favorito", details: error.message },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      console.warn(`⚠️ No se encontró favorito para eliminar: ${id}`);
      return NextResponse.json({
        success: true,
        message: "Favorito no encontrado, pero operación completada",
      });
    }

    console.log(`✅ Favorito eliminado exitosamente:`, data);
    return NextResponse.json({ success: true, deleted: data.length });
  } catch (error) {
    console.error("Error en DELETE /api/perfil/favoritos/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 },
    );
  }
}
