import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

// Solo loguear en desarrollo
const isDev = process.env.NODE_ENV === "development";
const log = (...args) => isDev && console.warn("[DEV ePayco]", ...args);
const logError = (...args) => console.error(...args);

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

// Configuración de CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Manejo de preflight requests (OPTIONS)
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Obtener IP del cliente
 */
function getClientIp(request) {
  // Intentar obtener IP desde headers de proxies comunes
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (real) {
    return real;
  }

  // IP de fallback (puede ser la IP del servidor en desarrollo)
  return "186.97.212.162";
}

/**
 * API Route para crear sesión de pago con ePayco
 * POST /api/payments/epayco/create-session
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      amount,
      description,
      reference,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerRegion,
      customerTypeDoc,
      customerNumberDoc,
      items = [],
    } = body;

    // Validar datos requeridos
    if (!amount || !reference || !customerEmail || !customerName) {
      return NextResponse.json(
        {
          error:
            "Faltan datos requeridos: amount, reference, customerEmail, customerName",
        },
        { status: 400 },
      );
    }

    // Obtener credenciales de ePayco desde variables de entorno
    const epaycoPublicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY;
    const epaycoPrivateKey = process.env.EPAYCO_PRIVATE_KEY;

    if (!epaycoPublicKey || !epaycoPrivateKey) {
      logError("❌ Faltan credenciales de ePayco");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 },
      );
    }

    log("🔐 Creando sesión de pago ePayco...");
    log("📦 Datos recibidos:", {
      amount,
      reference,
      customerEmail,
      customerName,
    });

    // Validar que todos los datos de cliente sean strings válidos
    const sanitizeString = (value, defaultValue = "") => {
      if (!value) return defaultValue.toString();
      return String(value).trim();
    };

    const sanitizeEmail = (email) => {
      return String(email || "")
        .toLowerCase()
        .trim();
    };

    // Calcular impuestos (IVA 19% en Colombia)
    const taxRate = 0.19;
    const taxBase = Number(amount) / (1 + taxRate);
    const tax = Number(amount) - taxBase;

    // Obtener IP del cliente
    const clientIp = getClientIp(request);

    log("💰 Impuestos calculados:", { amount, taxBase, tax });

    // Guardar la orden en Supabase ANTES de procesar el pago
    try {
      const supabase = getSupabaseClient();

      // Normalizar items
      const normalizedItems = items.map((item) => ({
        id: item.id || item.productId,
        name: item.name || item.nombre,
        quantity: item.quantity || item.cantidad || 1,
        price: item.price || item.precio || 0,
      }));

      const { error: orderError } = await supabase.from("orders").insert({
        clerk_user_id: null,
        numero_orden: reference,
        estado: "pendiente",
        customer_name: customerName || "Cliente",
        customer_email: customerEmail,
        customer_phone: customerPhone || "",
        direccion_envio: customerAddress || "Pendiente de confirmar",
        metodo_pago: "epayco",
        referencia_pago: reference,
        total: amount,
        subtotal: taxBase,
        impuestos: tax,
        costo_envio: 0,
        descuentos: 0,
        estado_pago: "pendiente",
        metadata: {
          productos: normalizedItems,
          source: "epayco_checkout",
          customer_city: customerCity,
          customer_region: customerRegion,
          customer_type_doc: customerTypeDoc,
          customer_number_doc: customerNumberDoc,
        },
      });

      if (orderError) {
        logError("⚠️ Error guardando orden:", orderError);
      } else {
        log("✅ Orden guardada exitosamente con referencia:", reference);
      }
    } catch (dbError) {
      logError("⚠️ Error de BD", dbError);
    }

    // Configuración para ePayco Checkout
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neurai.dev";

    // IMPORTANTE: Sanitizar TODOS los valores para evitar errores de toLowerCase
    const sanitizedConfig = {
      // ========== CAMPOS OBLIGATORIOS ==========
      key: sanitizeString(epaycoPublicKey),
      test: process.env.EPAYCO_TEST_MODE === "true",

      // ========== INFORMACIÓN DE LA TRANSACCIÓN ==========
      name: sanitizeString(description, "Compra en neurai.dev"),
      description: sanitizeString(
        description,
        `Compra de ${items.length} producto(s)`,
      ),
      invoice: sanitizeString(reference),
      currency: "cop", // Debe estar en minúsculas según documentación oficial
      amount: Math.round(Number(amount)).toString(),
      tax_base: Number(taxBase).toFixed(2),
      tax: Number(tax).toFixed(2),
      country: "co", // Debe estar en minúsculas según documentación oficial
      lang: "es",

      // ========== INFORMACIÓN DEL CLIENTE (FACTURACIÓN) ==========
      name_billing: sanitizeString(customerName, "Cliente"),
      email_billing: sanitizeEmail(customerEmail),
      mobilephone_billing: sanitizeString(customerPhone),
      address_billing: sanitizeString(customerAddress, "Calle sin especificar"),
      city_billing: sanitizeString(customerCity, "Bogotá"),
      type_doc_billing: sanitizeString(customerTypeDoc, "CC"),
      number_doc_billing: sanitizeString(customerNumberDoc),

      // ========== INFORMACIÓN DE ENVÍO ==========
      name_shipping: sanitizeString(customerName, "Cliente"),
      address_shipping: sanitizeString(
        customerAddress,
        "Calle sin especificar",
      ),
      city_shipping: sanitizeString(customerCity, "Bogotá"),
      type_doc_shipping: sanitizeString(customerTypeDoc, "CC"),
      mobilephone_shipping: sanitizeString(customerPhone),

      // ========== TRACKING Y REFERENCIA ==========
      extra1: sanitizeString(reference),
      extra2: sanitizeString(customerCity),
      extra3: sanitizeString(customerRegion),

      // ========== URLs DE RESPUESTA ==========
      response: sanitizeString(`${baseUrl}/respuesta-pago`),
      confirmation: sanitizeString(
        `${baseUrl}/api/payments/epayco/confirmation`,
      ),

      // ========== IP DEL CLIENTE ==========
      ip: sanitizeString(clientIp),

      // ========== CONFIGURACIÓN AVANZADA ==========
      external: "false", // "false" = lightbox modal, "true" = ventana externa
      autoclick: false,
      method_confirmation: "POST",
      methodsDisable: [],
    };

    log("✅ Configuración de ePayco creada:");
    log("  - key:", sanitizedConfig.key.substring(0, 8) + "...");
    log("  - invoice:", sanitizedConfig.invoice);
    log("  - amount:", sanitizedConfig.amount);
    log("  - name_billing:", sanitizedConfig.name_billing);
    log("  - email_billing:", sanitizedConfig.email_billing);
    log("  - Todos los campos sanitizados para evitar errores");

    // Retornar configuración para el frontend
    return NextResponse.json(
      {
        success: true,
        config: sanitizedConfig,
        reference: reference,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    logError("❌ Error en create-session ePayco:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500, headers: corsHeaders },
    );
  }
}

/**
 * GET para verificar que la API está funcionando
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "API de pagos ePayco activa",
      endpoint: "/api/payments/epayco/create-session",
      methods: ["GET", "POST", "OPTIONS"],
      timestamp: new Date().toISOString(),
    },
    { headers: corsHeaders },
  );
}
