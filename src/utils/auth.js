import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createHash, createHmac, randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!JWT_SECRET || !ENCRYPTION_KEY) {
  throw new Error('Missing required environment variables: JWT_SECRET, ENCRYPTION_KEY');
}

// Configuración de JWT
const JWT_CONFIG = {
  expiresIn: '24h', // Tokens expiran en 24 horas
  issuer: 'neuraidev',
  audience: 'neuraidev-users'
};

// Configuración de bcrypt
const BCRYPT_ROUNDS = 12; // Aumentado para mayor seguridad

/**
 * Hashea una contraseña usando bcrypt
 */
export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Error al hashear la contraseña');
  }
}

/**
 * Verifica una contraseña contra su hash
 */
export async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error al verificar la contraseña');
  }
}

/**
 * Genera un token JWT seguro
 */
export function generateToken(payload) {
  try {
    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      jti: randomBytes(16).toString('hex') // Unique token ID
    };

    return jwt.sign(tokenPayload, JWT_SECRET, JWT_CONFIG);
  } catch (error) {
    throw new Error('Error al generar el token');
  }
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      maxAge: JWT_CONFIG.expiresIn
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    } else {
      throw new Error('Error al verificar el token');
    }
  }
}

/**
 * Middleware de autenticación para API routes
 */
export function authMiddleware(handler) {
  return async (request, ...args) => {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return Response.json(
          { error: 'Token de autorización requerido' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      // Agregar información del usuario al request
      request.user = decoded;
      
      return handler(request, ...args);
    } catch (error) {
      return Response.json(
        { error: error.message || 'No autorizado' },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware de autenticación para admin
 */
export function adminAuthMiddleware(handler) {
  return async (request, ...args) => {
    try {
      const adminSecret = request.headers.get('x-admin-secret');
      
      if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
        return Response.json(
          { error: 'Acceso de administrador requerido' },
          { status: 403 }
        );
      }
      
      return handler(request, ...args);
    } catch (error) {
      return Response.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }
  };
}

/**
 * Encripta datos sensibles
 */
export function encryptData(data) {
  try {
    const iv = randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      iv: iv.toString('hex'),
      data: encrypted
    };
  } catch (error) {
    throw new Error('Error al encriptar los datos');
  }
}

/**
 * Desencripta datos sensibles
 */
export function decryptData(encryptedData) {
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error('Error al desencriptar los datos');
  }
}

/**
 * Genera un hash seguro para verificación
 */
export function generateSecureHash(data) {
  return createHmac('sha256', JWT_SECRET)
    .update(JSON.stringify(data))
    .digest('hex');
}

/**
 * Verifica un hash de seguridad
 */
export function verifySecureHash(data, hash) {
  const expectedHash = generateSecureHash(data);
  return createHash('sha256').update(expectedHash).digest('hex') ===
         createHash('sha256').update(hash).digest('hex');
}

/**
 * Rate limiting simple en memoria (para producción usar Redis)
 */
const rateLimitStore = new Map();

export function checkRateLimit(identifier, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = `${identifier}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  
  const record = rateLimitStore.get(key);
  
  if (now > record.resetTime) {
    // Reset window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (record.count >= limit) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: record.resetTime 
    };
  }
  
  record.count++;
  return { 
    allowed: true, 
    remaining: limit - record.count 
  };
}

/**
 * Limpia tokens expirados y datos de rate limiting antiguos
 */
export function cleanupExpiredData() {
  const now = Date.now();
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Limpiar datos expirados cada 15 minutos
setInterval(cleanupExpiredData, 15 * 60 * 1000);

const authModule = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authMiddleware,
  adminAuthMiddleware,
  encryptData,
  decryptData,
  generateSecureHash,
  verifySecureHash,
  checkRateLimit
};

export default authModule;