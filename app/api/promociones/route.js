import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

/**
 * GET /api/promociones
 * Obtiene todas las promociones (opcionalmente solo activas)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const soloActivas = searchParams.get('activas') === 'true';

    const supabase = getSupabaseClient();

    let query = supabase
      .from('promociones')
      .select('*')
      .order('posicion_orden', { ascending: true });

    if (soloActivas) {
      const now = new Date().toISOString();
      query = query
        .eq('activo', true)
        .or(`fecha_inicio.is.null,fecha_inicio.lte.${now}`)
        .or(`fecha_fin.is.null,fecha_fin.gte.${now}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[GET /api/promociones] Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      promociones: data || [],
    });

  } catch (error) {
    console.error('[GET /api/promociones] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/promociones
 * Crea una nueva promoción
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validar campos requeridos
    if (!body.nombre || !body.tipo || !body.productos_ids) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('promociones')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('[POST /api/promociones] Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      promocion: data,
    }, { status: 201 });

  } catch (error) {
    console.error('[POST /api/promociones] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
