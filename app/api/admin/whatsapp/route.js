import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { isAdminServer } from "@/lib/auth/server-roles";
import { d1Select, d1Execute } from "@/lib/db-d1";
import { enviarTexto, whatsappConfigurado } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

async function esAdmin() {
  const user = await currentUser();
  return !!user && isAdminServer(user);
}

const noAutorizado = () => NextResponse.json({ error: "No autorizado" }, { status: 403 });

// GET /api/admin/whatsapp            → lista de conversaciones
// GET /api/admin/whatsapp?telefono=… → mensajes de una conversación (y la marca como leída)
export async function GET(request) {
  if (!(await esAdmin())) return noAutorizado();
  const telefono = new URL(request.url).searchParams.get("telefono");

  if (!telefono) {
    const conversaciones = await d1Select(
      `SELECT telefono, nombre, bot_pausado, no_leidos, ultimo_mensaje, ultimo_entrante_at, updated_at
       FROM whatsapp_conversaciones ORDER BY updated_at DESC LIMIT 200`
    );
    return NextResponse.json({ conversaciones, configurado: whatsappConfigurado() });
  }

  const mensajes = await d1Select(
    `SELECT id, direccion, tipo, texto, origen, created_at FROM (
       SELECT * FROM whatsapp_mensajes WHERE telefono = ? ORDER BY id DESC LIMIT 200
     ) ORDER BY id ASC`,
    [telefono]
  );
  await d1Execute("UPDATE whatsapp_conversaciones SET no_leidos = 0 WHERE telefono = ?", [telefono]);
  return NextResponse.json({ mensajes });
}

// POST /api/admin/whatsapp { telefono, texto } → responder a mano (pausa el asistente en ese chat)
export async function POST(request) {
  if (!(await esAdmin())) return noAutorizado();
  const { telefono, texto } = await request.json().catch(() => ({}));
  if (!telefono || !String(texto || "").trim()) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }
  const r = await enviarTexto(telefono, String(texto).trim(), "admin");
  if (!r.ok) {
    return NextResponse.json({ error: r.error }, { status: 502 });
  }
  await d1Execute("UPDATE whatsapp_conversaciones SET bot_pausado = 1 WHERE telefono = ?", [telefono]);
  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/whatsapp { telefono, bot_pausado } → pausar o reactivar el asistente
export async function PATCH(request) {
  if (!(await esAdmin())) return noAutorizado();
  const { telefono, bot_pausado } = await request.json().catch(() => ({}));
  if (!telefono) return NextResponse.json({ error: "Falta teléfono" }, { status: 400 });
  await d1Execute("UPDATE whatsapp_conversaciones SET bot_pausado = ? WHERE telefono = ?", [
    bot_pausado ? 1 : 0,
    telefono,
  ]);
  return NextResponse.json({ ok: true });
}
