import { NextResponse } from 'next/server';
import { getSupabaseBrowserClient } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// GET /api/ventas - Obtener historial de ventas
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha'); // YYYY-MM-DD
    const productoId = searchParams.get('producto_id');
    const metodoPago = searchParams.get('metodo_pago');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from('ventas')
      .select('*', { count: 'exact' })
      .order('fecha_venta', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtros opcionales
    if (fecha) {
      query = query.gte('fecha_venta', `${fecha}T00:00:00`)
                   .lte('fecha_venta', `${fecha}T23:59:59`);
    }

    if (productoId) {
      query = query.eq('producto_id', productoId);
    }

    if (metodoPago) {
      query = query.eq('metodo_pago', metodoPago);
    }

    const { data: ventas, error, count } = await query;

    if (error) {
      console.error('Error obteniendo ventas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ventas,
      total: count,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error en GET /api/ventas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/ventas - Registrar nueva venta
export async function POST(request) {
  try {
    const { userId, user } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      producto_id,
      cantidad,
      precio_venta,
      precio_compra,
      cliente_nombre,
      cliente_telefono,
      cliente_email,
      metodo_pago,
      comprobante_pago,
      notas
    } = body;

    // Validaciones
    if (!producto_id || !cantidad || !precio_venta || !precio_compra) {
      return NextResponse.json({
        error: 'Faltan campos requeridos: producto_id, cantidad, precio_venta, precio_compra'
      }, { status: 400 });
    }

    if (cantidad <= 0) {
      return NextResponse.json({
        error: 'La cantidad debe ser mayor a 0'
      }, { status: 400 });
    }

    const supabase = getSupabaseBrowserClient();

    // Obtener información del producto
    const { data: producto, error: errorProducto } = await supabase
      .from('products')
      .select('nombre, stock, disponible')
      .eq('id', producto_id)
      .single();

    if (errorProducto || !producto) {
      return NextResponse.json({
        error: 'Producto no encontrado'
      }, { status: 404 });
    }

    // Verificar stock
    if (producto.stock < cantidad) {
      return NextResponse.json({
        error: `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${cantidad}`
      }, { status: 400 });
    }

    // Crear la venta
    const { data: venta, error: errorVenta } = await supabase
      .from('ventas')
      .insert({
        producto_id,
        producto_nombre: producto.nombre,
        cantidad,
        precio_compra: parseFloat(precio_compra),
        precio_venta: parseFloat(precio_venta),
        cliente_nombre,
        cliente_telefono,
        cliente_email,
        metodo_pago: metodo_pago || 'nequi',
        comprobante_pago,
        notas,
        vendedor_id: userId,
        vendedor_nombre: user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'Usuario'
      })
      .select()
      .single();

    if (errorVenta) {
      console.error('Error creando venta:', errorVenta);
      return NextResponse.json({
        error: 'Error al crear la venta: ' + errorVenta.message
      }, { status: 500 });
    }

    // Actualizar stock del producto
    const nuevoStock = producto.stock - cantidad;
    const { error: errorStock } = await supabase
      .from('products')
      .update({
        stock: nuevoStock,
        disponible: nuevoStock > 0
      })
      .eq('id', producto_id);

    if (errorStock) {
      console.error('Error actualizando stock:', errorStock);
      // No retornamos error aquí porque la venta ya se creó
      // Solo logueamos el error
    }

    return NextResponse.json({
      success: true,
      venta,
      mensaje: 'Venta registrada exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/ventas:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
