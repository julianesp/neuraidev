import {
  validateData,
  schemas,
  sanitizeObject,
} from "../../../../utils/validation.js";
import {
  verifyPassword,
  generateToken,
  checkRateLimit,
} from "../../../../utils/auth.js";
import { query } from "../../../../lib/db.js";

export async function POST(request) {
  try {
    // Rate limiting más estricto para login
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimit = checkRateLimit(`login:${clientIp}`, 5, 15 * 60 * 1000); // 5 intentos por 15 min

    if (!rateLimit.allowed) {
      return Response.json(
        {
          error: "Demasiados intentos de login. Intenta de nuevo más tarde.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { status: 429 },
      );
    }

    // Obtener y validar datos del request
    const rawData = await request.json();
    const sanitizedData = sanitizeObject(rawData);

    // Validar datos de entrada
    const validation = validateData(sanitizedData, schemas.user.login);

    if (!validation.isValid) {
      return Response.json(
        {
          error: "Datos de entrada inválidos",
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;

    // Buscar usuario por email
    const userQuery = `
      SELECT id, username, email, password_hash, full_name, active, created_at
      FROM users 
      WHERE email = $1
    `;

    const userResult = await query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      // Mensaje genérico para evitar enumeración de usuarios
      return Response.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    const user = userResult.rows[0];

    // Verificar si el usuario está activo
    if (!user.active) {
      return Response.json(
        { error: "Cuenta desactivada. Contacta al soporte." },
        { status: 403 },
      );
    }

    // Verificar contraseña
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return Response.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    // Actualizar última conexión
    const updateLastLoginQuery = `
      UPDATE users 
      SET last_login = NOW(), updated_at = NOW()
      WHERE id = $1
    `;
    await query(updateLastLoginQuery, [user.id]);

    // Generar token JWT
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    // Registrar login exitoso en logs (opcional)
    console.warn(
      `Login exitoso - Usuario: ${user.username}, IP: ${clientIp}, Time: ${new Date().toISOString()}`,
    );

    // Respuesta exitosa
    return Response.json(
      {
        success: true,
        message: "Login exitoso",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          createdAt: user.created_at,
        },
        token,
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": `authToken=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`,
        },
      },
    );
  } catch (error) {
    console.error("Error en login:", error);

    // No exponer detalles del error en producción
    const isDevelopment = process.env.NODE_ENV === "development";

    return Response.json(
      {
        error: "Error interno del servidor",
        ...(isDevelopment && { details: error.message }),
      },
      { status: 500 },
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.NEXTAUTH_URL || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
