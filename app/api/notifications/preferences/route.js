import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/notifications/preferences
 * Obtener las preferencias de notificación del usuario
 */
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Buscar preferencias del usuario
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error obteniendo preferencias:", error);
      return NextResponse.json(
        { error: "Error al obtener preferencias" },
        { status: 500 }
      );
    }

    // Si no existen preferencias, crear valores por defecto
    if (!data) {
      const defaultPrefs = {
        user_id: user.id,
        notify_new_orders: true,
        notify_low_stock: true,
        low_stock_threshold: 5,
      };

      const { data: newPrefs, error: insertError } = await supabase
        .from('user_notification_preferences')
        .insert([defaultPrefs])
        .select()
        .single();

      if (insertError) {
        console.error("Error creando preferencias:", insertError);
        return NextResponse.json(
          { error: "Error al crear preferencias" },
          { status: 500 }
        );
      }

      return NextResponse.json(newPrefs);
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error en GET /api/notifications/preferences:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/preferences
 * Actualizar las preferencias de notificación del usuario
 * Body: { notify_new_orders?, notify_low_stock?, low_stock_threshold? }
 */
export async function PATCH(request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notify_new_orders, notify_low_stock, low_stock_threshold } = body;

    // Validaciones
    if (low_stock_threshold !== undefined && (low_stock_threshold < 1 || low_stock_threshold > 100)) {
      return NextResponse.json(
        { error: "El umbral de stock debe estar entre 1 y 100" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Preparar datos a actualizar
    const updateData = {};
    if (notify_new_orders !== undefined) updateData.notify_new_orders = notify_new_orders;
    if (notify_low_stock !== undefined) updateData.notify_low_stock = notify_low_stock;
    if (low_stock_threshold !== undefined) updateData.low_stock_threshold = low_stock_threshold;

    // Verificar si existen preferencias
    const { data: existingPrefs } = await supabase
      .from('user_notification_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existingPrefs) {
      // Crear nuevas preferencias
      const { data: newPrefs, error: insertError } = await supabase
        .from('user_notification_preferences')
        .insert([{
          user_id: user.id,
          ...updateData,
        }])
        .select()
        .single();

      if (insertError) {
        console.error("Error creando preferencias:", insertError);
        return NextResponse.json(
          { error: "Error al guardar preferencias" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        preferences: newPrefs,
      });
    }

    // Actualizar preferencias existentes
    const { data: updatedPrefs, error: updateError } = await supabase
      .from('user_notification_preferences')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error actualizando preferencias:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar preferencias" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPrefs,
    });

  } catch (error) {
    console.error("Error en PATCH /api/notifications/preferences:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
