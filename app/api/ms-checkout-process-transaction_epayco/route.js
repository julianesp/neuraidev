import { NextResponse } from "next/server";

/**
 * Endpoint dummy para comunicación interna del iframe de ePayco
 * Este endpoint es llamado por el iframe de ePayco durante el proceso de checkout
 * No requiere implementación - solo responder OK para evitar errores 404/500
 */

// Configuración de CORS para permitir comunicación del iframe
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
  try {
    // Simplemente aceptar la comunicación del iframe
    // No es necesario procesar nada aquí
    const body = await request.json().catch(() => ({}));

    return NextResponse.json(
      {
        success: true,
        message: "OK"
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: true, message: "OK" },
      { headers: corsHeaders }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Endpoint de comunicación interna de ePayco",
      status: "active"
    },
    { headers: corsHeaders }
  );
}
