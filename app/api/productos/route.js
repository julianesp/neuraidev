import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

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
 * GET /api/productos - Obtener todos los productos (para admin)
 */
export async function GET(request) {
  try {
    // Verificar autenticación con Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Crear cliente admin que bypasea RLS
    const supabase = createAdminClient();

    // Obtener todos los productos
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [API] Error obteniendo productos:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [API] ${data?.length || 0} productos obtenidos`);

    return NextResponse.json({ productos: data || [] });

  } catch (error) {
    console.error('❌ [API] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/productos - Crear nuevo producto
 */
export async function POST(request) {
  try {
    // Verificar autenticación con Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Crear cliente admin que bypasea RLS
    const supabase = createAdminClient();

    // Insertar producto
    const { data, error } = await supabase
      .from('products')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('❌ [API] Error creando producto:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('❌ [API] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
