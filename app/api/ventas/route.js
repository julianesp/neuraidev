import { NextResponse } from 'next/server';
import { d1Select } from '@/lib/db-d1';
import { getSupabaseServerClient } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// GET /api/ventas - Obtener historial de ventas
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');
    const mes = searchParams.get('mes');
    const productoId = searchParams.get('producto_id');
    const metodoPago = searchParams.get('metodo_pago');
    const limit = parseInt(searchParams.get('limit') || '500');
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions = [];
    const params = [];

    if (mes) {
      const [year, month] = mes.split('-').map(Number);
      const primerDia = `${mes}-01T00:00:00`;
      const ultimoDia = new Date(year, month, 0);
      const ultimoDiaStr = `${mes}-${String(ultimoDia.getDate()).padStart(2, '0')}T23:59:59`;
      conditions.push('fecha_venta >= ? AND fecha_venta <= ?');
      params.push(primerDia, ultimoDiaStr);
    } else if (fecha) {
      conditions.push('fecha_venta >= ? AND fecha_venta <= ?');
      params.push(`${fecha}T00:00:00`, `${fecha}T23:59:59`);
    }

    if (productoId) {
      conditions.push('producto_id = ?');
      params.push(productoId);
    }

    if (metodoPago) {
      conditions.push('metodo_pago = ?');
      params.push(metodoPago);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit, offset);

    const ventas = await d1Select(
      `SELECT * FROM ventas ${where} ORDER BY fecha_venta DESC LIMIT ? OFFSET ?`,
      params
    );

    return NextResponse.json({
      ventas,
      total: ventas.length,
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
      producto_nombre_manual,
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
    if (!cantidad || !precio_venta || precio_compra === undefined) {
      return NextResponse.json({
        error: 'Faltan campos requeridos: cantidad, precio_venta, precio_compra'
      }, { status: 400 });
    }

    // Debe tener producto_id O producto_nombre_manual
    if (!producto_id && !producto_nombre_manual) {
      return NextResponse.json({
        error: 'Debes proporcionar producto_id o producto_nombre_manual'
      }, { status: 400 });
    }

    if (cantidad <= 0) {
      return NextResponse.json({
        error: 'La cantidad debe ser mayor a 0'
      }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    let nombreProducto = producto_nombre_manual;
    let actualizarStock = false;

    // Si es un producto del inventario, obtener info y validar stock
    if (producto_id) {
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

      nombreProducto = producto.nombre;
      actualizarStock = true;
    }

    const ahora = new Date().toISOString();
    const numeroVenta = `V-${Date.now()}`;
    const precioCompraNum = parseFloat(precio_compra);
    const precioVentaNum = parseFloat(precio_venta);

    // Crear la venta
    const { data: venta, error: errorVenta } = await supabase
      .from('ventas')
      .insert({
        id: crypto.randomUUID(),
        numero_venta: numeroVenta,
        fecha_venta: ahora,
        producto_id: producto_id || null,
        producto_nombre: nombreProducto,
        cantidad,
        precio_compra: precioCompraNum,
        precio_venta: precioVentaNum,
        subtotal_compra: precioCompraNum * cantidad,
        subtotal_venta: precioVentaNum * cantidad,
        ganancia_total: (precioVentaNum - precioCompraNum) * cantidad,
        cliente_nombre,
        cliente_telefono,
        cliente_email,
        metodo_pago: metodo_pago || 'nequi',
        comprobante_pago,
        notas,
        vendedor_id: userId,
        vendedor_nombre: user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'Usuario',
        created_at: ahora,
        updated_at: ahora,
      })
      .select()
      .single();

    if (errorVenta) {
      console.error('Error creando venta:', errorVenta);
      return NextResponse.json({
        error: 'Error al crear la venta: ' + errorVenta.message
      }, { status: 500 });
    }

    // Actualizar stock del producto SOLO si es del inventario
    if (actualizarStock && producto_id) {
      const { data: producto } = await supabase
        .from('products')
        .select('stock')
        .eq('id', producto_id)
        .single();

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
