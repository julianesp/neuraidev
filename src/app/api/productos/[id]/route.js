import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Configuración de runtime para Next.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cliente de Supabase con Service Role (bypass RLS)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * PUT /api/productos/[id] - Actualizar producto
 */
export async function PUT(request, { params }) {
  try {
    // Verificar autenticación con Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validar que el body sea JSON válido
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('❌ [API] Error parseando JSON:', jsonError);
      return NextResponse.json(
        { error: 'Datos inválidos. Debe enviar JSON válido.' },
        { status: 400 }
      );
    }

    // Validar variables de entorno
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ [API] Variables de entorno faltantes');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Crear cliente admin que bypasea RLS
    const supabase = createAdminClient();

    console.log('🔄 [API] Actualizando producto:', id, 'con datos:', body);

    // Actualizar producto
    const { data, error } = await supabase
      .from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [API] Error actualizando:', error);
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      );
    }

    if (!data) {
      console.error('❌ [API] No se encontró el producto con ID:', id);
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ [API] Producto actualizado exitosamente:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [API] Error inesperado:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/productos/[id] - Eliminar producto
 */
export async function DELETE(request, { params }) {
  try {
    // Verificar autenticación con Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Crear cliente admin que bypasea RLS
    const supabase = createAdminClient();

    // Eliminar producto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [API] Error eliminando:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [API] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
