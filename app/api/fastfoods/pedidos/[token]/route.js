import { NextResponse } from "next/server";
import { responderError } from "@/lib/fastfoods/acciones";
import { getPedidoPorToken } from "@/lib/fastfoods/pedidos";

export const dynamic = "force-dynamic";

// GET /api/fastfoods/pedidos/<token> — estado del pedido para el cliente.
// El token (32 hex) es el secreto del enlace de seguimiento.
export async function GET(request, { params }) {
  try {
    const { token } = await params;
    const pedido = await getPedidoPorToken(token);
    if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    return NextResponse.json(pedido, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return responderError(error, "GET /api/fastfoods/pedidos/[token]");
  }
}
