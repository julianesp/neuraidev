import { NextResponse } from "next/server";
import { d1SelectOne } from "@/lib/db-d1";
import { stockDeColor } from "@/lib/stockColor";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const color = searchParams.get("color");

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  try {
    const row = await d1SelectOne(
      "SELECT stock, metadata FROM products WHERE id = ?",
      [id]
    );

    if (!row) {
      // Producto no existe en D1 (es del catálogo JSON) — stock ilimitado
      return NextResponse.json({ stock: 999, source: "json" });
    }

    // Con color: las unidades de ese color (si el producto maneja stock por color)
    const deColor = color ? stockDeColor(row.metadata, color) : null;
    if (deColor !== null) {
      return NextResponse.json({ stock: Math.min(deColor, row.stock ?? deColor), source: "d1-color" });
    }
    return NextResponse.json({ stock: row.stock ?? 999, source: "d1" });
  } catch {
    return NextResponse.json({ stock: 999, source: "fallback" });
  }
}
