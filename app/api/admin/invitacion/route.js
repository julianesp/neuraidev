import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { isAdminServer } from "@/lib/auth/server-roles";

export const dynamic = "force-dynamic";

// POST /api/admin/invitacion
// Recibe el WhatsApp escrito en /dashboard/invitacion y lo envía por Telegram al admin.
export async function POST(request) {
  const user = await currentUser();
  if (!user || !isAdminServer(user)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { whatsapp } = await request.json().catch(() => ({}));
  const numero = String(whatsapp || "").replace(/\D/g, "").slice(0, 15);
  if (numero.length < 10) {
    return NextResponse.json({ error: "Número inválido" }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!botToken || !chatId) {
    return NextResponse.json({ ok: false, error: "Telegram no configurado" }, { status: 500 });
  }

  const wa = numero.length === 10 ? `57${numero}` : numero;
  const texto = `😉 <b>¡Aceptó la invitación!</b>\n\n📱 WhatsApp: ${numero}\nhttps://wa.me/${wa}`;

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: texto, parse_mode: "HTML" }),
  });

  return NextResponse.json({ ok: res.ok });
}
