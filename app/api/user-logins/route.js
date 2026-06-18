import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getCurrentUserWithRole } from "@/lib/auth/server-roles";
import { parseUserAgent } from "@/lib/deviceParser";

export const dynamic = "force-dynamic";

/**
 * POST /api/user-logins
 * Registra un acceso del usuario autenticado (una vez por día por usuario).
 * El front lo llama cuando detecta una sesión activa.
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const db = getSupabaseServerClient();

    // Dedupe: si ya hay un registro de hoy para este usuario, no duplicar
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const { data: existing } = await db
      .from("user_logins")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", `${today} 00:00:00`)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ registered: false, reason: "already_today" });
    }

    const user = await currentUser();
    const userName =
      user?.fullName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      "Usuario";
    const userEmail =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      null;
    const userImage = user?.imageUrl || null;

    const ua = request.headers.get("user-agent") || "";
    const { deviceType, browser, os } = parseUserAgent(ua);

    await db.from("user_logins").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      user_image: userImage,
      device_type: deviceType,
      browser,
      os,
      user_agent: ua.slice(0, 500),
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ registered: true });
  } catch (error) {
    console.error("Error in POST /api/user-logins:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * GET /api/user-logins  (solo admin)
 * Devuelve el historial de accesos + estadísticas resumidas.
 */
export async function GET() {
  try {
    const { isAdmin } = await getCurrentUserWithRole();
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const db = getSupabaseServerClient();
    const { data, error } = await db
      .from("user_logins")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const logins = data || [];

    // Estadísticas
    const uniqueUsers = new Set(logins.map((l) => l.user_id)).size;
    const byDevice = logins.reduce((acc, l) => {
      const k = l.device_type || "desconocido";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      logins,
      stats: {
        totalLogins: logins.length,
        uniqueUsers,
        byDevice,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/user-logins:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
