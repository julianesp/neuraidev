import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

    return NextResponse.json({
      success: true,
      data: { 
        admin: {
          id: session.admin_id,
          username: session.username,
          email: session.email,
          role: session.role
        }
      }
    });

  } catch (error) {
    console.error('Error en verificación admin:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}