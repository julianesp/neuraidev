import { NextResponse, after } from "next/server";
import { d1Execute, d1Select, d1SelectOne } from "@/lib/db-d1";
import { firmaValida, enviarTexto, marcarLeido } from "@/lib/whatsapp";
import { responderAsistente } from "@/lib/asistenteVentas";
import { notifyNewLead } from "@/lib/notificationService";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET — Meta verifica el webhook al configurarlo (hub.challenge)
export async function GET(request) {
  const p = new URL(request.url).searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (token && p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === token) {
    return new Response(p.get("hub.challenge") || "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// POST — mensajes entrantes y estados de entrega
export async function POST(request) {
  const raw = await request.text();
  if (!firmaValida(raw, request.headers.get("x-hub-signature-256"))) {
    console.warn("[WHATSAPP] Firma inválida o WHATSAPP_APP_SECRET sin configurar");
    return new Response("Invalid signature", { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  // Meta exige responder rápido; el asistente corre después de contestar 200.
  after(async () => {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const nombres = Object.fromEntries(
          (value.contacts || []).map((c) => [c.wa_id, c.profile?.name || null])
        );
        for (const msg of value.messages || []) {
          try {
            await procesarMensaje(msg, nombres[msg.from]);
          } catch (e) {
            console.error("[WHATSAPP] Error procesando mensaje:", e);
          }
        }
        for (const st of value.statuses || []) {
          if (st.status === "failed") {
            console.error("[WHATSAPP] Mensaje no entregado:", st.recipient_id, JSON.stringify(st.errors));
          }
        }
      }
    }
  });

  return NextResponse.json({ ok: true });
}

function textoDelMensaje(msg) {
  switch (msg.type) {
    case "text":
      return msg.text?.body || "";
    case "button":
      return msg.button?.text || "";
    case "interactive":
      return msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || "";
    default:
      return "";
  }
}

async function procesarMensaje(msg, nombre) {
  const telefono = msg.from;
  const texto = textoDelMensaje(msg);
  const resumen = texto || `[${msg.type}]`;

  // Guardar (wa_message_id es UNIQUE: si Meta reintenta el mismo mensaje, no se responde dos veces)
  const ins = await d1Execute(
    `INSERT OR IGNORE INTO whatsapp_mensajes (telefono, direccion, tipo, texto, wa_message_id, origen)
     VALUES (?, 'entrante', ?, ?, ?, 'cliente')`,
    [telefono, msg.type === "text" ? "texto" : msg.type, resumen, msg.id]
  );
  if (!ins?.changes) return;

  await d1Execute(
    `INSERT INTO whatsapp_conversaciones (telefono, nombre, no_leidos, ultimo_mensaje, ultimo_entrante_at, updated_at)
     VALUES (?, ?, 1, ?, datetime('now'), datetime('now'))
     ON CONFLICT(telefono) DO UPDATE SET
       nombre = COALESCE(excluded.nombre, whatsapp_conversaciones.nombre),
       no_leidos = whatsapp_conversaciones.no_leidos + 1,
       ultimo_mensaje = excluded.ultimo_mensaje,
       ultimo_entrante_at = excluded.ultimo_entrante_at,
       updated_at = datetime('now')`,
    [telefono, nombre, resumen.slice(0, 200)]
  );

  marcarLeido(msg.id);

  const conv = await d1SelectOne(
    "SELECT bot_pausado FROM whatsapp_conversaciones WHERE telefono = ?",
    [telefono]
  );
  if (conv?.bot_pausado) return; // la está atendiendo una persona desde el panel

  if (!texto) {
    await enviarTexto(
      telefono,
      "Por ahora solo puedo leer mensajes de texto 🙏 ¿Me escribes lo que necesitas? Si es algo que hay que ver, el equipo te responde aquí mismo en horario de atención."
    );
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) return;

  // Contexto: últimos mensajes de las últimas 24 h
  const historial = await d1Select(
    `SELECT direccion, texto FROM whatsapp_mensajes
     WHERE telefono = ? AND created_at >= datetime('now', '-1 day')
     ORDER BY id DESC LIMIT 20`,
    [telefono]
  );
  const mensajes = [];
  for (const m of historial.reverse()) {
    const role = m.direccion === "entrante" ? "user" : "assistant";
    if (!m.texto) continue;
    const ultimo = mensajes[mensajes.length - 1];
    if (ultimo && ultimo.role === role) ultimo.content += `\n${m.texto}`;
    else mensajes.push({ role, content: m.texto });
  }
  while (mensajes.length && mensajes[0].role !== "user") mensajes.shift();
  if (!mensajes.length || mensajes[mensajes.length - 1].role !== "user") return;

  const { texto: respuesta, lead } = await responderAsistente(mensajes, { canal: "whatsapp" });
  if (respuesta) await enviarTexto(telefono, respuesta, "asistente");

  if (lead) {
    notifyNewLead({
      ...lead,
      nombre: lead.nombre || nombre || "",
      telefono: `+${telefono} (WhatsApp)`,
    }).catch(() => {});
  }
}
