import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseClient } from "@/lib/db";

// Solo loguear en desarrollo
const isDev = process.env.NODE_ENV === "development";
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
 * API Route para crear sesión de pago con Wompi
 * POST /api/payments/create-session
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      amount,
      amountInCents,
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
    if (!amountInCents || !reference || !customerEmail) {
      return NextResponse.json(
        {
          error: "Faltan datos requeridos: amountInCents, reference, customerEmail",
        },
        { status: 400 },
      );
    }

    // Obtener credenciales de Wompi desde variables de entorno
    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

    if (!publicKey || !integritySecret) {
      logError("❌ Faltan credenciales de Wompi");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 },
      );
    }

    log("🔐 Generando firma de integridad...");

    // Generar firma de integridad según documentación de Wompi
    // Formato: "<Reference><AmountInCents><Currency><IntegritySecret>"
    const signatureString = `${reference}${amountInCents}COP${integritySecret}`;
    const integritySignature = crypto
      .createHash("sha256")
      .update(signatureString)
      .digest("hex");

    log("✅ Firma generada exitosamente");

    // Guardar la orden en Supabase ANTES de procesar el pago
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
        invoice: reference,
        status: "pending",
        customer_name: customerName || "Cliente",
        customer_email: customerEmail,
        customer_phone: customerPhone || "",
        items: normalizedItems,
        total: amount,
        created_at: new Date().toISOString(),
      });

      if (orderError) {
        logError("⚠️ Error guardando orden", orderError);
      } else {
        log("📦 Orden guardada con", normalizedItems.length, "items");
      }
    } catch (dbError) {
      logError("⚠️ Error de BD", dbError);
    }

    // URL de redirección después del pago
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://neurai.dev"}/respuesta-pago`;

    log("✅ Sesión de pago creada exitosamente");

    // Retornar datos necesarios para el frontend
    return NextResponse.json(
      {
        success: true,
        publicKey: publicKey,
        integritySignature: integritySignature,
        reference: reference,
        amountInCents: amountInCents,
        redirectUrl: redirectUrl,
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
      message: "API de pagos Wompi activa",
      endpoint: "/api/payments/create-session",
      methods: ["GET", "POST", "OPTIONS"],
      timestamp: new Date().toISOString(),
    },
    { headers: corsHeaders },
  );
}
