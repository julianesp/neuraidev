import { NextResponse } from "next/server";
import { d1Select } from "@/lib/db-d1";
import { authenticateRequest } from "@/lib/auth/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Convierte una fila de `orders` (D1) al shape que consume la app móvil en
 * "Mis compras". Los productos viven dentro de `metadata` (JSON) como se guardan
 * en create-session. Se exponen solo campos necesarios (no datos de pago).
 */
function mapearOrden(row) {
  let productos = [];
  let city = "";
  let region = "";
  try {
    const meta =
      typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata;
    productos = Array.isArray(meta?.productos) ? meta.productos : [];
    city = meta?.customer_city || "";
    region = meta?.customer_region || "";
  } catch {
    // metadata corrupta o vacía: se deja sin items.
  }

  const items = productos.map((p) => ({
    nombre: p.name || p.nombre || "Producto",
    precio: Number(p.price ?? p.precio ?? 0),
    cantidad: Number(p.quantity ?? p.cantidad ?? 1),
    color: p.color || null,
  }));

  const envio = [city, region].filter(Boolean).join(", ");

  return {
    reference: row.numero_orden,
    total: Number(row.total ?? 0),
    estado: row.estado,
    estado_pago: row.estado_pago,
    fecha: row.created_at,
    items,
    cliente: {
      name: row.customer_name || "",
      email: row.customer_email || "",
      phone: row.customer_phone || "",
    },
    envio,
  };
}

/**
 * GET /api/pagos/ordenes
 * Historial de compras del cliente autenticado. Requiere sesión (Bearer de Clerk
 * en la app, o cookie en la web): la identidad se toma del token, NO de query
 * params, para que un usuario solo vea SUS órdenes.
 *
 * Une órdenes por:
 *   - clerk_user_id = <userId del token>  (compras hechas con sesión), y
 *   - customer_email IN (<emails del usuario>)  (compras hechas como INVITADO
 *     con un correo que hoy pertenece a su cuenta).
 *
 * Devuelve { ordenes: [...] }.
 */
export async function GET(request) {
  try {
    const { userId, user } = await authenticateRequest(request);

    // Sin sesión válida no se entregan datos personales de órdenes.
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado", ordenes: [] },
        { status: 401, headers: corsHeaders },
      );
    }

    // Correos verificados del usuario (para ligar compras de invitado). Se
    // normalizan a minúsculas y se deduplican.
    const emails = [
      ...new Set(
        (user?.emailAddresses || [])
          .map((e) => String(e?.emailAddress || "").toLowerCase().trim())
          .filter(Boolean),
      ),
    ];

    // Construye el WHERE: por clerk_user_id siempre; por email si hay correos.
    const condiciones = ["clerk_user_id = ?"];
    const params = [userId];
    if (emails.length > 0) {
      const placeholders = emails.map(() => "?").join(", ");
      condiciones.push(`LOWER(customer_email) IN (${placeholders})`);
      params.push(...emails);
    }

    const rows = await d1Select(
      `SELECT numero_orden, total, estado, estado_pago, created_at,
              customer_name, customer_email, customer_phone, metadata
         FROM orders
        WHERE ${condiciones.join(" OR ")}
        ORDER BY created_at DESC
        LIMIT 50`,
      params,
    );

    const ordenes = (rows || []).map(mapearOrden);

    return NextResponse.json({ ordenes }, { headers: corsHeaders });
  } catch (error) {
    console.error("[pagos/ordenes] error:", error);
    return NextResponse.json(
      { error: "Error consultando el historial", ordenes: [] },
      { status: 500, headers: corsHeaders },
    );
  }
}
