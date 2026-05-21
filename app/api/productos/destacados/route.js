import { NextResponse } from 'next/server';
import { obtenerProductosDestacados } from '@/lib/supabase/productos';

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
