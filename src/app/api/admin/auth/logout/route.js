import { NextResponse } from 'next/server';
import { AdminModel } from '../../../../../models/AdminModel.js';

export async function POST(request) {
  try {
    // Obtener token de cookie
    const token = request.cookies.get('admin_session')?.value;

    if (token) {
      // Destruir sesión en base de datos
      await AdminModel.destroySession(token);
    }

    // Crear respuesta eliminando cookie
    const response = NextResponse.json({
      success: true,
      data: { message: 'Sesión cerrada correctamente' }
    });

    // Eliminar cookie
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expira inmediatamente
    });

    return response;

  } catch (error) {
    console.error('Error en logout admin:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}