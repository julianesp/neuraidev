import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { buscarComprasCliente, itemsDePedido } from "@/lib/compras-cliente";

/**
 * GET /api/perfil/pedidos
 * Pedidos del usuario actual con sus productos. Busca por su cuenta y por sus
 * correos verificados: casi ningún pedido guarda clerk_user_id, así que solo
 * por cuenta el historial salía vacío.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await currentUser();
    const emails = (user?.emailAddresses || [])
      .filter((e) => e.verification?.status === "verified")
      .map((e) => e.emailAddress);

    const { pedidos } = await buscarComprasCliente({ userId, emails });

    return NextResponse.json(
      pedidos.map(({ metadata, ...p }) => ({ ...p, items: itemsDePedido({ ...p, metadata }) }))
    );
  } catch (error) {
    console.error("Error en GET /api/perfil/pedidos:", error);
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}
