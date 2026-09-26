import { NextResponse } from "next/server";
import { d1Select, d1Execute } from "@/lib/db-d1";
import { authenticateRequest } from "@/lib/auth/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Una orden se considera pagada (y por tanto NO borrable) si su estado o
// estado_pago es completado/aprobado. Solo las no pagadas (pendiente, cancelado,
// rechazado) pueden eliminarse desde el historial.
const ESTADOS_PAGADA = ["completado", "aprobado"];

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
 * Construye la condición SQL de "propiedad" de una orden por el usuario
 * autenticado: por clerk_user_id (compras con sesión) o por customer_email
 * (compras de invitado con un correo de la cuenta). Devuelve { sql, params }
 * listo para un WHERE. Así GET y DELETE comparten exactamente la misma regla.
 */
function condicionesPropiedad(userId, user) {
  const emails = [
    ...new Set(
      (user?.emailAddresses || [])
        .map((e) => String(e?.emailAddress || "").toLowerCase().trim())
        .filter(Boolean),
    ),
  ];
  const condiciones = ["clerk_user_id = ?"];
  const params = [userId];
  if (emails.length > 0) {
    const placeholders = emails.map(() => "?").join(", ");
    condiciones.push(`LOWER(customer_email) IN (${placeholders})`);
    params.push(...emails);
  }
  return { sql: `(${condiciones.join(" OR ")})`, params };
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

    const propiedad = condicionesPropiedad(userId, user);

    const rows = await d1Select(
      `SELECT numero_orden, total, estado, estado_pago, created_at,
              customer_name, customer_email, customer_phone, metadata
         FROM orders
        WHERE ${propiedad.sql}
        ORDER BY created_at DESC
        LIMIT 50`,
      propiedad.params,
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

/**
 * DELETE /api/pagos/ordenes
 * Borra órdenes NO pagadas del usuario autenticado. Requiere sesión.
 * Body JSON:
 *   { references: ["NRD-...", ...] }  -> borra esas (si son suyas y no pagadas)
 *   { all: true }                     -> borra TODAS sus órdenes no pagadas
 *
 * Nunca borra órdenes pagadas (completado/aprobado): son registro de venta real.
 * La propiedad se valida contra el token (no se confía en el cliente): un usuario
 * solo puede borrar SUS órdenes.
 * Devuelve { borradas: n }.
 */
export async function DELETE(request) {
  try {
    const { userId, user } = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401, headers: corsHeaders },
      );
    }

    const body = await request.json().catch(() => ({}));
    const borrarTodas = body?.all === true;
    const references = Array.isArray(body?.references)
      ? body.references.filter((r) => typeof r === "string" && r.trim())
      : [];

    if (!borrarTodas && references.length === 0) {
      return NextResponse.json(
        { error: "Indica 'references' (array) o 'all: true'." },
        { status: 400, headers: corsHeaders },
      );
    }

    const propiedad = condicionesPropiedad(userId, user);

    // Condición base: la orden es del usuario Y NO está pagada.
    // (estado y estado_pago fuera de los estados de "pagada").
    const estadosPlaceholders = ESTADOS_PAGADA.map(() => "?").join(", ");
    const where = [
      propiedad.sql,
      `LOWER(estado) NOT IN (${estadosPlaceholders})`,
      `LOWER(estado_pago) NOT IN (${estadosPlaceholders})`,
    ];
    const params = [
      ...propiedad.params,
      ...ESTADOS_PAGADA,
      ...ESTADOS_PAGADA,
    ];

    // Si se piden referencias concretas, se acota a ellas.
    if (!borrarTodas) {
      const refPlaceholders = references.map(() => "?").join(", ");
      where.push(`numero_orden IN (${refPlaceholders})`);
      params.push(...references);
    }

    const meta = await d1Execute(
      `DELETE FROM orders WHERE ${where.join(" AND ")}`,
      params,
    );

    // d1 meta trae changes/rows_written según el driver; usamos el que exista.
    const borradas =
      meta?.changes ?? meta?.rows_written ?? meta?.rowsAffected ?? 0;

    return NextResponse.json({ borradas }, { headers: corsHeaders });
  } catch (error) {
    console.error("[pagos/ordenes] DELETE error:", error);
    return NextResponse.json(
      { error: "Error eliminando órdenes" },
      { status: 500, headers: corsHeaders },
    );
  }
}
