import { NextResponse } from "next/server";
import { d1SelectOne } from "@/lib/db-d1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/pagos/estado?ref=NRD-...
 * Devuelve el estado de una orden para que la app haga polling tras el checkout.
 * Público y de solo lectura: solo expone estado, no datos sensibles.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref");

    if (!ref) {
      return NextResponse.json(
        { error: "Falta el parámetro ref" },
        { status: 400, headers: corsHeaders },
      );
    }

    const orden = await d1SelectOne(
      "SELECT estado, estado_pago FROM orders WHERE numero_orden = ?",
      [ref],
    );

    if (!orden) {
      return NextResponse.json(
        { encontrada: false, estado: null, estado_pago: null },
        { headers: corsHeaders },
      );
    }

    return NextResponse.json(
      {
        encontrada: true,
        estado: orden.estado,
        estado_pago: orden.estado_pago,
        pagado:
          orden.estado === "completado" || orden.estado_pago === "completado",
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("[pagos/estado] error:", error);
    return NextResponse.json(
      { error: "Error consultando estado" },
      { status: 500, headers: corsHeaders },
    );
  }
}
