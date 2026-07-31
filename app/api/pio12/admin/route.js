import { d1Select } from '@/lib/db-d1';
import { NextResponse } from 'next/server';
import { getCurrentUserWithRole } from '@/lib/auth/server-roles';

// Total de empleados con número registrado (374 entradas, ~298 únicos)
const TOTAL_EMPLEADOS = 298;

export async function GET(request) {
  // Solo admins
  const { isAdmin } = await getCurrentUserWithRole();
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const formato = searchParams.get('formato'); // ?formato=csv

  try {
    // Empleados que han respondido (únicos por celular)
    const respondidos = await d1Select(
      `SELECT celular, nombre, cargo, bloque, MAX(creado_en) as ultima_respuesta
       FROM pio12_respuestas
       GROUP BY celular`,
      []
    );

    if (formato === 'csv') {
      // Todas las filas para exportar
      const filas = await d1Select(
        `SELECT nombre, cargo, bloque, pregunta, respuesta, creado_en
         FROM pio12_respuestas
         ORDER BY nombre, creado_en`,
        []
      );

      const encabezado = ['Nombre', 'Cargo', 'Área/Bloque', 'Pregunta', 'Respuesta', 'Fecha'].join(',');
      const cuerpo = filas.map(f =>
        [f.nombre, f.cargo, f.bloque, f.pregunta, f.respuesta, f.creado_en]
          .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      );
      const csv = '﻿' + [encabezado, ...cuerpo].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="respuestas_pio12.csv"',
        },
      });
    }

    // Respuesta JSON con estadísticas
    const porcentaje = Math.round((respondidos.length / TOTAL_EMPLEADOS) * 100);

    return NextResponse.json({
      total_empleados: TOTAL_EMPLEADOS,
      han_respondido: respondidos.length,
      porcentaje,
      pendientes: TOTAL_EMPLEADOS - respondidos.length,
      detalle: respondidos,
    });
  } catch (err) {
    console.error('pio12 admin error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
