import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/db';

async function obtenerProductosDestacados(limit = 10) {
  const db = getSupabaseServerClient();
  const { data } = await db.from('products').select('*').eq('destacado', true).eq('disponible', true).order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const productos = await obtenerProductosDestacados(10);
    // Parsear imagenes si viene como string JSON
    const normalized = productos.map((p) => {
      let imagenes = p.imagenes;
      if (typeof imagenes === 'string') {
        try { imagenes = JSON.parse(imagenes); } catch { imagenes = []; }
      }
      return { ...p, imagenes: imagenes || [] };
    });
    return NextResponse.json(normalized);
  } catch (e) {
    console.error('[destacados]', e);
    return NextResponse.json([], { status: 500 });
  }
}
