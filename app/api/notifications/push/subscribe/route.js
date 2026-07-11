import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/api-auth";
import { d1Execute, d1SelectOne } from "@/lib/db-d1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * POST /api/notifications/push/subscribe
 * Registra (o actualiza) el Expo push token de un dispositivo.
 *
 * Auth OPCIONAL: si llega un Bearer de Clerk válido, el token queda ligado al
 * usuario (clerk_user_id). Si no, se guarda anónimo — necesario para poder
 * avisar a TODOS los que instalaron la app aunque no hayan iniciado sesión.
 *
 * Body: { expoToken: string, platform?: "android" | "ios" }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const expoToken = body?.expoToken;
    const platform = body?.platform || null;

    if (!expoToken || !String(expoToken).startsWith("ExponentPushToken")) {
      return NextResponse.json(
        { error: "expoToken inválido" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Auth opcional: no rechazamos si no hay sesión.
    let clerkUserId = null;
    try {
      const { userId } = await authenticateRequest(request);
      clerkUserId = userId || null;
    } catch {
      clerkUserId = null;
    }

    const ahora = new Date().toISOString();

    // Upsert manual por expo_token (D1 no siempre tiene ON CONFLICT según schema).
    const existente = await d1SelectOne(
      "SELECT id FROM push_tokens WHERE expo_token = ?",
      [expoToken],
    );

    if (existente) {
      await d1Execute(
        "UPDATE push_tokens SET clerk_user_id = ?, platform = ?, updated_at = ? WHERE expo_token = ?",
        [clerkUserId, platform, ahora, expoToken],
      );
    } else {
      await d1Execute(
        "INSERT INTO push_tokens (expo_token, clerk_user_id, platform, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        [expoToken, clerkUserId, platform, ahora, ahora],
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("[push/subscribe] error:", error);
    return NextResponse.json(
      { error: "Error registrando token" },
      { status: 500, headers: corsHeaders },
    );
  }
}
