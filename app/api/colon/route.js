import { NextResponse } from 'next/server';
import { d1Select, d1SelectOne } from '@/lib/db-d1';

export const dynamic = 'force-dynamic';

// GET /api/colon
// Datos públicos de la página de Colón: configuración (banner + foto de perfil)
// y la lista de eventos para el grid.
export async function GET() {
  try {
    const config = await d1SelectOne(
      `SELECT id, banner_url, perfil_url, titulo, descripcion
       FROM colon_config WHERE id = 'colon'`
    );

    const eventos = await d1Select(
      `SELECT id, titulo, descripcion, portada_url, fecha_evento, destacado, orden
       FROM colon_eventos
       ORDER BY orden ASC, created_at DESC`
    );

    return NextResponse.json({
      config: config || { titulo: 'Colón, Putumayo' },
      eventos,
    });
  } catch (error) {
    console.error('Error en GET /api/colon:', error);
    return NextResponse.json(
      { error: 'Error al obtener los datos de Colón' },
      { status: 500 }
    );
  }
}
