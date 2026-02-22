import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// Función para transformar facturas de formato DB a formato Frontend
function transformarFactura(facturaDB) {
  return {
    id: facturaDB.id,
    numeroFactura: facturaDB.numero_factura,
    fecha: facturaDB.fecha,

    // Transformar información del cliente
    cliente: {
      nombre: facturaDB.cliente_nombre,
      identificacion: facturaDB.cliente_identificacion,
      telefono: facturaDB.cliente_telefono,
      email: facturaDB.cliente_email,
      direccion: facturaDB.cliente_direccion,
    },
    clienteId: facturaDB.cliente_id,

    // Transformar información de contacto
    miContacto: {
      telefono: facturaDB.mi_telefono,
      email: facturaDB.mi_email,
    },

    // Parsear JSON fields
    servicios: typeof facturaDB.servicios === 'string'
      ? JSON.parse(facturaDB.servicios)
      : facturaDB.servicios || [],
    productos: typeof facturaDB.productos === 'string'
      ? JSON.parse(facturaDB.productos)
      : facturaDB.productos || [],

    // Información financiera
    subtotal: parseFloat(facturaDB.subtotal),
    descuentoPorcentaje: facturaDB.descuento_porcentaje,
    descuentoMonto: parseFloat(facturaDB.descuento_monto),
    total: parseFloat(facturaDB.total),

    metodoPago: facturaDB.metodo_pago,
    notas: facturaDB.notas,

    created_at: facturaDB.created_at,
    updated_at: facturaDB.updated_at,
  };
}

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
    const limit = parseInt(searchParams.get('limit') || '1000'); // Aumentado de 50 a 1000
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('🔍 [API] GET /api/facturas llamado con filtros:', {
      busqueda, mes, valorMin, valorMax, metodoPago, limit, offset
    });

    const supabase = getSupabaseServerClient(); // Cambiado a SERVER_ROLE_KEY para evitar RLS
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
      // Obtener el último día del mes correctamente
      const lastDay = new Date(parseInt(year), parseInt(month), 0);
      const lastDayStr = `${year}-${month}-${String(lastDay.getDate()).padStart(2, '0')}T23:59:59`;
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
      console.error('❌ [API] Error obteniendo facturas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ [API] Facturas encontradas: ${facturas?.length || 0} (total en DB: ${count})`);

    if (facturas && facturas.length > 0) {
      console.log('📋 [API] Primera factura:', {
        numero: facturas[0].numero_factura,
        cliente: facturas[0].cliente_nombre,
        fecha: facturas[0].fecha
      });
    }

    // Transformar todas las facturas al formato frontend
    const facturasTransformadas = facturas.map(transformarFactura);

    // Calcular estadísticas
    const stats = {
      total_facturas: count,
      suma_total: facturasTransformadas.reduce((sum, f) => sum + parseFloat(f.total || 0), 0),
      promedio: count > 0 ? facturasTransformadas.reduce((sum, f) => sum + parseFloat(f.total || 0), 0) / count : 0
    };

    return NextResponse.json({
      facturas: facturasTransformadas,
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

    const supabase = getSupabaseServerClient();

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

    // Transformar la factura al formato esperado por el frontend
    const facturaTransformada = transformarFactura(factura);

    return NextResponse.json({
      success: true,
      factura: facturaTransformada,
      mensaje: 'Factura creada exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/facturas:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// PUT /api/facturas - Actualizar factura existente
export async function PUT(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id, // ID de la factura a actualizar
      numeroFactura,
      cliente,
      clienteId,
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
    if (!id) {
      return NextResponse.json({
        error: 'Se requiere el ID de la factura para actualizar'
      }, { status: 400 });
    }

    if (!numeroFactura || !cliente?.nombre) {
      return NextResponse.json({
        error: 'Faltan campos requeridos: numeroFactura, cliente.nombre'
      }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Calcular subtotal
    const subtotal = parseFloat(total) + parseFloat(descuentoMonto || 0);

    // Datos actualizados de la factura
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
      .update(facturaData)
      .eq('id', id)
      .select()
      .single();

    if (errorFactura) {
      console.error('Error actualizando factura:', errorFactura);
      return NextResponse.json({
        error: 'Error al actualizar la factura: ' + errorFactura.message
      }, { status: 500 });
    }

    // Transformar la factura al formato esperado por el frontend
    const facturaTransformada = transformarFactura(factura);

    return NextResponse.json({
      success: true,
      factura: facturaTransformada,
      mensaje: 'Factura actualizada exitosamente'
    }, { status: 200 });

  } catch (error) {
    console.error('Error en PUT /api/facturas:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// DELETE /api/facturas - Eliminar factura
export async function DELETE(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'Se requiere el ID de la factura para eliminar'
      }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { error: errorFactura } = await supabase
      .from('facturas')
      .delete()
      .eq('id', id);

    if (errorFactura) {
      console.error('Error eliminando factura:', errorFactura);
      return NextResponse.json({
        error: 'Error al eliminar la factura: ' + errorFactura.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Factura eliminada exitosamente'
    }, { status: 200 });

  } catch (error) {
    console.error('Error en DELETE /api/facturas:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
