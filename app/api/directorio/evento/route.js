import { NextResponse } from "next/server";
import { d1SelectOne } from "@/lib/db-d1";
import { TIPOS_EVENTO, registrarEvento } from "@/lib/directorio/stats";

export const dynamic = "force-dynamic";

// Freno básico contra abuso: un mismo visitante cuenta una vez por negocio y
// tipo cada minuto (en memoria; basta para evitar clics repetidos o scripts simples).
const recientes = new Map();

// POST { id, tipo: "whatsapp" | "llamar" | "mapa" }  (público, lo envía la ficha con sendBeacon)
export async function POST(request) {
  try {
    const { id, tipo } = await request.json();
    if (!id || !TIPOS_EVENTO.includes(tipo) || tipo === "vista") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anon";
    const clave = `${ip}|${id}|${tipo}`;
    const ahora = Date.now();
    if (recientes.size > 5000) recientes.clear();
    if (ahora - (recientes.get(clave) || 0) < 60_000) return NextResponse.json({ ok: true });
    recientes.set(clave, ahora);

    const existe = await d1SelectOne(
      "SELECT 1 AS x FROM directorio_negocios WHERE id = ? AND estado = 'aprobado'",
      [String(id)]
    );
    if (existe) await registrarEvento(String(id), tipo);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
