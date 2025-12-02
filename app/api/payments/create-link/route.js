import { NextResponse } from "next/server";
import { getValidToken } from "@/lib/epayco-token-manager";

// Solo loguear en desarrollo
const isDev = process.env.NODE_ENV === "development";
const log = (...args) => isDev && console.warn("[DEV]", ...args);
const logError = (...args) => console.error("[ERROR]", ...args);

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Manejar solicitudes OPTIONS (preflight CORS)
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * API Route para generar link de cobro de ePayco
 * POST /api/payments/create-link
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
    } = body;

    // Validar datos requeridos
    if (!amount || !description || !customerEmail || !customerName) {
      return NextResponse.json(
        {
          error:
            "Faltan datos requeridos: amount, description, customerEmail, customerName",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // Credenciales de ePayco
    const publicKey = process.env.EPAYCO_PUBLIC_KEY;
    const privateKey = process.env.EPAYCO_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      logError("❌ Credenciales de ePayco no configuradas");
      return NextResponse.json(
        { error: "Credenciales de ePayco no configuradas" },
        { status: 500, headers: corsHeaders },
      );
    }

    // Generar número de factura único
    const invoiceNumber =
      invoice ||
      `NRD-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    log("💰 Generando link de cobro...");
    log("Monto:", amount);
    log("Invoice:", invoiceNumber);

    // Obtener token Bearer
    log("🔐 Obteniendo token de ePayco...");
    let bearerToken;
    try {
      bearerToken = await getValidToken(publicKey, privateKey, true);
      log("✅ Token obtenido exitosamente");
    } catch (error) {
      logError("❌ Error al obtener token:", error.message);
      return NextResponse.json(
        {
          error: "Error de autenticación con ePayco",
          details: error.message,
        },
        { status: 401, headers: corsHeaders },
      );
    }

    // Preparar payload para el link de cobro
    const linkPayload = {
      name: description,
      description: description,
      currency: "COP",
      amount: amount,
      quantity: 1,
      taxBase: "0",
      tax: "0",
      country: "CO",
      lang: "es",
      // Información del cliente
      invoice: invoiceNumber,
      externalReference: invoiceNumber,
      // URLs de respuesta
      urlResponse: `${process.env.NEXT_PUBLIC_BASE_URL || "https://neurai.dev"}/payment-response`,
      urlConfirmation: `${process.env.NEXT_PUBLIC_BASE_URL || "https://neurai.dev"}/api/payments/confirmation`,
      // Información adicional
      extra1: customerName,
      extra2: customerEmail,
      extra3: customerPhone || "",
    };

    log("📤 Creando link de cobro en ePayco...");

    // Crear el link de cobro
    const linkResponse = await fetch("https://apify.epayco.co/payment/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(linkPayload),
    });

    if (!linkResponse.ok) {
      const errorText = await linkResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      logError("❌ Error al crear link de cobro:", linkResponse.status);
      logError("Detalles del error:", errorData);

      return NextResponse.json(
        {
          error: "Error al crear link de cobro",
          status: linkResponse.status,
          details: errorData,
        },
        { status: linkResponse.status, headers: corsHeaders },
      );
    }

    const linkData = await linkResponse.json();

    log("📦 Respuesta de ePayco:", linkData);

    // Verificar si se recibió el link
    if (!linkData.success || !linkData.data?.link) {
      logError("❌ No se recibió link de cobro válido");
      return NextResponse.json(
        {
          error: "No se pudo generar el link de cobro",
          details: linkData,
        },
        { status: 500, headers: corsHeaders },
      );
    }

    log("✅ Link de cobro generado exitosamente");
    log("🔗 Link:", linkData.data.link);

    // Retornar el link generado
    return NextResponse.json(
      {
        success: true,
        paymentLink: linkData.data.link,
        linkId: linkData.data.id,
        invoice: invoiceNumber,
        message: "Link de cobro generado exitosamente",
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    logError("❌ Error inesperado:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

/**
 * Endpoint GET para verificar que la API está activa
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "API de links de cobro activa",
      endpoint: "/api/payments/create-link",
      methods: ["GET", "POST", "OPTIONS"],
      timestamp: new Date().toISOString(),
    },
    { headers: corsHeaders },
  );
}
