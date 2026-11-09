import { NextResponse } from 'next/server';
import { d1Select } from '@/lib/db';
import { conPreciosVigentes } from '@/lib/ofertas-server';

async function obtenerProductosRecientes(limit = 10) {
  // Los más recientes por created_at. Los productos viejos sin created_at
  // (migrados sin fecha) van al final: si se tomaban como "muy recientes"
  // ocupaban todo el LIMIT y los que se agregan ahora (con fecha) no salían.
  const sql = `
    SELECT * FROM products
    WHERE disponible = 1 AND COALESCE(categoria, '') != 'servicios'
    ORDER BY created_at IS NULL, created_at DESC, rowid DESC
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
    return NextResponse.json(await conPreciosVigentes(normalized));
  } catch (e) {
    console.error('[nuevos]', e);
    return NextResponse.json([], { status: 500 });
  }
}
