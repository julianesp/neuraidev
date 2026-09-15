import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

/**
 * Compradores reales derivados de las órdenes pagadas.
 *
 * A diferencia de /api/clientes (tabla `clientes`, que se llena a mano), aquí
 * se agrupan las órdenes completadas por email para obtener, sin trabajo manual,
 * quiénes han comprado de verdad: cuántas compras, cuánto han gastado y cuándo
 * fue su última compra.
 *
 * GET /api/dashboard/compradores
 */
export async function GET(request) {
  try {
    const { userId } = await auth();
    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost =
      request.headers.get("host")?.includes("localhost") ||
      request.headers.get("host")?.includes("127.0.0.1");

    if (!userId && !(isDev && isLocalhost)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Solo órdenes efectivamente pagadas.
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo órdenes:", error);
      return NextResponse.json(
        { error: "Error obteniendo órdenes", details: error.message },
        { status: 500 },
      );
    }

    const pagadas = (orders || []).filter(
      (o) => o.estado === "completado" || o.estado === "pagado" || o.estado_pago === "completado",
    );

    // Agrupar por email (normalizado). Si no hay email, se agrupa por nombre.
    const porComprador = new Map();

    for (const o of pagadas) {
      const email = (o.customer_email || "").toLowerCase().trim();
      const clave = email || `sin-email:${(o.customer_name || "Cliente").toLowerCase().trim()}`;

      // metadata de D1 llega como string JSON
      let metadata = o.metadata;
      if (typeof metadata === "string") {
        try { metadata = JSON.parse(metadata); } catch { metadata = null; }
      }
      const productos = metadata?.productos || o.productos || o.items || [];
      const numProductos = Array.isArray(productos)
        ? productos.reduce((s, p) => s + (p.quantity || p.cantidad || 1), 0)
        : 0;

      const existente = porComprador.get(clave);
      const total = Number(o.total) || 0;
      const fecha = o.fecha_pago || o.created_at;

      if (!existente) {
        porComprador.set(clave, {
          email: email || null,
          nombre: o.customer_name || "Cliente",
          telefono: o.customer_phone || "",
          ciudad: metadata?.customer_city || "",
          total_compras: 1,
          total_gastado: total,
          total_articulos: numProductos,
          ultima_compra: fecha,
          primera_compra: fecha,
        });
      } else {
        existente.total_compras += 1;
        existente.total_gastado += total;
        existente.total_articulos += numProductos;
        // Conservar el nombre/teléfono más reciente si falta
        if (!existente.telefono && o.customer_phone) existente.telefono = o.customer_phone;
        if (fecha > existente.ultima_compra) existente.ultima_compra = fecha;
        if (fecha < existente.primera_compra) existente.primera_compra = fecha;
      }
    }

    const compradores = [...porComprador.values()].sort(
      (a, b) => b.total_gastado - a.total_gastado,
    );

    const stats = {
      total_compradores: compradores.length,
      total_ordenes: pagadas.length,
      ingresos_totales: compradores.reduce((s, c) => s + c.total_gastado, 0),
      recurrentes: compradores.filter((c) => c.total_compras > 1).length,
    };

    return NextResponse.json({ success: true, compradores, stats });
  } catch (error) {
    console.error("Error en /api/dashboard/compradores:", error);
    return NextResponse.json(
      { error: "Error interno", details: error.message },
      { status: 500 },
    );
  }
}
