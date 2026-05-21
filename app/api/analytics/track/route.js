import { NextResponse } from "next/server";
import { d1Execute } from "@/lib/db-d1";

export async function POST() {
  try {
    // Fecha actual en Colombia (UTC-5)
    const now = new Date();
    const offsetMs = (-5 - (-now.getTimezoneOffset() / 60)) * 3600000;
    const local = new Date(now.getTime() + offsetMs);
    const today = local.toISOString().split("T")[0]; // YYYY-MM-DD

    const now2 = new Date().toISOString();
    // Intentar actualizar primero; si no existe la fila, insertar
    const meta = await d1Execute(
      `UPDATE page_views SET visits = visits + 1, updated_at = ? WHERE date = ?`,
      [now2, today]
    );
    if ((meta.changes ?? 0) === 0) {
      await d1Execute(
        `INSERT INTO page_views (date, visits, created_at, updated_at) VALUES (?, 1, ?, ?)`,
        [today, now2, now2]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[track] Exception:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
