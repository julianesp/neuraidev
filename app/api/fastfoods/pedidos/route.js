import { NextResponse, after } from "next/server";
import { responderError } from "@/lib/fastfoods/acciones";
import { crearPedido, resumenPedido } from "@/lib/fastfoods/pedidos";
import { notificarUsuario } from "@/lib/pushService";

export const dynamic = "force-dynamic";

// POST /api/fastfoods/pedidos — público (no exige cuenta para pedir).
// Body: { slug, items: [{ id, cantidad }], nombre, telefono, entrega, direccion?, nota? }
// Devuelve { token, codigo, total }; el seguimiento es /fastfoods/pedido/<token>.
export async function POST(request) {
  try {
    const body = await request.json();
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;

    const pedido = await crearPedido({ ...body, ip });

    // Push al celular del dueño (cuando tenga la app con notificaciones activas).
    after(() =>
      notificarUsuario(pedido.negocio.owner_clerk_id, {
        title: `Nuevo pedido #${pedido.codigo}`,
        body: resumenPedido(pedido.lineas, pedido.total),
        data: { tipo: "fastfood_pedido", url: "https://neurai.dev/mi-negocio" },
      }).catch(() => {})
    );

    return NextResponse.json({ token: pedido.token, codigo: pedido.codigo, total: pedido.total });
  } catch (error) {
    return responderError(error, "POST /api/fastfoods/pedidos");
  }
}
