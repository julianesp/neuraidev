import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ProductModel } from '../../../../../models/ProductModel.js';
import { AdminModel } from '../../../../../models/AdminModel.js';
import { requireAdminAuth } from '../../../../../middleware/adminAuth.js';

export async function GET(request) {
  try {
    // Leer cookie directamente de Next.js
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Validar sesión directamente
    const session = await AdminModel.validateSession(sessionToken);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // Retornar estadísticas básicas
    const stats = {
      products: {
        total_products: 0,
        available_products: 0,
        sold_products: 0,
        average_price: 0,
        categories: []
      },
      recent_activity: [],
      admin_info: {
        username: session.username,
        role: session.role
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}