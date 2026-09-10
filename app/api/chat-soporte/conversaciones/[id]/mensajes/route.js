import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/auth/server-roles";
import {
  getConversacion,
  listarMensajes,
  agregarMensaje,
  marcarLeido,
} from "@/lib/chatSoporte";
import { notifyNewChatMessage } from "@/lib/notificationService";

/**
 * Comprueba que el solicitante pueda ver/escribir en la conversación.
 * Devuelve { conversacion, esAdmin } o null si no tiene acceso.
 */
async function autorizar(request, conversacionId) {
  const conversacion = await getConversacion(conversacionId);
  if (!conversacion) return { conversacion: null, esAdmin: false, ok: false };

  const esAdmin = await checkIsAdmin();
  if (esAdmin) return { conversacion, esAdmin: true, ok: true };

  const { userId } = await auth();
  if (userId && conversacion.clerk_user_id === userId) {
    return { conversacion, esAdmin: false, ok: true };
  }

  // Invitado: validar por email pasado como query (?email=)
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (email && conversacion.customer_email === email) {
    return { conversacion, esAdmin: false, ok: true };
  }

  return { conversacion, esAdmin: false, ok: false };
}

/**
 * GET /api/chat-soporte/conversaciones/[id]/mensajes
 * Devuelve los mensajes de la conversación (si el solicitante tiene acceso).
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { conversacion, ok } = await autorizar(request, id);

    if (!conversacion) {
      return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
    }
    if (!ok) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const mensajes = await listarMensajes(id);
    return NextResponse.json({ conversacion, mensajes });
  } catch (error) {
    console.error("Error GET mensajes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * POST /api/chat-soporte/conversaciones/[id]/mensajes
 * Agrega un mensaje. El remitente se deduce del rol (admin vs usuario).
 * Body: { contenido }
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { conversacion, esAdmin, ok } = await autorizar(request, id);

    if (!conversacion) {
      return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
    }
    if (!ok) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const contenido = (body?.contenido || "").trim();
    if (!contenido) {
      return NextResponse.json({ error: "El mensaje está vacío" }, { status: 400 });
    }

    const remitente = esAdmin ? "admin" : "usuario";
    const mensaje = await agregarMensaje(id, remitente, contenido);

    // Al enviar, se dan por leídos los mensajes del otro lado para quien escribe
    await marcarLeido(id, esAdmin ? "admin" : "usuario");

    // Notificar al admin solo cuando escribe el usuario
    if (!esAdmin) {
      notifyNewChatMessage({
        nombre: conversacion.customer_name,
        asunto: conversacion.asunto,
        contenido,
      }).catch(() => {});
    }

    return NextResponse.json({ mensaje }, { status: 201 });
  } catch (error) {
    console.error("Error POST mensaje:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
