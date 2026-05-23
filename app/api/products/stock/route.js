import { NextResponse } from "next/server";
import { d1SelectOne } from "@/lib/db-d1";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  try {
    const row = await d1SelectOne(
      "SELECT stock FROM products WHERE id = ?",
      [id]
    );

    if (!row) {
      // Producto no existe en D1 (es del catálogo JSON) — stock ilimitado
      return NextResponse.json({ stock: 999, source: "json" });
    }

    return NextResponse.json({ stock: row.stock ?? 999, source: "d1" });
  } catch {
    return NextResponse.json({ stock: 999, source: "fallback" });
  }
}
