import { NextResponse } from "next/server";
import { notifyNewLead } from "@/lib/notificationService";
import { responderAsistente } from "@/lib/asistenteVentas";

export async function POST(request) {
  try {
    // Verificar que haya al menos una API key configurada
    if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
      console.error("No hay API key de IA configurada");
      return fallbackResponse(request);
    }

    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron mensajes" },
        { status: 400 },
      );
    }

    const { texto: cleanResponse, lead } = await responderAsistente(messages, { canal: "web" });

    // Si el agente capturó un lead, notificar por Telegram
    if (lead) notifyNewLead(lead).catch(() => {});

    return NextResponse.json({
      message: cleanResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en el chatbot con IA:", error);
    return NextResponse.json(
      { error: String(error), detail: error?.message },
      { status: 500 },
    );
  }
}

// Fallback al sistema de respuestas básicas si falla la IA
async function fallbackResponse(request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron mensajes" },
        { status: 400 },
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content.toLowerCase();

    // Base de conocimiento básica (versión simplificada)
    const knowledgeBase = {
      precio: {
        keywords: [
          "precio",
          "costo",
          "valor",
          "cuanto",
          "cuánto",
          "barato",
          "económico",
        ],
        response:
          "💰 Para ver los precios de nuestros productos, te recomiendo explorar nuestras categorías:\n\n📱 Celulares: /accesorios/celulares\n💻 Computadoras: /accesorios/computadoras\n📦 Generales: /accesorios/generales\n\nTambién puedes contactarnos por WhatsApp: +57 317 450 3604",
      },
      envio: {
        keywords: ["envío", "envio", "entrega", "domicilio", "despacho"],
        response:
          "📦 **Información de envíos:**\n\n✅ Hacemos envíos a toda Colombia\n✅ Costo según ubicación\n✅ Tiempo estimado: 2-5 días hábiles\n✅ Seguimiento disponible\n\n¿A qué ciudad necesitas el envío?",
      },
      pago: {
        keywords: ["pago", "pagar", "tarjeta", "efectivo", "transferencia"],
        response:
          "💳 **Métodos de pago:**\n\n✅ Tarjetas de crédito/débito\n✅ Transferencia bancaria\n✅ Efectivo contra entrega\n✅ Pago por WhatsApp\n\nTodos nuestros pagos son seguros.",
      },
      contacto: {
        keywords: ["contacto", "whatsapp", "teléfono", "llamar", "escribir"],
        response:
          "📞 **Contáctanos:**\n\n📱 WhatsApp: +57 317 450 3604\n✉️ Email: admin@neurai.dev\n🌐 Web: neurai.dev\n\n¿Prefieres que te redirija a WhatsApp?",
      },
    };

    // Buscar coincidencia
    let response = null;
    for (const [key, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some((keyword) => userMessage.includes(keyword))) {
        response = data.response;
        break;
      }
    }

    // Respuesta por defecto
    if (!response) {
      response =
        "¡Hola! 👋 Soy el asistente de Neurai.dev.\n\n🤖 Actualmente funciono en modo básico. Para mejor asistencia, contáctanos:\n\n📱 WhatsApp: +57 317 450 3604\n✉️ Email: admin@neurai.dev\n\n¿En qué puedo ayudarte?";
    }

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en fallback:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 },
    );
  }
}
