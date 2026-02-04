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
    return forwarded.split(',')[0].trim();
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
          error: "Faltan datos requeridos: amount, reference, customerEmail, customerName",
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

    // Calcular impuestos (IVA 19% en Colombia)
    const taxRate = 0.19;
    const taxBase = amount / (1 + taxRate);
    const tax = amount - taxBase;

    // Obtener IP del cliente
    const clientIp = getClientIp(request);

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
    const epaycoConfig = {
      // Información básica
      key: epaycoPublicKey,
      test: process.env.EPAYCO_TEST_MODE === "true",

      // Información de la transacción
      name: description || "Compra en neurai.dev",
      description: description || `Compra de ${items.length} producto(s)`,
      invoice: reference,
      currency: "COP",
      amount: amount.toString(),
      tax_base: taxBase.toFixed(2),
      tax: tax.toFixed(2),
      country: "CO",
      lang: "es",

      // Información del cliente
      external: "false",
      extra1: reference, // Guardar referencia en extra1 para tracking
      extra2: customerCity || "",
      extra3: customerRegion || "",

      // URLs de respuesta
      response: `${process.env.NEXT_PUBLIC_SITE_URL || "https://neurai.dev"}/respuesta-pago`,
      confirmation: `${process.env.NEXT_PUBLIC_SITE_URL || "https://neurai.dev"}/api/payments/epayco/confirmation`,

      // Información de facturación
      name_billing: customerName,
      address_billing: customerAddress || "N/A",
      type_doc_billing: customerTypeDoc || "CC",
      mobilephone_billing: customerPhone || "",
      number_doc_billing: customerNumberDoc || "",
      email_billing: customerEmail,

      // Configuración adicional
      autoclick: false,
      methodsDisable: [], // Habilitar todos los métodos
      method_confirmation: "POST",
    };

    log("✅ Configuración de ePayco creada exitosamente");

    // Retornar configuración para el frontend
    return NextResponse.json(
      {
        success: true,
        config: epaycoConfig,
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