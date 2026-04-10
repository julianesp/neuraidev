import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Eliminar productos de la tienda primero
    await supabase
      .from("products")
      .delete()
      .eq("clerk_user_id", userId);

    // Eliminar la tienda
    const { error } = await supabase
      .from("tiendas")
      .delete()
      .eq("clerk_user_id", userId);

    if (error) throw error;

    // Quitar rol "tienda" en Clerk
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { role: null },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando tienda:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
