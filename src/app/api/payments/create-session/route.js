import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * API Route para crear sesión de pago con ePayco
 * POST /api/payments/create-session
 *
 * Body esperado:
 * {
 *   amount: number,
 *   description: string,
 *   customerName: string,
 *   customerEmail: string,
 *   customerPhone: string,
 *   invoice: string,
 *   items: array
 * }
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
    const invoiceNumber = invoice || `NRD-${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Guardar la orden en Supabase ANTES de crear la sesión de pago
    // Esto permite rastrear los items para reducir stock después
    try {
      const supabase = getSupabaseClient();

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          invoice: invoiceNumber,
          status: 'pending',
          customer_name: customerName || 'Cliente',
          customer_email: customerEmail,
          customer_phone: customerPhone || '',
          items: items, // Array de productos con id, cantidad, precio, etc.
          total: amount,
          created_at: new Date().toISOString(),
        });

      if (orderError) {
        console.error("⚠️ Error guardando orden (continuando):", orderError);
        // No fallar si no se puede guardar, pero loguear
      } else {
        console.log("📦 Orden guardada:", invoiceNumber);
      }
    } catch (dbError) {
      console.error("⚠️ Error de BD (continuando):", dbError.message);
    }

    // Obtener credenciales de ePayco desde variables de entorno
    const publicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY;
    const privateKey = process.env.EPAYCO_PRIVATE_KEY;
    const testMode = process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === "true";

    if (!publicKey || !privateKey) {
      console.error("Faltan credenciales de ePayco en variables de entorno");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 },
      );
    }

    // Paso 1: Autenticarse en Apify
    const authString = Buffer.from(`${publicKey}:${privateKey}`).toString(
      "base64",
    );

    console.log("🔐 Autenticando en ePayco...");
    const authResponse = await fetch("https://apify.epayco.co/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("❌ Error de autenticación:", errorText);
      return NextResponse.json(
        { error: "Error de autenticación con ePayco" },
        { status: 401 },
      );
    }

    const authData = await authResponse.json();
    const bearerToken = authData.token;

    if (!bearerToken) {
      console.error("❌ No se recibió token de autenticación");
      return NextResponse.json(
        { error: "No se pudo obtener token de autenticación" },
        { status: 500 },
      );
    }

    console.log("✅ Autenticación exitosa");

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

    console.log("🌐 IP del cliente:", {
      "x-real-ip": headers.get("x-real-ip"),
      "x-forwarded-for": headers.get("x-forwarded-for"),
      "x-vercel-forwarded-for": headers.get("x-vercel-forwarded-for"),
      ipUsada: ip,
    });

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

    console.log("📤 Creando sesión de pago...", {
      amount: sessionPayload.amount,
      invoice: sessionPayload.invoice,
      test: sessionPayload.test,
    });

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
      console.error("❌ Error al crear sesión:", errorText);
      return NextResponse.json(
        { error: "Error al crear sesión de pago", details: errorText },
        { status: 500 },
      );
    }

    const sessionData = await sessionResponse.json();

    if (!sessionData.data?.sessionId) {
      console.error("❌ No se recibió sessionId:");
      console.error(
        "Respuesta completa:",
        JSON.stringify(sessionData, null, 2),
      );

      // Si hay errores de validación, imprimirlos en detalle
      if (sessionData.data?.errors) {
        console.error("🔍 Errores de validación detallados:");
        sessionData.data.errors.forEach((error, index) => {
          console.error(
            `  Error ${index + 1}:`,
            JSON.stringify(error, null, 2),
          );
        });
      }

      return NextResponse.json(
        {
          error: "No se pudo crear sesión de pago",
          details: sessionData,
        },
        { status: 500 },
      );
    }

    console.log("✅ Sesión creada exitosamente:", sessionData.data.sessionId);

    // Retornar sessionId al cliente
    return NextResponse.json({
      success: true,
      sessionId: sessionData.data.sessionId,
      invoice: sessionPayload.invoice,
      amount: sessionPayload.amount,
      test: testMode,
    });
  } catch (error) {
    console.error("❌ Error en create-session:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 },
    );
  }
}
