import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * API para forzar la actualización de pedidos pendientes antiguos
 * GET /api/dashboard/force-update-orders
 *
 * Este endpoint marca como completados todos los pedidos pendientes
 * que tienen más de 1 hora de antigüedad (asumiendo que fueron pagados)
 */
export async function GET(request) {
  try {
    console.log("🔧 [FORCE-UPDATE] Forzando actualización de pedidos antiguos...");

    const supabase = getSupabaseClient();

    // Obtener pedidos pendientes con más de 1 hora
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    const { data: oldPendingOrders, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("estado", "pendiente")
      .lt("created_at", oneHourAgo);

    if (fetchError) {
      console.error("❌ Error obteniendo pedidos:", fetchError);
      return NextResponse.json(
        { error: "Error obteniendo pedidos" },
        { status: 500 }
      );
    }

    if (!oldPendingOrders || oldPendingOrders.length === 0) {
      console.log("✅ No hay pedidos antiguos pendientes");
      return NextResponse.json({
        success: true,
        message: "No hay pedidos antiguos para actualizar",
        updated: 0,
      });
    }

    console.log(`📦 Encontrados ${oldPendingOrders.length} pedidos antiguos`);

    let updated = 0;
    const errors = [];

    // Actualizar cada pedido
    for (const order of oldPendingOrders) {
      try {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            estado: "completado",
            updated_at: new Date().toISOString(),
          })
          .eq("numero_orden", order.numero_orden);

        if (updateError) {
          console.error(`❌ Error actualizando ${order.numero_orden}:`, updateError);
          errors.push({
            order: order.numero_orden,
            error: updateError.message,
          });
        } else {
          console.log(`✅ Actualizado: ${order.numero_orden}`);
          updated++;
        }
      } catch (err) {
        console.error(`❌ Error procesando ${order.numero_orden}:`, err);
        errors.push({
          order: order.numero_orden,
          error: err.message,
        });
      }
    }

    console.log("✅ Actualización forzada completada");
    console.log(`  Actualizados: ${updated}`);
    console.log(`  Errores: ${errors.length}`);

    return NextResponse.json({
      success: true,
      message: `Se actualizaron ${updated} pedidos`,
      updated,
      errors,
      details: oldPendingOrders.map(o => ({
        numero_orden: o.numero_orden,
        created_at: o.created_at,
        customer_name: o.customer_name,
        total: o.total
      }))
    });
  } catch (error) {
    console.error("❌ Error en actualización forzada:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
