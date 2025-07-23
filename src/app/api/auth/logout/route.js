import { authMiddleware } from '../../../../utils/auth.js';

async function logoutHandler(request) {
  try {
    // El usuario ya está autenticado gracias al middleware
    const user = request.user;

    // Registrar logout en logs
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    console.log(`Logout - Usuario: ${user.username}, IP: ${clientIp}, Time: ${new Date().toISOString()}`);

    // En una implementación más robusta, aquí invalidarías el token en una blacklist
    // o en Redis, pero para esta implementación simplemente limpiamos la cookie

    return Response.json({
      success: true,
      message: 'Logout exitoso'
    }, {
      status: 200,
      headers: {
        // Limpiar la cookie de autenticación
        'Set-Cookie': `authToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`
      }
    });

  } catch (error) {
    console.error('Error en logout:', error);
    
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Aplicar middleware de autenticación
export const POST = authMiddleware(logoutHandler);

// Método OPTIONS para CORS
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}