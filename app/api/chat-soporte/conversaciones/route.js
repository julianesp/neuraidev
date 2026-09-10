import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/auth/server-roles";
import {
  listarConversacionesUsuario,
  listarConversacionesAdmin,
  crearConversacion,
  agregarMensaje,
} from "@/lib/chatSoporte";
import { notifyNewChatMessage } from "@/lib/notificationService";

/**
 * GET /api/chat-soporte/conversaciones
 * - Admin: lista todas las conversaciones (bandeja). Acepta ?estado=abierta|cerrada
 * - Usuario logueado: lista solo las suyas
 * - Invitado: acepta ?email= para recuperar sus conversaciones
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const esAdmin = await checkIsAdmin();

    if (esAdmin) {
      const estado = searchParams.get("estado");
      const conversaciones = await listarConversacionesAdmin(estado);
      return NextResponse.json({ conversaciones });
    }

    const { userId } = await auth();

    if (userId) {
      const conversaciones = await listarConversacionesUsuario({ clerkUserId: userId });
      return NextResponse.json({ conversaciones });
    }

    // Invitado: solo por email explícito
    const email = searchParams.get("email");
    if (email) {
      const conversaciones = await listarConversacionesUsuario({ email });
      return NextResponse.json({ conversaciones });
    }

    return NextResponse.json({ conversaciones: [] });
  } catch (error) {
    console.error("Error GET /api/chat-soporte/conversaciones:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * POST /api/chat-soporte/conversaciones
 * Crea una conversación nueva con su primer mensaje (del usuario).
 * Body: { mensaje, asunto?, nombre?, email? }  (nombre/email requeridos para invitados)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const mensaje = (body?.mensaje || "").trim();
    if (!mensaje) {
      return NextResponse.json({ error: "El mensaje es obligatorio" }, { status: 400 });
    }

    const { userId } = await auth();
    let clerkUserId = null;
    let nombre = (body?.nombre || "").trim() || null;
    let email = (body?.email || "").trim() || null;

    if (userId) {
      clerkUserId = userId;
      const user = await currentUser();
      email =
        user?.primaryEmailAddress?.emailAddress ||
        user?.emailAddresses?.[0]?.emailAddress ||
        email;
      nombre =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
        nombre ||
        email;
    } else {
      // Invitado: exigir nombre y email para poder darle seguimiento
      if (!nombre || !email) {
        return NextResponse.json(
          { error: "Nombre y correo son obligatorios para iniciar el chat" },
          { status: 400 }
        );
      }
    }

    const asunto = (body?.asunto || "").trim() || "Consulta general";

    const conversacion = await crearConversacion({
      clerkUserId,
      email,
      nombre,
      asunto,
    });

    const msg = await agregarMensaje(conversacion.id, "usuario", mensaje);

    // Avisar al admin por Telegram (no bloquea la respuesta)
    notifyNewChatMessage({ nombre, asunto, contenido: mensaje }).catch(() => {});

    return NextResponse.json({ conversacion, mensaje: msg }, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/chat-soporte/conversaciones:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
