import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/db';

// Endpoint de prueba para verificar que la API funciona
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    // Consultar TODAS las facturas sin filtros
    const { data: todas, error: errorTodas } = await supabase
      .from('facturas')
      .select('*')
      .order('fecha', { ascending: false });

    if (errorTodas) {
      return NextResponse.json({ error: errorTodas.message }, { status: 500 });
    }

    // Consultar solo enero 2026
    const mes = '2026-01';
    const [year, month] = mes.split('-');
    const firstDay = `${year}-${month}-01T00:00:00`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0);
    const lastDayStr = `${year}-${month}-${String(lastDay.getDate()).padStart(2, '0')}T23:59:59`;

    const { data: enero, error: errorEnero } = await supabase
      .from('facturas')
      .select('*')
      .gte('fecha', firstDay)
      .lte('fecha', lastDayStr)
      .order('fecha', { ascending: false });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total_facturas: todas.length,
      facturas_enero_2026: enero.length,
      todas_las_facturas: todas.map(f => ({
        numero: f.numero_factura,
        cliente: f.cliente_nombre,
        fecha: f.fecha,
        total: f.total
      })),
      solo_enero: enero.map(f => ({
        numero: f.numero_factura,
        cliente: f.cliente_nombre,
        fecha: f.fecha,
        total: f.total
      })),
      filtro_usado: {
        mes: mes,
        firstDay,
        lastDayStr
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
