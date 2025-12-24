import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id requerido' },
        { status: 400 }
      );
    }

    // Eliminar sesión de la base de datos
    const { error } = await supabase
      .from('radio_listeners')
      .delete()
      .eq('session_id', session_id);

    if (error) {
      console.error('Error eliminando sesión:', error);
      return NextResponse.json(
        { error: 'Error al eliminar sesión' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en remove-listener:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
