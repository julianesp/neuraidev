import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/auth/server-roles";
import { getConversacion, marcarLeido } from "@/lib/chatSoporte";

/**
 * POST /api/chat-soporte/conversaciones/[id]/leer
 * Marca como leídos los mensajes de la conversación para el lado que abre.
 * El lado (admin/usuario) se deduce del rol.
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const conversacion = await getConversacion(id);
    if (!conversacion) {
      return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
    }

    const esAdmin = await checkIsAdmin();
    if (esAdmin) {
      await marcarLeido(id, "admin");
      return NextResponse.json({ ok: true });
    }

    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const esDueno =
      (userId && conversacion.clerk_user_id === userId) ||
      (email && conversacion.customer_email === email);

    if (!esDueno) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await marcarLeido(id, "usuario");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error POST leer:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
