import { NextResponse } from 'next/server';
import { obtenerProductosRecientes } from '@/lib/supabase/productos';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const productos = await obtenerProductosRecientes(10);
    const normalized = productos.map((p) => {
      let imagenes = p.imagenes;
      if (typeof imagenes === 'string') {
        try { imagenes = JSON.parse(imagenes); } catch { imagenes = []; }
      }
      return { ...p, imagenes: imagenes || [] };
    });
    return NextResponse.json(normalized);
  } catch (e) {
    console.error('[nuevos]', e);
    return NextResponse.json([], { status: 500 });
  }
}
