import { NextResponse } from 'next/server';
import { getSupabaseBrowserClient } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// GET /api/clientes - Obtener clientes
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get('busqueda');
    const nivelFidelidad = searchParams.get('nivel'); // bronce, plata, oro, platino
    const limit = parseInt(searchParams.get('limit') || '100');

    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' })
      .order('total_gastado', { ascending: false })
      .limit(limit);

    // Filtro por búsqueda
    if (busqueda) {
      query = query.or(`nombre.ilike.%${busqueda}%,telefono.ilike.%${busqueda}%,identificacion.ilike.%${busqueda}%`);
    }

    // Filtro por nivel de fidelidad
    if (nivelFidelidad) {
      query = query.eq('nivel_fidelidad', nivelFidelidad);
    }

    const { data: clientes, error, count } = await query;

    if (error) {
      console.error('Error obteniendo clientes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      clientes,
      total: count
    });

  } catch (error) {
    console.error('Error en GET /api/clientes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/clientes - Crear nuevo cliente
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      nombre,
      identificacion,
      telefono,
      email,
      direccion,
      notas
    } = body;

    // Validaciones
    if (!nombre) {
      return NextResponse.json({
        error: 'El nombre es requerido'
      }, { status: 400 });
    }

    const supabase = getSupabaseBrowserClient();

    // Verificar si ya existe (por identificación o teléfono)
    if (identificacion || telefono) {
      let existeQuery = supabase.from('clientes').select('id');

      if (identificacion && telefono) {
        existeQuery = existeQuery.or(`identificacion.eq.${identificacion},telefono.eq.${telefono}`);
      } else if (identificacion) {
        existeQuery = existeQuery.eq('identificacion', identificacion);
      } else if (telefono) {
        existeQuery = existeQuery.eq('telefono', telefono);
      }

      const { data: existe } = await existeQuery.single();

      if (existe) {
        return NextResponse.json({
          error: 'Ya existe un cliente con esa identificación o teléfono'
        }, { status: 400 });
      }
    }

    // Crear el cliente
    const { data: cliente, error: errorCliente } = await supabase
      .from('clientes')
      .insert({
        nombre,
        identificacion: identificacion || null,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        notas: notas || null
      })
      .select()
      .single();

    if (errorCliente) {
      console.error('Error creando cliente:', errorCliente);
      return NextResponse.json({
        error: 'Error al crear el cliente: ' + errorCliente.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cliente,
      mensaje: 'Cliente creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/clientes:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
