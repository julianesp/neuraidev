import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

// Solo loguear en desarrollo usando console.warn (permitido por el linter)
const isDev = process.env.NODE_ENV === "development";
// eslint-disable-next-line no-console
const log = (...args) => isDev && console.warn("[DEV]", ...args);
const logError = (...args) => console.error(...args);

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

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

    // Generar número de factura único
    const invoiceNumber =
      invoice || `NRD-${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Guardar la orden en Supabase ANTES de crear la sesión de pago
    // Esto permite rastrear los items para reducir stock después
    try {
      const supabase = getSupabaseClient();

      const { error: orderError } = await supabase.from("orders").insert({
        invoice: invoiceNumber,
        status: "pending",
        customer_name: customerName || "Cliente",
        customer_email: customerEmail,
        customer_phone: customerPhone || "",
        items: items, // Array de productos con id, cantidad, precio, etc.
        total: amount,
        created_at: new Date().toISOString(),
      });

      if (orderError) {
        logError("⚠️ Error guardando orden");
      } else {
        log("📦 Orden guardada");
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

    // Paso 1: Autenticarse en Apify
    const authString = Buffer.from(`${publicKey}:${privateKey}`).toString(
      "base64",
    );

    log("🔐 Autenticando en ePayco...");
    const authResponse = await fetch("https://apify.epayco.co/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
    });

    if (!authResponse.ok) {
      logError("❌ Error de autenticación con ePayco");
      return NextResponse.json(
        { error: "Error de autenticación con ePayco" },
        { status: 401 },
      );
    }

    const authData = await authResponse.json();
    const bearerToken = authData.token;

    if (!bearerToken) {
      logError("❌ No se recibió token de autenticación");
      return NextResponse.json(
        { error: "No se pudo obtener token de autenticación" },
        { status: 500 },
      );
    }

    log("✅ Autenticación exitosa");

    // Obtener IP del cliente desde múltiples headers (Vercel, Cloudflare, etc.)
    const headers = request.headers;
    const possibleIpHeaders = [
      headers.get("x-real-ip"),
      headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim(),
      headers.get("cf-connecting-ip"),
    ];

    // Regex para validar IPv4
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

    // Buscar la primera IP válida (IPv4) de los headers
    let clientIp = null;
    for (const possibleIp of possibleIpHeaders) {
      if (possibleIp && ipv4Regex.test(possibleIp)) {
        clientIp = possibleIp;
        break;
      }
    }

    // Si no se encontró IP válida, usar una IP pública genérica (requerido por ePayco)
    const ip = clientIp || "181.57.0.1";

    // Paso 2: Crear sesión de pago
    const sessionPayload = {
      // Campos obligatorios versión 2

      checkout_version: "2",
      name: "Neurai.dev",
      description: description,
      currency: "COP",
      // amount: amount.toString(),
      amount: amount,
      lang: "es",
      ip: ip,
      country: "CO", // Colombia
      test: testMode,
      invoice: invoiceNumber,

      // Impuestos (obligatorios en snake_case)
      taxBase: "0",
      tax: "0",
      taxIco: "0",

      // URLs de respuesta
      response: `${process.env.NEXT_PUBLIC_SITE_URL || "https://neurai.dev"}/respuesta-pago`,
      confirmation: `${process.env.NEXT_PUBLIC_SITE_URL || "https://neurai.dev"}/api/payments/confirmation`,

      // Información del cliente en extras
      extra1: customerName || "",
      extra2: customerEmail || "",
      extra3: customerPhone || "",

      // Información de facturación (todos en snake_case)
      name_billing: customerName || "Cliente",
      address_billing: "Calle 1 #1-1",
      type_doc_billing: "cc",
      number_doc_billing: "1234567890",
      mobilephone_billing: customerPhone || "3000000000",
      email_billing: customerEmail,
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
      logError("❌ Error al crear sesión de pago");
      return NextResponse.json(
        { error: "Error al crear sesión de pago" },
        { status: 500 },
      );
    }

    const sessionData = await sessionResponse.json();

    if (!sessionData.data?.sessionId) {
      logError("❌ No se recibió sessionId de ePayco");
      return NextResponse.json(
        { error: "No se pudo crear sesión de pago" },
        { status: 500 },
      );
    }

    log("✅ Sesión de pago creada exitosamente");

    // Retornar sessionId al cliente
    return NextResponse.json({
      success: true,
      sessionId: sessionData.data.sessionId,
      invoice: sessionPayload.invoice,
      amount: sessionPayload.amount,
      test: testMode,
    });
  } catch (error) {
    logError("❌ Error en create-session");
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// GET para verificar que la API está funcionando
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "API de pagos activa",
    timestamp: new Date().toISOString(),
  });
}
