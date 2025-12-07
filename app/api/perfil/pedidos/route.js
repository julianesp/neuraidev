import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/perfil/pedidos
 * Obtiene todos los pedidos del usuario actual con sus items
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Obtener pedidos del usuario
    const { data: pedidos, error: pedidosError } = await supabase
      .from("orders")
      .select("*")
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false });

    if (pedidosError) {
      console.error("Error al obtener pedidos:", pedidosError);
      return NextResponse.json(
        { error: "Error al obtener pedidos" },
        { status: 500 }
      );
    }

    if (!pedidos || pedidos.length === 0) {
      return NextResponse.json([]);
    }

    // Obtener items para cada pedido
    const pedidosConItems = await Promise.all(
      pedidos.map(async (pedido) => {
        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", pedido.id);

        if (itemsError) {
          console.error("Error al obtener items del pedido:", itemsError);
          return { ...pedido, items: [] };
        }

        return { ...pedido, items: items || [] };
      })
    );

    return NextResponse.json(pedidosConItems);
  } catch (error) {
    console.error("Error en GET /api/perfil/pedidos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
