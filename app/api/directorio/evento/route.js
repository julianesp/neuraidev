import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { d1SelectOne } from "@/lib/db-d1";
import { isAdminServer } from "@/lib/auth/server-roles";
import { registrarVista } from "@/lib/directorio/negocios";
import { TIPOS_EVENTO, registrarEvento } from "@/lib/directorio/stats";

export const dynamic = "force-dynamic";

// Robots y vistas previas de enlaces (Google, WhatsApp, Facebook, monitores…) no son clientes.
const ES_ROBOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch/i;

// Freno extra contra repeticiones (en memoria, por instancia): una vista por visitante y negocio cada
// 30 min; el resto de eventos una vez por minuto. El control principal es el del navegador (una vista por sesión).
const recientes = new Map();

// POST { id, tipo: "vista" | "whatsapp" | "llamar" | "mapa" }  (público; lo envía la ficha con sendBeacon)
// No cuenta: robots, ni al dueño del negocio ni al admin (para que sus pruebas no inflen los números).
export async function POST(request) {
  try {
    const { id, tipo } = await request.json();
    if (!id || !TIPOS_EVENTO.includes(tipo)) return NextResponse.json({ ok: false }, { status: 400 });

    const ua = request.headers.get("user-agent") || "";
    if (!ua || ES_ROBOT.test(ua)) return NextResponse.json({ ok: true });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anon";
    const clave = `${ip}|${id}|${tipo}`;
    const ahora = Date.now();
    const ventana = tipo === "vista" ? 30 * 60_000 : 60_000;
    if (recientes.size > 5000) recientes.clear();
    if (ahora - (recientes.get(clave) || 0) < ventana) return NextResponse.json({ ok: true });
    recientes.set(clave, ahora);

    const negocio = await d1SelectOne(
      "SELECT owner_id FROM directorio_negocios WHERE id = ? AND estado = 'aprobado'",
      [String(id)]
    );
    if (!negocio) return NextResponse.json({ ok: true });

    // Si quien mira es el dueño (o el admin), no se cuenta.
    const user = await currentUser().catch(() => null);
    if (user && (user.id === negocio.owner_id || isAdminServer(user))) return NextResponse.json({ ok: true });

    if (tipo === "vista") await registrarVista(String(id));
    else await registrarEvento(String(id), tipo);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
