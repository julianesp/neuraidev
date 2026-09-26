import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Correo del negocio al que llegan las sugerencias del buzón de la app.
const DESTINO = process.env.SUGERENCIAS_TO || "admin@neurai.dev";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@neurai.dev";

/** Escapa texto para insertarlo con seguridad en el HTML del email. */
function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * POST /api/sugerencias
 * body: { tipo, tipoLabel, nombre, email, mensaje }
 * Envía la sugerencia del buzón de la app al correo del negocio vía Resend.
 * Público (no requiere sesión). Si el usuario dejó su correo, se pone como
 * reply-to para poder responderle directamente.
 */
export async function POST(request) {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error("[sugerencias] RESEND_API_KEY no configurado");
      return NextResponse.json(
        { error: "El correo no está configurado en el servidor." },
        { status: 500, headers: corsHeaders },
      );
    }

    const body = await request.json().catch(() => ({}));
    const mensaje = typeof body.mensaje === "string" ? body.mensaje.trim() : "";
    if (!mensaje) {
      return NextResponse.json(
        { error: "El mensaje está vacío." },
        { status: 400, headers: corsHeaders },
      );
    }

    const tipoLabel = (body.tipoLabel || body.tipo || "Sugerencia").toString().slice(0, 60);
    const nombre = (body.nombre || "").toString().trim().slice(0, 120);
    const emailUsuario = (body.email || "").toString().trim().slice(0, 200);
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailUsuario);

    const asunto = `Buzón app · ${tipoLabel}${nombre ? ` — ${nombre}` : ""}`;
    const html = `
      <div style="font-family: -apple-system, Roboto, sans-serif; color:#111; max-width:600px;">
        <h2 style="color:#0070f3; margin:0 0 4px;">Nuevo mensaje del buzón</h2>
        <p style="color:#6b7280; margin:0 0 16px;">Enviado desde la app de neurai.dev</p>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr><td style="color:#6b7280; padding:4px 0; width:90px;">Tipo</td><td><b>${esc(tipoLabel)}</b></td></tr>
          ${nombre ? `<tr><td style="color:#6b7280; padding:4px 0;">Nombre</td><td>${esc(nombre)}</td></tr>` : ""}
          ${emailUsuario ? `<tr><td style="color:#6b7280; padding:4px 0;">Correo</td><td>${esc(emailUsuario)}</td></tr>` : ""}
        </table>
        <div style="margin-top:16px; padding:14px 16px; background:#f3f4f6; border-radius:10px; white-space:pre-wrap;">${esc(mensaje)}</div>
      </div>`;

    const emailData = {
      from: FROM_EMAIL,
      to: [DESTINO],
      subject: asunto,
      html,
    };
    // Si el usuario dejó un correo válido, permite responderle directo.
    if (emailValido) emailData.reply_to = emailUsuario;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[sugerencias] Resend error:", err);
      return NextResponse.json(
        { error: "No se pudo enviar el mensaje." },
        { status: 502, headers: corsHeaders },
      );
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("[sugerencias] error:", error);
    return NextResponse.json(
      { error: "Error enviando la sugerencia." },
      { status: 500, headers: corsHeaders },
    );
  }
}
