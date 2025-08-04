import { AdminModel } from '../models/AdminModel.js';

export async function requireAdminAuth(req) {
  try {
    // Obtener token de las cookies o header
    let token = req.cookies?.admin_session || req.headers?.authorization?.replace('Bearer ', '');
    
    // Para Next.js 13+ - Leer cookies del objeto cookies
    if (!token && req.cookies) {
      const cookieStore = req.cookies;
      if (typeof cookieStore.get === 'function') {
        const adminCookie = cookieStore.get('admin_session');
        token = adminCookie?.value;
      }
    }
    
    // También intentar leer del header Cookie manualmente
    if (!token) {
      const cookieHeader = req.headers?.cookie;
      if (cookieHeader) {
        const match = cookieHeader.match(/admin_session=([^;]+)/);
        token = match ? match[1] : null;
      }
    }
    
    if (!token) {
      return { error: 'Token de acceso requerido', status: 401 };
    }

    // Validar sesión
    const session = await AdminModel.validateSession(token);
    
    if (!session) {
      return { error: 'Sesión inválida o expirada', status: 401 };
    }

    // Retornar datos del admin
    return {
      admin: {
        id: session.admin_id,
        username: session.username,
        email: session.email,
        role: session.role
      }
    };
  } catch (error) {
    console.error('Error en autenticación admin:', error);
    return { error: 'Error interno de autenticación', status: 500 };
  }
}

export function createAuthResponse(success = false, data = null, error = null, status = 200) {
  return {
    success,
    data,
    error,
    status
  };
}