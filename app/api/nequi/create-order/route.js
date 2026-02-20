import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/db';

/**
 * POST /api/nequi/create-order
 * Crea un pedido pendiente con pago Nequi
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      email,
      numeroFactura,
      productos,
      precioOriginal,
      descuentoPorcentaje,
      totalConDescuento,
      userId
    } = body;

    // Validaciones
    if (!email || !numeroFactura || !productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        { error: 'Datos incompletos. Se requiere email, numeroFactura y productos.' },
        { status: 400 }
      );
    }

    // Validar email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    if (!precioOriginal || !totalConDescuento) {
      return NextResponse.json(
        { error: 'Se requieren los montos del pedido' },
        { status: 400 }
      );
    }

    // Verificar que el número de factura no exista
    const supabase = getSupabaseServerClient();

    const { data: existingOrder } = await supabase
      .from('nequi_orders')
      .select('id')
      .eq('numero_factura', numeroFactura)
      .single();

    if (existingOrder) {
      return NextResponse.json(
        { error: 'Esta factura ya existe', orderId: existingOrder.id },
        { status: 409 }
      );
    }

    // Crear pedido
    const { data: newOrder, error: insertError } = await supabase
      .from('nequi_orders')
      .insert({
        numero_factura: numeroFactura,
        email: email.toLowerCase().trim(),
        user_id: userId || null,
        productos: productos,
        precio_original: precioOriginal,
        descuento_porcentaje: descuentoPorcentaje || 5,
        total_con_descuento: totalConDescuento,
        estado: 'pendiente',
        reminder_sent: false,
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() // 72 horas
      })
      .select()
      .single();

    if (insertError) {
      console.error('[API] Error creating Nequi order:', insertError);
      return NextResponse.json(
        { error: 'Error al crear el pedido', details: insertError.message },
        { status: 500 }
      );
    }

    console.log(`[API] ✅ Pedido Nequi creado: ${numeroFactura} para ${email}`);

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: 'Pedido creado exitosamente'
    });

  } catch (error) {
    console.error('[API] Error in create-order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
