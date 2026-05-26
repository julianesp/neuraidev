import { NextResponse } from 'next/server';
import { getAuthInfo } from '@/lib/auth/server-roles';
import { getSupabaseServerClient } from '@/lib/db';

async function obtenerTodosLosSlides() {
  const db = getSupabaseServerClient();
  const { data } = await db.from('carousel_slides').select('*').order('orden', { ascending: true });
  return data || [];
}

async function obtenerSlidesActivos() {
  const db = getSupabaseServerClient();
  const { data } = await db.from('carousel_slides').select('*').eq('activo', true).order('orden', { ascending: true });
  return data || [];
}

async function crearSlide(slideData) {
  const db = getSupabaseServerClient();
  const { data } = await db.from('carousel_slides').insert(slideData).select().single();
  return data;
}

async function actualizarSlide(id, cambios) {
  const db = getSupabaseServerClient();
  const { data } = await db.from('carousel_slides').update(cambios).eq('id', id).select().single();
  return data;
}

async function eliminarSlide(id) {
  const db = getSupabaseServerClient();
  await db.from('carousel_slides').delete().eq('id', id);
}

// GET /api/carousel — slides activos (público) o todos (admin con ?all=true)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    if (all) {
      const { isAdmin } = await getAuthInfo();
      if (!isAdmin) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      const slides = await obtenerTodosLosSlides();
      return NextResponse.json({ success: true, slides });
    }

    const slides = await obtenerSlidesActivos();
    return NextResponse.json({ success: true, slides });
  } catch (error) {
    console.error('Error GET /api/carousel:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/carousel — crear slide (admin)
export async function POST(request) {
  try {
    const { isAdmin } = await getAuthInfo();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { titulo, descripcion, imagen_url, link, boton_texto, activo, orden } = body;

    if (!titulo || !imagen_url) {
      return NextResponse.json({ error: 'titulo e imagen_url son requeridos' }, { status: 400 });
    }

    const slide = await crearSlide({ titulo, descripcion, imagen_url, link, boton_texto, activo, orden });
    return NextResponse.json({ success: true, slide }, { status: 201 });
  } catch (error) {
    console.error('Error POST /api/carousel:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH /api/carousel — actualizar slide (admin)
export async function PATCH(request) {
  try {
    const { isAdmin } = await getAuthInfo();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...cambios } = body;

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
    }

    const slide = await actualizarSlide(id, cambios);
    return NextResponse.json({ success: true, slide });
  } catch (error) {
    console.error('Error PATCH /api/carousel:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/carousel?id=xxx — eliminar slide (admin)
export async function DELETE(request) {
  try {
    const { isAdmin } = await getAuthInfo();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
    }

    await eliminarSlide(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error DELETE /api/carousel:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
