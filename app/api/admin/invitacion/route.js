import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { isAdminServer } from "@/lib/auth/server-roles";
import { d1Select, d1Execute } from "@/lib/db-d1";

export const dynamic = "force-dynamic";

async function esAdmin() {
  const user = await currentUser();
  return !!user && isAdminServer(user);
}

// GET /api/admin/invitacion — lista los WhatsApp guardados (más recientes primero)
export async function GET() {
  if (!(await esAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const respuestas = await d1Select(
    "SELECT id, whatsapp, created_at FROM invitacion_respuestas ORDER BY id DESC"
  );
  return NextResponse.json({ respuestas });
}

// POST /api/admin/invitacion — guarda el WhatsApp escrito en /dashboard/invitacion
export async function POST(request) {
  if (!(await esAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { whatsapp } = await request.json().catch(() => ({}));
  const numero = String(whatsapp || "").replace(/\D/g, "").slice(0, 15);
  if (numero.length < 10) {
    return NextResponse.json({ error: "Número inválido" }, { status: 400 });
  }
  try {
    await d1Execute("INSERT INTO invitacion_respuestas (whatsapp) VALUES (?)", [numero]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[invitacion] Error guardando WhatsApp:", error);
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }
}

// DELETE /api/admin/invitacion?id=123 — borra una respuesta
export async function DELETE(request) {
  if (!(await esAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  await d1Execute("DELETE FROM invitacion_respuestas WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
