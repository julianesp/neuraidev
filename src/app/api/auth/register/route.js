import { validateData, schemas, sanitizeObject } from '../../../../utils/validation.js';
import { hashPassword, generateToken, checkRateLimit } from '../../../../utils/auth.js';
import { query } from '../../../../lib/db.js';

export async function POST(request) {
  try {
    // Rate limiting por IP
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const rateLimit = checkRateLimit(`register:${clientIp}`, 3, 15 * 60 * 1000); // 3 intentos por 15 min
    
    if (!rateLimit.allowed) {
      return Response.json(
        { 
          error: 'Demasiados intentos de registro. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    // Obtener y validar datos del request
    const rawData = await request.json();
    const sanitizedData = sanitizeObject(rawData);
    
    // Validar datos de entrada
    const validation = validateData(sanitizedData, schemas.user.register);
    
    if (!validation.isValid) {
      return Response.json(
        { 
          error: 'Datos de entrada inválidos',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    const { username, email, password, fullName } = validation.data;

    // Verificar si el usuario ya existe
    const existingUserQuery = `
      SELECT id FROM users 
      WHERE email = $1 OR username = $2
    `;
    
    const existingUser = await query(existingUserQuery, [email, username]);
    
    if (existingUser.rows.length > 0) {
      return Response.json(
        { error: 'El usuario ya existe con ese email o nombre de usuario' },
        { status: 409 }
      );
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Insertar nuevo usuario
    const insertQuery = `
      INSERT INTO users (username, email, password_hash, full_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, username, email, full_name, created_at
    `;
    
    const result = await query(insertQuery, [
      username,
      email,
      hashedPassword,
      fullName
    ]);

    const newUser = result.rows[0];

    // Generar token JWT
    const token = generateToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email
    });

    // Respuesta exitosa (sin incluir datos sensibles)
    return Response.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.full_name,
        createdAt: newUser.created_at
      },
      token
    }, { 
      status: 201,
      headers: {
        'Set-Cookie': `authToken=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`
      }
    });

  } catch (error) {
    console.error('Error en registro de usuario:', error);
    
    // No exponer detalles del error en producción
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return Response.json(
      {
        error: 'Error interno del servidor',
        ...(isDevelopment && { details: error.message })
      },
      { status: 500 }
    );
  }
}

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