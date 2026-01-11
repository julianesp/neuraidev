import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { registrarPago } from '@/lib/supabase/creditos';

// POST - Registrar un pago
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
    if (!body.credito_id || !body.monto_pago) {
      return NextResponse.json(
        { error: 'credito_id y monto_pago son requeridos' },
        { status: 400 }
      );
    }

    // Agregar el ID del usuario que registra el pago
    const pagoData = {
      ...body,
      created_by: userId,
    };

    const pago = await registrarPago(body.credito_id, pagoData);

    return NextResponse.json({ pago }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/creditos/pagos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al registrar pago' },
      { status: 500 }
    );
  }
}
