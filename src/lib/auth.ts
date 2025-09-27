// src/lib/auth.ts
import { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "neuraidev-admin-secret-2024";

// Función para leer las credenciales de variables de entorno
function getAdminCredentials(): { username: string; password: string; } {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error("ADMIN_USERNAME y ADMIN_PASSWORD deben estar configurados en las variables de entorno");
  }

  return {
    username,
    password
  };
}

// Función para actualizar las credenciales (nota: requiere reinicio del servidor)
export function updateAdminCredentials(username: string, password: string): boolean {
  // NOTA: Para cambiar las credenciales ahora debes actualizar las variables de entorno
  // ADMIN_USERNAME y ADMIN_PASSWORD en tu archivo .env.local y reiniciar el servidor
  console.warn("Para cambiar las credenciales de admin, actualiza ADMIN_USERNAME y ADMIN_PASSWORD en .env.local");
  return false;
}

// IPs locales permitidas
const ALLOWED_LOCAL_IPS = [
  "127.0.0.1",
  "::1", // IPv6 localhost
  "localhost",
  "192.168.0.123", // Tu IP local
  "192.168.0.100", // Tu IP local adicional
  "172.17.0.1",    // Docker bridge IP
];

// Función para verificar si la IP es local/permitida
export function isLocalIP(ip: string): boolean {
  // Verificar IPs específicas permitidas
  if (ALLOWED_LOCAL_IPS.includes(ip)) return true;

  // Verificar rangos de red local
  const localRanges = [
    /^127\./,           // 127.x.x.x (localhost)
    /^192\.168\./,      // 192.168.x.x (red local)
    /^10\./,            // 10.x.x.x (red privada)
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.x.x - 172.31.x.x
    /^::1$/,            // IPv6 localhost
    /^fe80::/,          // IPv6 link-local
  ];

  return localRanges.some(range => range.test(ip));
}

// Función para obtener la IP real del cliente
export function getClientIP(request: NextRequest): string {
  // Verificar varios headers comunes de proxies/load balancers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback: usar IP del socket
  return (request as NextRequest & { ip?: string; }).ip || "127.0.0.1";
}

// Verificar credenciales de admin
export function verifyAdminCredentials(username: string, password: string): boolean {
  const credentials = getAdminCredentials();
  return username === credentials.username && password === credentials.password;
}

// Crear JWT token
export function createAdminToken(): string {
  const credentials = getAdminCredentials();
  return jwt.sign(
    {
      role: "admin",
      username: credentials.username,
      timestamp: Date.now()
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

// Verificar JWT token
export function verifyAdminToken(token: string): boolean {
  try {
    const credentials = getAdminCredentials();
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; username: string; timestamp: number; };
    return decoded.role === "admin" && decoded.username === credentials.username;
  } catch (error) {
    return false;
  }
}

// Verificar si el usuario está autenticado como admin
export function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get("neuraidev-admin-token")?.value;
  return token ? verifyAdminToken(token) : false;
}

// Middleware de autenticación combinado
export function requireAdminAuth(request: NextRequest): {
  allowed: boolean;
  reason?: string;
} {
  const clientIP = getClientIP(request);

  // 1. Verificar IP solo en desarrollo
  if (process.env.NODE_ENV === 'development' && !isLocalIP(clientIP)) {
    return {
      allowed: false,
      reason: `Acceso denegado desde IP: ${clientIP}. Solo se permite acceso local en desarrollo.`
    };
  }

  // 2. Verificar autenticación
  if (!isAuthenticated(request)) {
    return {
      allowed: false,
      reason: "Sesión no válida. Debe iniciar sesión como administrador."
    };
  }

  return { allowed: true };
}