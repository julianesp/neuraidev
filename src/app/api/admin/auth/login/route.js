import { NextResponse } from 'next/server';
import { AdminModel } from '../../../../../models/AdminModel.js';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Validar campos requeridos
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username y password son requeridos' },
        { status: 400 }
      );
    }

    // Buscar admin
    const admin = await AdminModel.findByUsernameOrEmail(username);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await AdminModel.verifyPassword(password, admin.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Crear sesión
    const session = await AdminModel.createSession(admin.id);

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        },
        session_token: session.session_token
      }
    });

    // Establecer cookie httpOnly
    response.cookies.set('admin_session', session.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 horas
    });

    return response;

  } catch (error) {
    console.error('Error en login admin:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}