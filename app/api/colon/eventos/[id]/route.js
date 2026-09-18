import { NextResponse } from 'next/server';
import { d1Select, d1SelectOne } from '@/lib/db-d1';

export const dynamic = 'force-dynamic';

// GET /api/colon/eventos/[id]
// Un evento con su galería de fotos, para la página de detalle /colon/evento/[id].
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const evento = await d1SelectOne(
      `SELECT id, titulo, descripcion, portada_url, fecha_evento, created_at
       FROM colon_eventos WHERE id = ?`,
      [id]
    );

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const fotos = await d1Select(
      `SELECT id, url, orden
       FROM colon_evento_fotos
       WHERE evento_id = ?
       ORDER BY orden ASC, created_at ASC`,
      [id]
    );

    return NextResponse.json({ evento: { ...evento, fotos } });
  } catch (error) {
    console.error('Error en GET /api/colon/eventos/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener el evento' },
      { status: 500 }
    );
  }
}
