import { NextResponse } from 'next/server';
import { d1Select } from '@/lib/db-d1';

export const dynamic = 'force-dynamic';

// GET /api/trabajos  (público)
// Devuelve los trabajos del servicio técnico con sus fotos, ordenados.
// Reemplaza el array hardcodeado de la página /servicios/tecnico-sistemas.
export async function GET() {
  try {
    const trabajos = await d1Select(
      `SELECT id, titulo, descripcion, orden
       FROM trabajos_tecnico
       ORDER BY orden ASC, created_at ASC`
    );

    if (trabajos.length === 0) {
      return NextResponse.json({ trabajos: [] });
    }

    const fotos = await d1Select(
      `SELECT id, trabajo_id, url, orden
       FROM trabajos_fotos
       ORDER BY orden ASC, created_at ASC`
    );

    const fotosPorTrabajo = {};
    for (const f of fotos) {
      if (!fotosPorTrabajo[f.trabajo_id]) fotosPorTrabajo[f.trabajo_id] = [];
      fotosPorTrabajo[f.trabajo_id].push(f.url);
    }

    const resultado = trabajos
      .map((t) => ({
        id: t.id,
        titulo: t.titulo,
        descripcion: t.descripcion,
        fotos: fotosPorTrabajo[t.id] || [],
      }))
      // No mostrar casos sin fotos en la página pública.
      .filter((t) => t.fotos.length > 0);

    return NextResponse.json({ trabajos: resultado });
  } catch (error) {
    console.error('Error en GET /api/trabajos:', error);
    return NextResponse.json({ trabajos: [] });
  }
}
