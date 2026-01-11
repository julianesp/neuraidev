import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  obtenerCreditos,
  crearCredito,
  actualizarCredito,
  eliminarCredito,
} from '@/lib/supabase/creditos';

// GET - Obtener todos los créditos
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const email_cliente = searchParams.get('email_cliente');
    const vencidos = searchParams.get('vencidos') === 'true';

    const filtros = {};
    if (estado) filtros.estado = estado;
    if (email_cliente) filtros.email_cliente = email_cliente;
    if (vencidos) filtros.vencidos = true;

    const creditos = await obtenerCreditos(filtros);

    return NextResponse.json({ creditos });
  } catch (error) {
    console.error('Error en GET /api/creditos:', error);
    return NextResponse.json(
      { error: 'Error al obtener créditos' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo crédito
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validar campos requeridos
    const camposRequeridos = [
      'nombre_cliente',
      'email_cliente',
      'producto_nombre',
      'producto_precio',
      'cantidad',
      'monto_total',
      'dias_plazo',
    ];

    for (const campo of camposRequeridos) {
      if (!body[campo]) {
        return NextResponse.json(
          { error: `Campo requerido: ${campo}` },
          { status: 400 }
        );
      }
    }

    // Agregar el ID del usuario que crea el crédito
    const creditoData = {
      ...body,
      created_by: userId,
    };

    const credito = await crearCredito(creditoData);

    return NextResponse.json({ credito }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/creditos:', error);
    return NextResponse.json(
      { error: 'Error al crear crédito' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar un crédito
export async function PATCH(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...cambios } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de crédito requerido' },
        { status: 400 }
      );
    }

    const credito = await actualizarCredito(id, cambios);

    return NextResponse.json({ credito });
  } catch (error) {
    console.error('Error en PATCH /api/creditos:', error);
    return NextResponse.json(
      { error: 'Error al actualizar crédito' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un crédito
export async function DELETE(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de crédito requerido' },
        { status: 400 }
      );
    }

    await eliminarCredito(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/creditos:', error);
    return NextResponse.json(
      { error: 'Error al eliminar crédito' },
      { status: 500 }
    );
  }
}
