import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

/**
 * GET /api/category-images?category=celulares
 * Obtiene las imágenes de productos de una categoría específica
 * Devuelve hasta 6 imágenes para el carrusel
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no especificada' },
        { status: 400 }
      );
    }

    // Obtener cliente de Supabase
    const supabase = getSupabaseClient();

    // Mapeo de IDs de categoría a nombres en la base de datos
    const categoryMap = {
      'celulares': 'celulares',
      'computadoras': 'computadoras',
      'libros-nuevos': 'libros-nuevos',
      'libros-usados': 'libros-usados',
      'belleza': 'belleza',
      'generales': 'generales',
      'destacados': 'destacados',
      'damas': 'damas'
    };

    const dbCategory = categoryMap[category] || category;

    // Consultar productos de la categoría
    let query = supabase
      .from('products')
      .select('imagen_principal, imagenes, nombre')
      .eq('disponible', true)
      .gt('stock', 0);

    // Para destacados, usar el campo destacado
    if (category === 'destacados') {
      query = query.eq('destacado', true);
    } else {
      // Para otras categorías, buscar por nombre de categoría
      query = query.ilike('categoria', `%${dbCategory}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(6); // Limitar a 6 productos para el carrusel

    const { data: products, error } = await query;

    if (error) {
      console.error('[category-images] Error de Supabase:', error);
      return NextResponse.json(
        { error: 'Error al obtener productos' },
        { status: 500 }
      );
    }

    // Extraer las imágenes principales
    const images = [];

    if (products && products.length > 0) {
      products.forEach(product => {
        // Primero intentar con imagen_principal
        if (product.imagen_principal) {
          images.push(product.imagen_principal);
        }
        // Si no hay imagen_principal, intentar con el array de imágenes
        else if (product.imagenes && product.imagenes.length > 0) {
          const firstImage = product.imagenes[0];
          if (typeof firstImage === 'string') {
            images.push(firstImage);
          } else if (firstImage && firstImage.url) {
            images.push(firstImage.url);
          }
        }
      });
    }

    return NextResponse.json({
      category,
      images,
      count: images.length
    });

  } catch (error) {
    console.error('[category-images] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
