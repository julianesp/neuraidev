import { NextResponse } from 'next/server';
import { getSupabaseBrowserClient } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// GET /api/ganancias/resumen - Obtener resumen de ganancias
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || 'hoy'; // hoy, semana, mes, todo
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');

    const supabase = getSupabaseBrowserClient();

    // Determinar rango de fechas según el período
    let startDate, endDate;
    const now = new Date();

    switch (periodo) {
      case 'hoy':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'semana':
        const inicioSemana = new Date(now);
        inicioSemana.setDate(now.getDate() - now.getDay()); // Domingo
        startDate = new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate());
        endDate = now;
        break;
      case 'mes':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case 'personalizado':
        if (fechaInicio && fechaFin) {
          startDate = new Date(fechaInicio);
          endDate = new Date(fechaFin);
        }
        break;
      default:
        startDate = null;
        endDate = null;
    }

    // Construir query base
    let query = supabase.from('ventas').select('*');

    if (startDate && endDate) {
      query = query.gte('fecha_venta', startDate.toISOString())
                   .lte('fecha_venta', endDate.toISOString());
    }

    const { data: ventas, error } = await query;

    if (error) {
      console.error('Error obteniendo ventas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calcular resumen
    const resumen = {
      periodo,
      fecha_inicio: startDate?.toISOString() || null,
      fecha_fin: endDate?.toISOString() || null,

      total_ventas: ventas.length,
      unidades_vendidas: ventas.reduce((sum, v) => sum + (v.cantidad || 0), 0),

      ingresos_brutos: ventas.reduce((sum, v) => sum + (v.subtotal_venta || 0), 0),
      costos_totales: ventas.reduce((sum, v) => sum + (v.subtotal_compra || 0), 0),
      ganancia_neta: ventas.reduce((sum, v) => sum + (v.ganancia_total || 0), 0),

      margen_promedio: 0,
      ticket_promedio: 0,

      metodos_pago: {},
      ventas_por_dia: []
    };

    // Calcular margen promedio
    if (resumen.ingresos_brutos > 0) {
      resumen.margen_promedio = (resumen.ganancia_neta / resumen.ingresos_brutos) * 100;
    }

    // Calcular ticket promedio
    if (resumen.total_ventas > 0) {
      resumen.ticket_promedio = resumen.ingresos_brutos / resumen.total_ventas;
    }

    // Agrupar por método de pago
    ventas.forEach(venta => {
      const metodo = venta.metodo_pago || 'sin_especificar';
      if (!resumen.metodos_pago[metodo]) {
        resumen.metodos_pago[metodo] = {
          cantidad: 0,
          monto: 0,
          ganancia: 0
        };
      }
      resumen.metodos_pago[metodo].cantidad++;
      resumen.metodos_pago[metodo].monto += venta.subtotal_venta || 0;
      resumen.metodos_pago[metodo].ganancia += venta.ganancia_total || 0;
    });

    // Agrupar por día (para gráficas)
    const ventasPorDia = {};
    ventas.forEach(venta => {
      const fecha = new Date(venta.fecha_venta).toISOString().split('T')[0];
      if (!ventasPorDia[fecha]) {
        ventasPorDia[fecha] = {
          fecha,
          ventas: 0,
          ingresos: 0,
          ganancia: 0
        };
      }
      ventasPorDia[fecha].ventas++;
      ventasPorDia[fecha].ingresos += venta.subtotal_venta || 0;
      ventasPorDia[fecha].ganancia += venta.ganancia_total || 0;
    });

    resumen.ventas_por_dia = Object.values(ventasPorDia).sort((a, b) =>
      new Date(a.fecha) - new Date(b.fecha)
    );

    return NextResponse.json(resumen);

  } catch (error) {
    console.error('Error en GET /api/ganancias/resumen:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
