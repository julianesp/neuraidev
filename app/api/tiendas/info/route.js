import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/tiendas/info?clerk_user_id=xxx
 * Retorna whatsapp, nombre y telefono de una tienda dado su clerk_user_id.
 * Ruta pública — solo expone campos necesarios para el checkout por WhatsApp.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clerkUserId = searchParams.get("clerk_user_id");

  if (!clerkUserId) {
    return NextResponse.json({ error: "clerk_user_id requerido" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("tiendas")
    .select("nombre, whatsapp, telefono")
    .eq("clerk_user_id", clerkUserId)
    .eq("activa", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    nombre: data.nombre,
    whatsapp: data.whatsapp || data.telefono || null,
  });
}
