import { NextResponse } from "next/server";
import { checkIsAdmin } from "@/lib/auth/server-roles";
import { getConversacion, actualizarEstado } from "@/lib/chatSoporte";

/**
 * PUT /api/chat-soporte/conversaciones/[id]/estado
 * Cierra o reabre una conversación. Solo admin.
 * Body: { estado: 'abierta' | 'cerrada' }
 */
export async function PUT(request, { params }) {
  try {
    const esAdmin = await checkIsAdmin();
    if (!esAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const conversacion = await getConversacion(id);
    if (!conversacion) {
      return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const estado = body?.estado === "cerrada" ? "cerrada" : "abierta";
    await actualizarEstado(id, estado);

    return NextResponse.json({ ok: true, estado });
  } catch (error) {
    console.error("Error PUT estado:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
