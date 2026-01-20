import { NextResponse } from 'next/server';
import { getSupabaseBrowserClient } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// GET /api/ganancias/productos - Obtener productos más vendidos/rentables
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ordenar = searchParams.get('ordenar') || 'ganancia'; // ganancia, ventas, ingresos
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = getSupabaseBrowserClient();

    // Obtener todas las ventas
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select('*');

    if (error) {
      console.error('Error obteniendo ventas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Agrupar por producto
    const productoStats = {};

    ventas.forEach(venta => {
      const productoId = venta.producto_id || 'sin_id';
      const productoNombre = venta.producto_nombre || 'Producto sin nombre';

      if (!productoStats[productoId]) {
        productoStats[productoId] = {
          producto_id: productoId,
          producto_nombre: productoNombre,
          veces_vendido: 0,
          unidades_vendidas: 0,
          ingresos_totales: 0,
          costos_totales: 0,
          ganancia_total: 0,
          precio_venta_promedio: 0,
          margen_promedio: 0
        };
      }

      const stats = productoStats[productoId];
      stats.veces_vendido++;
      stats.unidades_vendidas += venta.cantidad || 0;
      stats.ingresos_totales += venta.subtotal_venta || 0;
      stats.costos_totales += venta.subtotal_compra || 0;
      stats.ganancia_total += venta.ganancia_total || 0;
    });

    // Calcular promedios
    Object.values(productoStats).forEach(stats => {
      if (stats.veces_vendido > 0) {
        stats.precio_venta_promedio = stats.ingresos_totales / stats.unidades_vendidas;
      }
      if (stats.ingresos_totales > 0) {
        stats.margen_promedio = (stats.ganancia_total / stats.ingresos_totales) * 100;
      }
    });

    // Convertir a array y ordenar
    let productos = Object.values(productoStats);

    switch (ordenar) {
      case 'ventas':
        productos.sort((a, b) => b.unidades_vendidas - a.unidades_vendidas);
        break;
      case 'ingresos':
        productos.sort((a, b) => b.ingresos_totales - a.ingresos_totales);
        break;
      case 'ganancia':
      default:
        productos.sort((a, b) => b.ganancia_total - a.ganancia_total);
        break;
    }

    // Limitar resultados
    productos = productos.slice(0, limit);

    return NextResponse.json({
      productos,
      total: Object.keys(productoStats).length,
      ordenado_por: ordenar
    });

  } catch (error) {
    console.error('Error en GET /api/ganancias/productos:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
