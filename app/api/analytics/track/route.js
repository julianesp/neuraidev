import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

export async function POST() {
  try {
    const supabase = getSupabaseClient();

    // Fecha actual en Colombia (UTC-5)
    const now = new Date();
    const offsetMs = (-5 - (-now.getTimezoneOffset() / 60)) * 3600000;
    const local = new Date(now.getTime() + offsetMs);
    const today = local.toISOString().split("T")[0]; // YYYY-MM-DD

    // Usar función atómica para evitar race conditions
    const { error } = await supabase.rpc("increment_page_view", { p_date: today });

    if (error) {
      console.error("[track]", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[track] Exception:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
