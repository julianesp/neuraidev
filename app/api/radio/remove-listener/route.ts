import { NextRequest, NextResponse } from 'next/server';
import { d1Execute } from '@/lib/db';

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
    await d1Execute('DELETE FROM radio_listeners WHERE session_id = ?', [session_id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en remove-listener:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
