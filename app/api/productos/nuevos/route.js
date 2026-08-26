import { NextResponse } from 'next/server';
import { d1Select } from '@/lib/db';

async function obtenerProductosRecientes(limit = 10) {
  // Ordenamos por created_at DESC, pero tratamos NULL como "muy reciente"
  // (COALESCE con una fecha alta) para que los productos que se crearon sin
  // created_at no queden al final del listado e invisibles bajo el LIMIT.
  const sql = `
    SELECT * FROM products
    WHERE disponible = 1
    ORDER BY COALESCE(created_at, '9999-12-31') DESC, rowid DESC
    LIMIT ?
  `;
  try {
    return await d1Select(sql, [limit]);
  } catch (e) {
    console.error('[nuevos] query error', e);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const productos = await obtenerProductosRecientes(10);
    const normalized = productos.map((p) => {
      let imagenes = p.imagenes;
      if (typeof imagenes === 'string') {
        try { imagenes = JSON.parse(imagenes); } catch { imagenes = []; }
      }
      // El componente muestra el badge de fecha desde `fechaIngreso`,
      // pero la tabla D1 usa `created_at`. Mapeamos para que el badge
      // ("Hoy", "Ayer", "Hace N días") refleje la fecha real de alta.
      return { ...p, imagenes: imagenes || [], fechaIngreso: p.fechaIngreso || p.created_at || null };
    });
    return NextResponse.json(normalized);
  } catch (e) {
    console.error('[nuevos]', e);
    return NextResponse.json([], { status: 500 });
  }
}
