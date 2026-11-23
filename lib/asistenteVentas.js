/**
 * Asistente de ventas de neurai.dev — compartido por el chat del sitio
 * (app/api/chat) y por WhatsApp (app/api/whatsapp/webhook).
 */
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { getSupabaseClient } from "@/lib/db";

// Función para cargar productos desde Supabase (fuente principal)
async function loadAllProducts() {
  // Intentar desde Supabase primero
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("nombre, precio, categoria, disponible, descripcion")
      .eq("disponible", true);

    if (!error && data?.length > 0) {
      return data;
    }
  } catch (e) {
    console.error("Error cargando productos desde Supabase:", e);
  }

  // Fallback: cargar desde JSONs locales
  const productFiles = [
    "celulares.json",
    "computadoras.json",
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

  // Considerar disponible si el campo no existe (compatibilidad con JSONs sin ese campo)
  const isAvailable = (p) => p.disponible !== false;

  // Agrupar productos por categoría
  const categories = {
    celulares: products.filter(
      (p) => p.categoria === "celulares" && isAvailable(p),
    ),
    computadoras: products.filter(
      (p) => p.categoria === "computadoras" && isAvailable(p),
    ),
    generales: products.filter(
      (p) => p.categoria === "generales" && isAvailable(p),
    ),
  };

  // Obtener productos más baratos y más caros
  const availableProducts = products.filter((p) => p.precio && isAvailable(p));
  const cheapest = [...availableProducts]
    .sort((a, b) => a.precio - b.precio)
    .slice(0, 5);
  const expensive = [...availableProducts]
    .sort((a, b) => b.precio - a.precio)
    .slice(0, 5);

  return {
    totalProducts: products.length,
    availableProducts: availableProducts.length,
    categories,
    cheapestProducts: cheapest,
    expensiveProducts: expensive,
    productsList: availableProducts, // Lista completa para búsqueda por nombre
  };
}


// System prompt para el asistente
const systemPrompt = `Eres un asistente virtual de ventas de Neurai.dev, una tienda online colombiana de accesorios tecnológicos y más. Tu objetivo principal es ayudar a los clientes a comprar y, cuando muestren intención de compra, capturar sus datos de contacto para que el equipo los atienda.

**INFORMACIÓN DE LA TIENDA:**
- Nombre: neurai.dev
- Ubicación: Valle de Sibundoy, Alto Putumayo, Colombia
- Sitio web: https://neurai.dev
- WhatsApp: +57 317 450 3604
- Email: admin@neurai.dev
- Más de 5 años de experiencia en servicios tecnológicos

**CATEGORÍAS DE PRODUCTOS:**
1. Accesorios para celulares: fundas, cargadores, cables, protectores de pantalla, manos libres, controles de juego
2. Accesorios para computadoras: teclados, mouse, memorias RAM DDR4, discos SSD, pendrives, cables USB, Hub USB-C
3. Productos generales: gadgets, accesorios para mascotas, ciclismo, karaoke, drones y más

**ENVÍOS:**
- Cobertura nacional en Colombia
- Tiempo estimado: 2-5 días hábiles
- **Alto Putumayo (Valle de Sibundoy, Colón, Sibundoy, Santiago, San Francisco): ENVÍO GRATIS en cualquier compra, sin monto mínimo**
- Otros destinos en Colombia: ENVÍO GRATIS en compras desde $200.000; en compras menores el costo se coordina por WhatsApp según ubicación
- Al recibir el pedido, inspeccionar inmediatamente; reportar daños en las primeras 24 horas

**MÉTODOS DE PAGO:**
- **Nequi: 5% de descuento automático** sobre el precio del producto
  → Cuando el cliente pregunte el precio con Nequi, calcula: precio × 0.95 (ej: $124.900 × 0.95 = $118.655)
- Tarjetas de crédito y débito (ePayco)
- Transferencia bancaria
- Efectivo contra entrega (según zona)
- Pago coordinado por WhatsApp

**GARANTÍAS Y DEVOLUCIONES:**
- Garantía de 1 mes contra defectos de fabricación en todos los productos
- Productos tecnológicos nuevos: 30 días de garantía
- Productos usados: 15 días de garantía
- Devoluciones aceptadas dentro de los 5 días calendario tras recibir el producto
- Condiciones: empaque original sin abrir, sin uso, con todos los accesorios y comprobante de compra
- NO retornables: productos de higiene personal, personalizados, software digital, libros usados (salvo defecto)
- Reembolsos procesados en 10 días hábiles al método de pago original (envío original no reembolsable)
- Para devoluciones contactar: WhatsApp +57 317 450 3604 o admin@neurai.dev

**SERVICIOS PROFESIONALES (además de productos):**
1. **Mantenimiento de Computadores**: limpieza interna/externa, optimización del sistema, actualización de drivers, diagnóstico de hardware, cambio de pasta térmica
2. **Formateo de Computadores**: formateo completo, instalación de Windows/Linux, programas básicos, transferencia de archivos, antivirus, opción de upgrade a SSD
3. **Desarrollo Web**: sitios responsivos, tiendas online, optimización SEO, panel de administración, hosting y dominio incluido
4. **Soporte Técnico**: diagnóstico, soporte remoto y presencial, configuración de redes, recuperación de datos, asesoría en compra de equipos
5. **Venta de Componentes**: RAM DDR4 Puskill, SSD mSATA EXRAM, Hub USB-C — todos con instalación incluida al contratar mantenimiento o formateo
- Para servicios, contactar por WhatsApp: https://wa.me/573174503604

**HORARIO DE ATENCIÓN HUMANA:**
- Lunes a Viernes: 8:00 AM - 6:00 PM
- Sábados: 9:00 AM - 5:00 PM
- Domingos: Cerrado
- (Tú estás disponible 24/7)

**TU FLUJO DE VENTAS:**
1. Saluda y ayuda al cliente a encontrar lo que necesita
2. Cuando el cliente muestre interés en comprar ("lo quiero", "cuánto cuesta", "cómo compro", "quiero uno"), pregunta por su nombre y número de WhatsApp para coordinar el pedido
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

const notaWhatsApp = `

**CANAL: WHATSAPP — reglas que reemplazan a las anteriores cuando choquen:**
- Estás respondiendo por WhatsApp desde el número oficial de neurai.dev. NO le ofrezcas al cliente "escribir al WhatsApp": ya está en él.
- Ya tienes su número; para registrar su interés basta con su nombre. En el bloque LEAD_CAPTURADO usa "telefono": "este chat".
- Formato de WhatsApp, no markdown: *negrita* con UN asterisco, _cursiva_, listas con "• ". Nada de # títulos, ** dobles ni [texto](enlace): escribe los enlaces completos (https://neurai.dev/...).
- Mensajes cortos (máx. ~600 caracteres), como en un chat.
- Si pide hablar con una persona, dile que el equipo le responde en este mismo chat en horario de atención.`;

/**
 * Genera la respuesta del asistente.
 * @param {{role:"user"|"assistant", content:string}[]} messages
 * @param {{canal?: "web"|"whatsapp"}} opciones
 * @returns {Promise<{texto:string, lead:object|null}>}
 */
export async function responderAsistente(messages, { canal = "web" } = {}) {
    const productsContext = await getProductsContext();

    const systemWithContext = `${systemPrompt}

**PRODUCTOS DISPONIBLES:**

Total de productos disponibles: ${productsContext.availableProducts}

**Productos más económicos:**
${productsContext.cheapestProducts
  .map(
    (p, i) =>
      `${i + 1}. ${p.nombre} - $${p.precio?.toLocaleString("es-CO")} (${p.categoria})`,
  )
  .join("\n")}

**Productos premium:**
${productsContext.expensiveProducts
  .map(
    (p, i) =>
      `${i + 1}. ${p.nombre} - $${p.precio?.toLocaleString("es-CO")} (${p.categoria})`,
  )
  .join("\n")}

**Productos por categoría:**
- Celulares: ${productsContext.categories.celulares.length} productos
- Computadoras: ${productsContext.categories.computadoras.length} productos
- Generales: ${productsContext.categories.generales.length} productos

**Catálogo completo de productos disponibles:**
${productsContext.productsList
  .map(
    (p) =>
      `- ${p.nombre} | $${p.precio?.toLocaleString("es-CO")} | ${p.categoria}`,
  )
  .join("\n")}

Cuando el cliente pregunte por un producto específico, búscalo en el catálogo completo de arriba y responde con precisión si está o no disponible, su precio y categoría.`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: canal === "whatsapp" ? systemWithContext + notaWhatsApp : systemWithContext,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const fullResponse = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    let lead = null;
    const leadMatch = fullResponse.match(/LEAD_CAPTURADO:\s*(\{[^}]+\})/);
    if (leadMatch) {
      try {
        lead = JSON.parse(leadMatch[1]);
      } catch (_) {}
    }

    const texto = fullResponse.replace(/LEAD_CAPTURADO:\s*\{[^}]+\}/g, "").trim();
    return { texto, lead };
}
