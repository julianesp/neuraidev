import { NextResponse } from 'next/server';
import { getSupabaseBrowserClient } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// GET /api/facturas - Obtener facturas con filtros
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get('busqueda'); // Buscar por cliente o número
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');
    const mes = searchParams.get('mes'); // YYYY-MM
    const valorMin = searchParams.get('valor_min');
    const valorMax = searchParams.get('valor_max');
    const clienteId = searchParams.get('cliente_id');
    const metodoPago = searchParams.get('metodo_pago');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from('facturas')
      .select('*', { count: 'exact' })
      .order('fecha', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtro por búsqueda en cliente o número de factura
    if (busqueda) {
      query = query.or(`cliente_nombre.ilike.%${busqueda}%,numero_factura.ilike.%${busqueda}%`);
    }

    // Filtro por mes
    if (mes) {
      const [year, month] = mes.split('-');
      const firstDay = `${year}-${month}-01T00:00:00`;
      const lastDay = new Date(year, month, 0);
      const lastDayStr = `${year}-${month}-${lastDay.getDate()}T23:59:59`;
      query = query.gte('fecha', firstDay).lte('fecha', lastDayStr);
    }

    // Filtro por rango de fechas
    if (fechaInicio) {
      query = query.gte('fecha', `${fechaInicio}T00:00:00`);
    }
    if (fechaFin) {
      query = query.lte('fecha', `${fechaFin}T23:59:59`);
    }

    // Filtro por valor
    if (valorMin) {
      query = query.gte('total', parseFloat(valorMin));
    }
    if (valorMax) {
      query = query.lte('total', parseFloat(valorMax));
    }

    // Filtro por cliente
    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    // Filtro por método de pago
    if (metodoPago) {
      query = query.eq('metodo_pago', metodoPago);
    }

    const { data: facturas, error, count } = await query;

    if (error) {
      console.error('Error obteniendo facturas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calcular estadísticas
    const stats = {
      total_facturas: count,
      suma_total: facturas.reduce((sum, f) => sum + parseFloat(f.total || 0), 0),
      promedio: count > 0 ? facturas.reduce((sum, f) => sum + parseFloat(f.total || 0), 0) / count : 0
    };

    return NextResponse.json({
      facturas,
      total: count,
      limit,
      offset,
      stats
    });

  } catch (error) {
    console.error('Error en GET /api/facturas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/facturas - Crear nueva factura
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      numeroFactura,
      cliente,
      clienteId, // ID si es cliente existente
      miContacto,
      servicios,
      productos,
      total,
      descuentoPorcentaje,
      descuentoMonto,
      metodoPago,
      notas,
      fecha
    } = body;

    // Validaciones
    if (!numeroFactura || !cliente?.nombre) {
      return NextResponse.json({
        error: 'Faltan campos requeridos: numeroFactura, cliente.nombre'
      }, { status: 400 });
    }

    const supabase = getSupabaseBrowserClient();

    // Calcular subtotal
    const subtotal = parseFloat(total) + parseFloat(descuentoMonto || 0);

    // Crear la factura
    const facturaData = {
      numero_factura: numeroFactura,
      cliente_id: clienteId || null,
      cliente_nombre: cliente.nombre,
      cliente_identificacion: cliente.identificacion || null,
      cliente_telefono: cliente.telefono || null,
      cliente_email: cliente.email || null,
      cliente_direccion: cliente.direccion || null,
      mi_telefono: miContacto?.telefono || null,
      mi_email: miContacto?.email || null,
      servicios: JSON.stringify(servicios || []),
      productos: JSON.stringify(productos || []),
      subtotal: parseFloat(subtotal),
      descuento_porcentaje: parseInt(descuentoPorcentaje || 0),
      descuento_monto: parseFloat(descuentoMonto || 0),
      total: parseFloat(total),
      metodo_pago: metodoPago || 'efectivo',
      notas: notas || null,
      fecha: fecha || new Date().toISOString()
    };

    const { data: factura, error: errorFactura } = await supabase
      .from('facturas')
      .insert(facturaData)
      .select()
      .single();

    if (errorFactura) {
      console.error('Error creando factura:', errorFactura);
      return NextResponse.json({
        error: 'Error al crear la factura: ' + errorFactura.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      factura,
      mensaje: 'Factura creada exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/facturas:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
