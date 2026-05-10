import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { notifyNewLead } from "@/lib/notificationService";

// Función para cargar productos desde los JSON
async function loadAllProducts() {
  const productFiles = [
    "celulares.json",
    "computadoras.json",
    "damas.json",
    "libros-nuevos.json",
    "libros-usados.json",
    "generales.json",
  ];

  const products = [];
  const publicDir = path.join(process.cwd(), "public");

  for (const file of productFiles) {
    try {
      const filePath = path.join(publicDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(fileContent);
      const productList = data.accesorios || data.productos || [];
      products.push(...productList);
    } catch (error) {
      console.error(`Error cargando ${file}:`, error);
    }
  }

  return products;
}

// Función para obtener información de productos disponibles
async function getProductsContext() {
  const products = await loadAllProducts();

  // Agrupar productos por categoría
  const categories = {
    celulares: products.filter(p => p.categoria === 'celulares' && p.disponible),
    computadoras: products.filter(p => p.categoria === 'computadoras' && p.disponible),
    damas: products.filter(p => p.categoria === 'damas' && p.disponible),
    "libros-nuevos": products.filter(p => p.categoria === 'libros-nuevos' && p.disponible),
    "libros-usados": products.filter(p => p.categoria === 'libros-usados' && p.disponible),
    generales: products.filter(p => p.categoria === 'generales' && p.disponible),
  };

  // Obtener productos más baratos y más caros
  const availableProducts = products.filter(p => p.precio && p.disponible);
  const cheapest = availableProducts.sort((a, b) => a.precio - b.precio).slice(0, 5);
  const expensive = availableProducts.sort((a, b) => b.precio - a.precio).slice(0, 5);

  return {
    totalProducts: products.length,
    availableProducts: availableProducts.length,
    categories,
    cheapestProducts: cheapest,
    expensiveProducts: expensive,
    productsList: products.filter(p => p.disponible).slice(0, 20) // Limitar para no saturar el contexto
  };
}

// System prompt para el asistente
const systemPrompt = `Eres un asistente virtual de ventas de Neurai.dev, una tienda online colombiana de accesorios tecnológicos y más. Tu objetivo principal es ayudar a los clientes a comprar y, cuando muestren intención de compra, capturar sus datos de contacto para que el equipo los atienda.

**INFORMACIÓN DE LA TIENDA:**
- Nombre: Neurai.dev
- Ubicación: Colombia (Valle de Sibundoy, Putumayo)
- Sitio web: https://neurai.dev
- WhatsApp: +57 317 450 3604
- Email: contacto@neurai.dev

**CATEGORÍAS DE PRODUCTOS:**
1. Accesorios para celulares: fundas, cargadores, cables, protectores de pantalla, manos libres
2. Accesorios para computadoras: teclados, mouse, memorias RAM, discos duros, pendrives, cables USB
3. Productos de belleza y damas: accesorios y productos para el cuidado personal
4. Libros nuevos: diferentes géneros literarios
5. Libros usados: a precios más accesibles
6. Productos generales: variedad de gadgets y accesorios

**ENVÍOS:**
- Cobertura nacional en Colombia
- Costo según ubicación
- Tiempo estimado: 2-5 días hábiles

**MÉTODOS DE PAGO:**
- Tarjetas de crédito y débito
- Transferencia bancaria
- Efectivo (contra entrega en algunas zonas)
- Pago coordinado por WhatsApp

**GARANTÍAS:**
- 30 días para devoluciones
- Cambios por defectos de fábrica

**Horario de atención humana:**
- Lunes a Viernes: 8:00 AM - 6:00 PM
- Sábados: 9:00 AM - 5:00 PM
- Domingos: Cerrado
- (Tú estás disponible 24/7)

**TU FLUJO DE VENTAS:**
1. Saluda y ayuda al cliente a encontrar lo que necesita
2. Cuando el cliente muestre interés en comprar ("lo quiero", "cuánto cuesta", "cómo compro", "quiero uno"), pregunta por su nombre y número de WhatsApp o teléfono para coordinar el pedido
3. Una vez que tengas nombre + contacto, confirma que le avisarás al equipo para que lo contacten pronto
4. Si es urgente o fuera de horario, indícale que puede escribir directamente al WhatsApp: +57 317 450 3604

**CAPTURA DE DATOS — MUY IMPORTANTE:**
Cuando un cliente dé su nombre y/o número de contacto, incluye al FINAL de tu respuesta este bloque exacto (sin modificarlo, sin markdown, en una línea nueva):
LEAD_CAPTURADO: {"nombre": "[nombre del cliente]", "telefono": "[número]", "producto": "[producto de interés]"}

Si el cliente no quiere dar datos, respétalos y ofrece el WhatsApp directo.

**ESTILO:**
- Sé amigable, directo y conciso
- Usa formato markdown para mejor legibilidad
- Siempre ofrece ayuda adicional al final de cada respuesta`;

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
        { status: 400 }
      );
    }

    // Obtener contexto de productos
    const productsContext = await getProductsContext();

    // System prompt con contexto de productos (Anthropic requiere parámetro 'system' separado)
    const systemWithContext = `${systemPrompt}

**PRODUCTOS DISPONIBLES:**

Total de productos disponibles: ${productsContext.availableProducts}

**Productos más económicos:**
${productsContext.cheapestProducts.map((p, i) =>
  `${i + 1}. ${p.nombre} - $${p.precio?.toLocaleString("es-CO")} (${p.categoria})`
).join("\n")}

**Productos premium:**
${productsContext.expensiveProducts.map((p, i) =>
  `${i + 1}. ${p.nombre} - $${p.precio?.toLocaleString("es-CO")} (${p.categoria})`
).join("\n")}

**Productos por categoría:**
- Celulares: ${productsContext.categories.celulares.length} productos
- Computadoras: ${productsContext.categories.computadoras.length} productos
- Damas: ${productsContext.categories.damas.length} productos
- Libros nuevos: ${productsContext.categories["libros-nuevos"].length} productos
- Libros usados: ${productsContext.categories["libros-usados"].length} productos
- Generales: ${productsContext.categories.generales.length} productos

Usa esta información para responder preguntas específicas sobre productos y precios.`;

    // Claude es el modelo por defecto; fallback a OpenAI si no hay API key de Anthropic
    const useAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const model = useAnthropic
      ? anthropic("claude-haiku-4-5")
      : openai("gpt-4o-mini");

    const result = await generateText({
      model,
      system: systemWithContext,
      messages,
      temperature: 0.7,
      maxTokens: 500,
    });

    const fullResponse = result.text;

    // Detectar si el agente capturó un lead y notificar por Telegram
    const leadMatch = fullResponse.match(/LEAD_CAPTURADO:\s*(\{[^}]+\})/);
    if (leadMatch) {
      try {
        const leadData = JSON.parse(leadMatch[1]);
        notifyNewLead(leadData).catch(() => {});
      } catch (_) {}
    }

    // Limpiar el marcador interno antes de enviar al cliente
    const cleanResponse = fullResponse.replace(/LEAD_CAPTURADO:\s*\{[^}]+\}/g, "").trim();

    return NextResponse.json({
      message: cleanResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error en el chatbot con IA:", error);
    return NextResponse.json({ error: String(error), detail: error?.message }, { status: 500 });
  }
}

// Fallback al sistema de respuestas básicas si falla la IA
async function fallbackResponse(request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron mensajes" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content.toLowerCase();

    // Base de conocimiento básica (versión simplificada)
    const knowledgeBase = {
      precio: {
        keywords: ["precio", "costo", "valor", "cuanto", "cuánto", "barato", "económico"],
        response: "💰 Para ver los precios de nuestros productos, te recomiendo explorar nuestras categorías:\n\n📱 Celulares: /accesorios/celulares\n💻 Computadoras: /accesorios/computadoras\n📚 Libros: /accesorios/libros-nuevos\n\nTambién puedes contactarnos por WhatsApp: +57 317 450 3604"
      },
      envio: {
        keywords: ["envío", "envio", "entrega", "domicilio", "despacho"],
        response: "📦 **Información de envíos:**\n\n✅ Hacemos envíos a toda Colombia\n✅ Costo según ubicación\n✅ Tiempo estimado: 2-5 días hábiles\n✅ Seguimiento disponible\n\n¿A qué ciudad necesitas el envío?"
      },
      pago: {
        keywords: ["pago", "pagar", "tarjeta", "efectivo", "transferencia"],
        response: "💳 **Métodos de pago:**\n\n✅ Tarjetas de crédito/débito\n✅ Transferencia bancaria\n✅ Efectivo contra entrega\n✅ Pago por WhatsApp\n\nTodos nuestros pagos son seguros."
      },
      contacto: {
        keywords: ["contacto", "whatsapp", "teléfono", "llamar", "escribir"],
        response: "📞 **Contáctanos:**\n\n📱 WhatsApp: +57 317 450 3604\n✉️ Email: contacto@neurai.dev\n🌐 Web: neurai.dev\n\n¿Prefieres que te redirija a WhatsApp?"
      }
    };

    // Buscar coincidencia
    let response = null;
    for (const [key, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some(keyword => userMessage.includes(keyword))) {
        response = data.response;
        break;
      }
    }

    // Respuesta por defecto
    if (!response) {
      response = "¡Hola! 👋 Soy el asistente de Neurai.dev.\n\n🤖 Actualmente funciono en modo básico. Para mejor asistencia, contáctanos:\n\n📱 WhatsApp: +57 317 450 3604\n✉️ Email: contacto@neurai.dev\n\n¿En qué puedo ayudarte?";
    }

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error en fallback:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
