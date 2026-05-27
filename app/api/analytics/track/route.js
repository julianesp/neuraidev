import { NextResponse } from "next/server";
import { d1Execute } from "@/lib/db-d1";

function getDevice(userAgent = "") {
  if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) return "mobile";
  if (/tablet/i.test(userAgent)) return "tablet";
  return "desktop";
}

// Mapa de códigos de país ISO a nombres en español
const COUNTRY_NAMES = {
  CO: "Colombia", US: "Estados Unidos", MX: "México", AR: "Argentina",
  ES: "España", PE: "Perú", CL: "Chile", VE: "Venezuela", EC: "Ecuador",
  BO: "Bolivia", PY: "Paraguay", UY: "Uruguay", CR: "Costa Rica",
  PA: "Panamá", DO: "República Dominicana", GT: "Guatemala", HN: "Honduras",
  SV: "El Salvador", NI: "Nicaragua", CU: "Cuba", PR: "Puerto Rico",
  BR: "Brasil", PT: "Portugal", DE: "Alemania", FR: "Francia",
  IT: "Italia", GB: "Reino Unido", CA: "Canadá", AU: "Australia",
  JP: "Japón", CN: "China", KR: "Corea del Sur", IN: "India",
};

export async function POST(request) {
  try {
    const now = new Date();
    const offsetMs = (-5 - (-now.getTimezoneOffset() / 60)) * 3600000;
    const local = new Date(now.getTime() + offsetMs);
    const today = local.toISOString().split("T")[0];
    const nowIso = now.toISOString();

    // Actualizar contador diario (upsert)
    const meta = await d1Execute(
      `UPDATE page_views SET visits = visits + 1, updated_at = ? WHERE date = ?`,
      [nowIso, today]
    );
    if ((meta.changes ?? 0) === 0) {
      await d1Execute(
        `INSERT INTO page_views (id, date, visits, created_at, updated_at) VALUES (unixepoch('now','subsec')*1000, ?, 1, ?, ?)`,
        [today, nowIso, nowIso]
      );
    }

    // Capturar datos del visitante
    const headers = request.headers;

    // País vía Cloudflare (en producción viene automático)
    const countryCode = headers.get("cf-ipcountry") || headers.get("x-vercel-ip-country") || "XX";
    const country = COUNTRY_NAMES[countryCode] || countryCode;

    // Ciudad vía Cloudflare
    const city = headers.get("cf-ipcity") || headers.get("x-vercel-ip-city") || null;

    // Página visitada
    let body = {};
    try { body = await request.json(); } catch {}
    const page = body.page || "/";

    // Dispositivo vía User-Agent
    const ua = headers.get("user-agent") || "";
    const device = getDevice(ua);

    // Guardar detalle de la visita
    await d1Execute(
      `INSERT INTO visit_details (date, country_code, country, city, page, device, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [today, countryCode, country, city, page, device, nowIso]
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[track] Exception:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
