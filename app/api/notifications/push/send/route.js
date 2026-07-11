import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/api-auth";
import { enviarPushExpo, todosLosTokens } from "@/lib/pushService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/push/send
 * Envía una notificación push a TODOS los dispositivos registrados.
 * Solo admin (Bearer de Clerk).
 *
 * Body: { title: string, body: string, data?: object }
 * Uso típico: título "Subiendo productos", body con el detalle.
 */
export async function POST(request) {
  try {
    const { userId, isAdmin } = await authenticateRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const title = String(body?.title || "").trim();
    const mensaje = String(body?.body || "").trim();

    if (!title || !mensaje) {
      return NextResponse.json(
        { error: "title y body son requeridos" },
        { status: 400 },
      );
    }

    const tokens = await todosLosTokens();
    const resultado = await enviarPushExpo(tokens, {
      title,
      body: mensaje,
      data: body?.data || { tipo: "aviso" },
    });

    return NextResponse.json({
      success: true,
      total: tokens.length,
      ...resultado,
    });
  } catch (error) {
    console.error("[push/send] error:", error);
    return NextResponse.json(
      { error: "Error enviando notificaciones" },
      { status: 500 },
    );
  }
}
