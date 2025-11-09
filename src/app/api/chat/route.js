import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

// Base de conocimiento del chatbot
const knowledgeBase = {
  preciosBajos: {
    keywords: ["barato", "económico", "mas bajo", "más bajo", "menor precio", "economico", "precio bajo", "low price", "cheapest"],
    async handler(message) {
      const products = await loadAllProducts();

      if (products.length === 0) {
        return "Lo siento, no pude cargar la información de productos en este momento.";
      }

      // Ordenar por precio ascendente
      const sortedProducts = products
        .filter(p => p.precio && p.disponible)
        .sort((a, b) => a.precio - b.precio);

      if (sortedProducts.length === 0) {
        return "No encontré productos con precios disponibles en este momento.";
      }

      const cheapest = sortedProducts.slice(0, 3);

      let response = "💰 **Los productos más económicos disponibles son:**\n\n";
      cheapest.forEach((product, index) => {
        response += `${index + 1}. **${product.nombre}**\n`;
        response += `   💵 Precio: $${product.precio.toLocaleString("es-CO")}\n`;
        response += `   📁 Categoría: ${product.categoria}\n\n`;
      });

      response += "¿Te interesa alguno de estos productos?";
      return response;
    }
  },
  preciosAltos: {
    keywords: ["caro", "costoso", "mas alto", "más alto", "mayor precio", "precio alto", "high price", "expensive", "mas caro", "más caro"],
    async handler(message) {
      const products = await loadAllProducts();

      if (products.length === 0) {
        return "Lo siento, no pude cargar la información de productos en este momento.";
      }

      // Ordenar por precio descendente
      const sortedProducts = products
        .filter(p => p.precio && p.disponible)
        .sort((a, b) => b.precio - a.precio);

      if (sortedProducts.length === 0) {
        return "No encontré productos con precios disponibles en este momento.";
      }

      const expensive = sortedProducts.slice(0, 3);

      let response = "💎 **Los productos con precios más altos disponibles son:**\n\n";
      expensive.forEach((product, index) => {
        response += `${index + 1}. **${product.nombre}**\n`;
        response += `   💵 Precio: $${product.precio.toLocaleString("es-CO")}\n`;
        response += `   📁 Categoría: ${product.categoria}\n\n`;
      });

      response += "¿Te interesa alguno de estos productos premium?";
      return response;
    }
  },
  precios: {
    keywords: ["precio", "costo", "valor", "cuanto", "cuánto"],
    response: "💰 **Información sobre precios:**\n\n" +
      "Puedo ayudarte con:\n" +
      "• Ver los productos más baratos\n" +
      "• Ver los productos más caros\n" +
      "• Buscar productos por precio\n\n" +
      "¿Qué te gustaría saber específicamente?"
  },
  buscarProducto: {
    keywords: ["buscar producto", "encontrar", "busco", "necesito", "quiero comprar", "me interesa"],
    async handler(message) {
      return "🔍 Puedo ayudarte a buscar productos específicos.\n\n¿Qué tipo de producto estás buscando? Por ejemplo:\n• Cables USB\n• Fundas para celular\n• Mouse para PC\n• Libros\n• Productos de belleza\n\nO puedes usar el buscador en la página principal para encontrar lo que necesitas.";
    }
  },
  categorias: {
    keywords: ["categoría", "categoria", "sección", "seccion", "tipo", "tipos"],
    response: "📂 **Nuestras categorías de productos:**\n\n" +
      "1. 📱 **Celulares** - /accesorios/celulares\n" +
      "2. 💻 **Computadoras** - /accesorios/computadoras\n" +
      "3. 💄 **Damas** - /accesorios/damas\n" +
      "4. 📚 **Libros Nuevos** - /accesorios/libros-nuevos\n" +
      "5. 📖 **Libros Usados** - /accesorios/libros-usados\n" +
      "6. 🎁 **Generales** - /accesorios/generales\n\n" +
      "¿Qué categoría te interesa explorar?"
  },
  ofertas: {
    keywords: ["oferta", "descuento", "promoción", "promocion", "rebaja", "especial"],
    response: "🎉 **¡Ofertas y promociones!**\n\n" +
      "Te recomiendo visitar nuestra sección de productos destacados donde encontrarás:\n" +
      "✨ Productos seleccionados\n" +
      "💰 Mejores precios\n" +
      "🆕 Novedades\n\n" +
      "También puedes preguntarme por el producto más económico de una categoría específica."
  },
  productos: {
    keywords: ["producto", "vender", "venden", "tienen", "catalogo", "catálogo", "stock", "disponible", "que venden"],
    response: "En Neurai.dev vendemos una amplia variedad de productos:\n\n📱 **Accesorios para celulares**: cables, fundas, cargadores\n💻 **Accesorios para computadoras**: teclados, mouse, componentes\n💄 **Productos de belleza**: para el cuidado personal\n📚 **Libros nuevos y usados**: diferentes géneros\n🎁 **Accesorios generales**: variedad de gadgets\n\n¿Te gustaría ver alguna categoría específica?"
  },
  envios: {
    keywords: ["envío", "envio", "enviar", "entrega", "domicilio", "despacho", "shipping"],
    response: "📦 **Información de envíos:**\n\n✅ Hacemos envíos a toda Colombia\n✅ El costo del envío se calcula según la ubicación\n✅ Tiempo estimado: 2-5 días hábiles\n✅ Puedes hacer seguimiento de tu pedido\n\n¿Necesitas saber el costo de envío a tu ciudad?"
  },
  pago: {
    keywords: ["pago", "pagar", "precio", "costo", "cuanto", "cuánto", "tarjeta", "efectivo", "transferencia", "método"],
    response: "💳 **Métodos de pago aceptados:**\n\n✅ Tarjetas de crédito y débito\n✅ Transferencia bancaria\n✅ Efectivo (contra entrega en algunas zonas)\n✅ Pago seguro mediante ePayco\n\nTodos nuestros pagos son seguros y encriptados."
  },
  garantia: {
    keywords: ["garantía", "garantia", "devolución", "devolucion", "cambio", "defecto", "reclamo"],
    response: "🛡️ **Política de garantía:**\n\n✅ Todos nuestros productos tienen garantía\n✅ 30 días para devoluciones\n✅ Cambios por defectos de fábrica\n✅ Soporte técnico incluido\n\n¿Tienes algún problema con un producto específico?"
  },
  contacto: {
    keywords: ["contacto", "contactar", "whatsapp", "teléfono", "telefono", "llamar", "escribir", "correo", "email"],
    response: "📞 **Contáctanos:**\n\n📱 WhatsApp: +57 317 450 3604\n✉️ Email: contacto@neurai.dev\n🌐 Página web: www.neurai.dev\n\n¿Prefieres que te redirija a WhatsApp?"
  },
  horario: {
    keywords: ["horario", "hora", "cuando", "cuándo", "abierto", "cerrado", "atienden"],
    response: "🕐 **Horario de atención:**\n\nLunes a Viernes: 8:00 AM - 6:00 PM\nSábados: 9:00 AM - 5:00 PM\nDomingos: Cerrado\n\n⚡ El chatbot está disponible 24/7"
  },
  ubicacion: {
    keywords: ["ubicación", "ubicacion", "dirección", "direccion", "donde", "dónde", "local", "tienda"],
    response: "📍 **Ubicación:**\n\nSomos una tienda online con cobertura nacional en Colombia.\n\n¿Quieres saber si hacemos envíos a tu ciudad?"
  },
  ayuda: {
    keywords: ["ayuda", "help", "asistencia", "soporte", "problema", "no puedo", "error"],
    response: "🤝 **¿En qué puedo ayudarte?**\n\nPuedo ayudarte con:\n• Información sobre productos\n• Métodos de pago\n• Información de envíos\n• Garantías y devoluciones\n• Contacto directo\n\n¿Sobre qué tema necesitas ayuda?"
  }
};

// Función para buscar en la base de conocimiento con puntuación
async function findBestMatch(userMessage) {
  const messageLower = userMessage.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  // Buscar coincidencias en la base de conocimiento
  for (const [category, data] of Object.entries(knowledgeBase)) {
    let score = 0;

    // Calcular puntuación basada en keywords
    for (const keyword of data.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        // Dar más puntos si la keyword es más larga (más específica)
        score += keyword.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = data;
    }
  }

  // Si encontramos una coincidencia con puntuación suficiente
  if (bestMatch && bestScore > 0) {
    // Si tiene un handler async, ejecutarlo
    if (bestMatch.handler) {
      return await bestMatch.handler(userMessage);
    }
    // Si solo tiene respuesta estática, devolverla
    return bestMatch.response;
  }

  return null;
}

// Respuestas por defecto para saludos y despedidas
const greetings = {
  keywords: ["hola", "buenas", "buenos", "hey", "hi", "saludos", "qué tal", "que tal"],
  responses: [
    "¡Hola! 👋 Bienvenido a Neurai.dev. ¿En qué puedo ayudarte hoy?",
    "¡Hola! 😊 ¿Buscas algo en particular?",
    "¡Hola! Estoy aquí para ayudarte. ¿Qué necesitas saber?"
  ]
};

const farewells = {
  keywords: ["adiós", "adios", "chao", "chau", "bye", "hasta luego", "nos vemos", "gracias"],
  responses: [
    "¡Hasta pronto! 👋 Si necesitas algo más, aquí estaré.",
    "¡Que tengas un excelente día! 😊",
    "¡Gracias por visitarnos! Vuelve pronto. 🙌"
  ]
};

function isGreeting(message) {
  const messageLower = message.toLowerCase();
  return greetings.keywords.some(keyword => messageLower.includes(keyword));
}

function isFarewell(message) {
  const messageLower = message.toLowerCase();
  return farewells.keywords.some(keyword => messageLower.includes(keyword));
}

function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron mensajes" },
        { status: 400 }
      );
    }

    // Obtener el último mensaje del usuario
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "El último mensaje debe ser del usuario" },
        { status: 400 }
      );
    }

    const userMessage = lastMessage.content;
    let responseMessage;

    // Verificar saludos
    if (isGreeting(userMessage)) {
      responseMessage = getRandomResponse(greetings.responses);
    }
    // Verificar despedidas
    else if (isFarewell(userMessage)) {
      responseMessage = getRandomResponse(farewells.responses);
    }
    // Buscar en la base de conocimiento
    else {
      responseMessage = await findBestMatch(userMessage);

      // Si no hay coincidencia, respuesta por defecto
      if (!responseMessage) {
        responseMessage = "🤔 No estoy seguro de entender tu pregunta. Puedo ayudarte con:\n\n" +
          "• Información sobre productos y precios\n" +
          "• Buscar productos específicos\n" +
          "• Métodos de pago\n" +
          "• Información de envíos\n" +
          "• Garantías y devoluciones\n" +
          "• Contacto directo\n\n" +
          "También puedes preguntarme: \"¿Cuál es el producto más barato?\" o \"Busco cables USB\"\n\n" +
          "O contáctanos por WhatsApp: +57 317 450 3604";
      }
    }

    return NextResponse.json({
      message: responseMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error en el chatbot:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
