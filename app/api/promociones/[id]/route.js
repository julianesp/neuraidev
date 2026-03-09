import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

/**
 * GET /api/promociones/[id]
 * Obtiene una promoción específica
 */
export async function GET(request, { params }) {
  try {
    // Unwrap params Promise (Next.js 15+)
    const { id } = await params;

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('promociones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Promoción no encontrada' },
          { status: 404 }
        );
      }
      console.error('[GET /api/promociones/[id]] Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      promocion: data,
    });

  } catch (error) {
    console.error('[GET /api/promociones/[id]] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/promociones/[id]
 * Actualiza una promoción existente
 */
export async function PUT(request, { params }) {
  try {
    // Unwrap params Promise (Next.js 15+)
    const { id } = await params;
    const body = await request.json();

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('promociones')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/promociones/[id]] Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      promocion: data,
    });

  } catch (error) {
    console.error('[PUT /api/promociones/[id]] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/promociones/[id]
 * Elimina una promoción
 */
export async function DELETE(request, { params }) {
  try {
    // Unwrap params Promise (Next.js 15+)
    const { id } = await params;

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('promociones')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DELETE /api/promociones/[id]] Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promoción eliminada correctamente',
    });

  } catch (error) {
    console.error('[DELETE /api/promociones/[id]] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
