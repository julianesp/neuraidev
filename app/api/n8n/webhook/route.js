import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * Webhook genérico para recibir eventos desde n8n
 * POST /api/n8n/webhook
 *
 * Este endpoint permite que n8n envíe datos de vuelta a tu tienda
 * Por ejemplo: para actualizar un cliente, crear un cupón, etc.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Verificar API key si está configurada
    const apiKey = request.headers.get('x-n8n-api-key');
    const expectedApiKey = process.env.N8N_API_KEY;

    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: "API key inválida" },
        { status: 401 }
      );
    }

    const { action, data } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Se requiere el campo 'action'" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Manejar diferentes acciones
    switch (action) {

      // ====================================
      // ACCIONES DE CLIENTES
      // ====================================

      case 'customer.create_coupon':
        // Crear un cupón para un cliente
        const { customerId, couponCode, discount, expiresAt } = data;

        const { data: coupon, error: couponError } = await supabase
          .from('discount_codes')
          .insert({
            code: couponCode,
            discount_percentage: discount,
            expires_at: expiresAt,
            max_uses: 1,
            customer_email: data.customerEmail,
            created_by: 'n8n_automation',
          })
          .select()
          .single();

        if (couponError) {
          return NextResponse.json(
            { error: "Error creando cupón", details: couponError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          coupon,
        });

      case 'customer.update_tags':
        // Actualizar tags de un cliente
        const { email, tags } = data;

        const { error: updateError } = await supabase
          .from('customers')
          .update({ tags })
          .eq('email', email);

        if (updateError) {
          return NextResponse.json(
            { error: "Error actualizando tags", details: updateError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Tags actualizados',
        });

      // ====================================
      // ACCIONES DE PRODUCTOS
      // ====================================

      case 'product.update_stock':
        // Actualizar stock de un producto
        const { productId, newStock } = data;

        const { error: stockError } = await supabase
          .from('Producto')
          .update({ stock: newStock })
          .eq('id', productId);

        if (stockError) {
          return NextResponse.json(
            { error: "Error actualizando stock", details: stockError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Stock actualizado',
        });

      // ====================================
      // ACCIONES DE NOTIFICACIONES
      // ====================================

      case 'notification.create':
        // Crear una notificación para un usuario
        const { userId, title, message, type } = data;

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title,
            message,
            type,
            created_at: new Date().toISOString(),
          });

        if (notifError) {
          return NextResponse.json(
            { error: "Error creando notificación", details: notifError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Notificación creada',
        });

      default:
        return NextResponse.json(
          { error: `Acción desconocida: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error en webhook de n8n:", error);
    return NextResponse.json(
      { error: "Error procesando webhook", details: error.message },
      { status: 500 }
    );
  }
}

// GET para verificar que el webhook está activo
export async function GET() {
  return NextResponse.json({
    message: "Webhook de n8n activo",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
