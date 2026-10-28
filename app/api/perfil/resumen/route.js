import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { d1Select } from "@/lib/db";
import { buscarComprasCliente } from "@/lib/compras-cliente";

export const dynamic = "force-dynamic";

/**
 * GET /api/perfil/resumen
 * Datos para la cabecera del perfil: compras (pedidos online + ventas
 * registradas, por cuenta, correos verificados y teléfono), favoritos,
 * calificaciones que ha dejado y su 15% de cliente de servicio técnico.
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
    const telefonos = (user?.phoneNumbers || [])
      .filter((p) => p.verification?.status === "verified")
      .map((p) => p.phoneNumber);

    const [compras, calificaciones, favoritos] = await Promise.all([
      buscarComprasCliente({ userId, emails, telefonos }),
      d1Select(
        `SELECT id, mensaje, calificacion, tipo, producto_relacionado, estado, avatar_url, created_at
           FROM testimonios WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      ).catch(() => []),
      d1Select(`SELECT COUNT(*) AS n FROM user_favorites WHERE clerk_user_id = ?`, [userId])
        .then((r) => Number(r?.[0]?.n) || 0)
        .catch(() => 0),
    ]);

    return NextResponse.json({
      resumen: compras.resumen,
      favoritos,
      calificaciones,
      descuento: user?.publicMetadata?.descuento_cliente || null,
      proveedores: (user?.externalAccounts || []).map((a) =>
        String(a.provider || "").replace("oauth_", "")
      ),
      miembroDesde: user?.createdAt || null,
    });
  } catch (error) {
    console.error("Error en GET /api/perfil/resumen:", error);
    return NextResponse.json({ error: "Error al cargar el resumen" }, { status: 500 });
  }
}
