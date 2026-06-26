import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/db';

/**
 * GET /api/catalogo - Catálogo público de productos (sin autenticación)
 *
 * Misma fuente de datos que el storefront web: tabla `products` en Cloudflare D1.
 * Pensado para ser consumido por el sitio web y la app móvil (neuraidev-mobile).
 *
 * Query params opcionales:
 *   - categoria: filtra por categoría (ej. ?categoria=celulares)
 *
 * Devuelve solo productos disponibles, con `imagenes` ya parseado a array.
 */
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');

    const db = getSupabaseServerClient();

    let query = db
      .from('products')
      .select('*')
      .eq('disponible', true)
      .order('created_at', { ascending: false });

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [API catalogo] Error:', error);
      return NextResponse.json({ productos: [], total: 0 }, { status: 500 });
    }

    // Normalizar: `imagenes` se guarda como string JSON en D1.
    const productos = (data || []).map((p) => {
      let imagenes = p.imagenes;
      if (typeof imagenes === 'string') {
        try {
          imagenes = JSON.parse(imagenes);
        } catch {
          imagenes = [];
        }
      }
      return {
        ...p,
        imagenes: imagenes || [],
        // Alias para que coincida con la forma de los JSON antiguos del storefront
        imagenPrincipal: p.imagen_principal || imagenes?.[0]?.url || null,
      };
    });

    return NextResponse.json({ productos, total: productos.length });
  } catch (error) {
    console.error('❌ [API catalogo] Error inesperado:', error);
    return NextResponse.json({ productos: [], total: 0 }, { status: 500 });
  }
}
