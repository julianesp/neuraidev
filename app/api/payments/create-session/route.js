import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { getValidToken, getTokenInfo } from "@/lib/epayco-token-manager";

// Solo loguear en desarrollo usando console.warn (permitido por el linter)
const isDev = process.env.NODE_ENV === "development";
// eslint-disable-next-line no-console
const log = (...args) => isDev && console.warn("[DEV]", ...args);
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
 * API Route para crear sesión de pago con ePayco
 * POST /api/payments/create-session
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      amount,
      description,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerTypeDoc,
      customerNumberDoc,
      invoice,
      items = [],
    } = body;

    // Validar datos requeridos
    if (!amount || !description || !customerEmail) {
      return NextResponse.json(
        {
          error: "Faltan datos requeridos: amount, description, customerEmail",
        },
        { status: 400 },
      );
    }

    // Validar datos de facturación para PSE
    if (!customerNumberDoc || !customerAddress) {
      return NextResponse.json(
        {
          error:
            "Faltan datos de facturación requeridos: customerNumberDoc, customerAddress",
        },
        { status: 400 },
      );
    }

    // Generar número de factura único
    const invoiceNumber =
      invoice ||
      `NRD-${Date.now()}${Math.random().toString(36).substring(2, 11)}`;

    // Guardar la orden en Supabase ANTES de crear la sesión de pago
    // Esto permite rastrear los items para reducir stock después
    try {
      const supabase = getSupabaseClient();

      // Normalizar items para asegurar que tengan el formato correcto
      const normalizedItems = items.map((item) => ({
        id: item.id || item.productId,
        name: item.name || item.nombre,
        quantity: item.quantity || item.cantidad || 1,
        price: item.price || item.precio || 0,
      }));

      const { error: orderError } = await supabase.from("orders").insert({
        invoice: invoiceNumber,
        status: "pending",
        customer_name: customerName || "Cliente",
        customer_email: customerEmail,
        customer_phone: customerPhone || "",
        items: normalizedItems, // Array de productos con id, cantidad, precio, etc.
        total: amount,
        created_at: new Date().toISOString(),
      });

      if (orderError) {
        logError("⚠️ Error guardando orden", orderError);
      } else {
        log("📦 Orden guardada con", normalizedItems.length, "items");
      }
    } catch (dbError) {
      logError("⚠️ Error de BD");
    }

    // Obtener credenciales de ePayco desde variables de entorno
    const publicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY;
    const privateKey = process.env.EPAYCO_PRIVATE_KEY;
    const testMode = process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === "true";

    if (!publicKey || !privateKey) {
      logError("❌ Faltan credenciales de ePayco");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 },
      );
    }

    // Paso 1: Obtener token NUEVO (siempre renovado para evitar problemas)
    log("🔐 Obteniendo token NUEVO de ePayco...");
    log("Public Key:", publicKey?.substring(0, 10) + "...");

    let bearerToken;
    try {
      bearerToken = await getValidToken(publicKey, privateKey, true); // Forzar renovación
      log("✅ Token obtenido exitosamente");
    } catch (error) {
      logError("❌ Error al obtener token:", error.message);
      return NextResponse.json(
        {
          error: "Error de autenticación con ePayco",
          details: error.message,
          hint: "Verifica tus credenciales EPAYCO_PUBLIC_KEY y EPAYCO_PRIVATE_KEY",
        },
        { status: 401, headers: corsHeaders },
      );
    }

    // Obtener IP del cliente desde múltiples headers (Vercel, Cloudflare, etc.)
    const headers = request.headers;
    const possibleIpHeaders = [
      headers.get("x-real-ip"),
      headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim(),
      headers.get("cf-connecting-ip"),
    ];

    // Regex para validar IPv4 (sin puertos)
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

    // Buscar la primera IP válida (IPv4) de los headers
    let clientIp = null;
    for (const possibleIp of possibleIpHeaders) {
      if (possibleIp) {
        // Remover puerto si existe (formato: IP:PUERTO)
        const cleanIp = possibleIp.split(":")[0].trim();

        if (ipv4Regex.test(cleanIp)) {
          clientIp = cleanIp;
          break;
        }
      }
    }

    // Si no se encontró IP válida
    if (!clientIp) {
      // En modo test/desarrollo, usar IP de prueba válida
      if (testMode || isDev) {
        clientIp = "181.57.0.1"; // IP genérica de Colombia para pruebas
        log("⚠️ Modo desarrollo/test: usando IP de prueba", clientIp);
      } else {
        // En producción, loguear el problema pero continuar
        logError("⚠️ No se pudo obtener IP válida del cliente", {
          headers: {
            "x-real-ip": headers.get("x-real-ip"),
            "x-forwarded-for": headers.get("x-forwarded-for"),
            "x-vercel-forwarded-for": headers.get("x-vercel-forwarded-for"),
            "cf-connecting-ip": headers.get("cf-connecting-ip"),
          },
        });
        clientIp = "181.57.0.1"; // Fallback
      }
    }

    const ip = clientIp;

    log("🌐 IP del cliente:", ip);

    // Paso 2: Crear sesión de pago
    const sessionPayload = {
      // Campos obligatorios versión 2
      checkout_version: "2",
      name: "Neurai.dev",
      description: description,
      currency: "COP",
      amount: Number(amount), // Debe ser número, no string
      lang: "ES", // ES o EN según documentación oficial
      ip: ip,
      country: "CO", // Colombia
      test: testMode,
      invoice: invoiceNumber,

      // Impuestos obligatorios (números, no strings)
      taxBase: 0,
      tax: 0,
      taxIco: 0,

      // URLs de respuesta (HTTPS requerido en producción)
      response: `${process.env.NEXT_PUBLIC_SITE_URL || "https://neurai.dev"}/respuesta-pago`,
      confirmation: `${process.env.NEXT_PUBLIC_SITE_URL || "https://neurai.dev"}/api/payments/confirmation`,

      // Información del cliente en extras
      extra1: customerName || "",
      extra2: customerEmail || "",
      extra3: customerPhone || "",

      // Información de facturación (objeto anidado según documentación oficial)
      billing: {
        name: customerName || "Cliente",
        email: customerEmail,
        address: customerAddress || "Dirección Colombia",
        typeDoc: customerTypeDoc || "CC",
        numberDoc: customerNumberDoc || "1234567890",
        mobilePhone: customerPhone || "3000000000",
      },
    };

    log("📤 Creando sesión de pago...");

    const sessionResponse = await fetch(
      "https://apify.epayco.co/payment/session/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(sessionPayload),
      },
    );

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      logError("❌ Error al crear sesión de pago:", sessionResponse.status);
      logError("Detalles del error:", errorData);

      return NextResponse.json(
        {
          error: "Error al crear sesión de pago",
          status: sessionResponse.status,
          details: errorData,
          hint: "Verifica los datos enviados a ePayco",
        },
        { status: 500, headers: corsHeaders },
      );
    }

    const sessionData = await sessionResponse.json();

    // Log completo de la respuesta para debugging
    log(
      "📦 Respuesta completa de ePayco:",
      JSON.stringify(sessionData, null, 2),
    );

    if (!sessionData.data?.sessionId) {
      logError("❌ No se recibió sessionId de ePayco");
      logError("📦 Respuesta de ePayco:", sessionData);
      return NextResponse.json(
        {
          error: "No se pudo crear sesión de pago",
          epaycoResponse: sessionData,
          hint: "ePayco no devolvió un sessionId válido",
        },
        { status: 500 },
      );
    }

    log("✅ Sesión de pago creada exitosamente");

    // Retornar sessionId al cliente con headers CORS
    return NextResponse.json(
      {
        success: true,
        sessionId: sessionData.data.sessionId,
        invoice: sessionPayload.invoice,
        amount: sessionPayload.amount,
        test: testMode,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    logError("❌ Error en create-session:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500, headers: corsHeaders },
    );
  }
}

// GET para verificar que la API está funcionando
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "API de pagos activa",
      endpoint: "/api/payments/create-session",
      methods: ["GET", "POST", "OPTIONS"],
      timestamp: new Date().toISOString(),
    },
    { headers: corsHeaders },
  );
}
