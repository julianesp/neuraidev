import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("tiendas")
      .select("id, nombre, descripcion, categoria, ciudad, logo_url")
      .eq("activa", true)
      .eq("onboarding_completado", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ tiendas: data || [] });
  } catch (error) {
    console.error("Error obteniendo tiendas públicas:", error);
    return NextResponse.json({ tiendas: [] });
  }
}
