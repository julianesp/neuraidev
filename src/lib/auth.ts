// src/lib/auth.ts
import { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "neuraidev-admin-secret-2024";

// Función para leer las credenciales del archivo de configuración
function getAdminCredentials(): { username: string; password: string } {
  try {
    const configPath = path.join(process.cwd(), "admin-config.json");
    const configData = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configData);
    return {
      username: config.username || "neuraidev_admin",
      password: config.password || "NeuraiDev2024@Admin"
    };
  } catch (error) {
    // Fallback a credenciales por defecto si hay error leyendo el archivo
    return {
      username: "neuraidev_admin",
      password: "NeuraiDev2024@Admin"
    };
  }
}

// Función para actualizar las credenciales
export function updateAdminCredentials(username: string, password: string): boolean {
  try {
    const configPath = path.join(process.cwd(), "admin-config.json");
    const newConfig = { username, password };
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    return true;
  } catch (error) {
    console.error("Error actualizando credenciales:", error);
    return false;
  }
}

// IPs locales permitidas
const ALLOWED_LOCAL_IPS = [
  "127.0.0.1",
  "::1", // IPv6 localhost
  "localhost",
  "192.168.0.123", // Tu IP local actual
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
  return (request as NextRequest & { ip?: string }).ip || "127.0.0.1";
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
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; username: string; timestamp: number };
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
  
  // 1. Verificar IP local
  if (!isLocalIP(clientIP)) {
    return { 
      allowed: false, 
      reason: `Acceso denegado desde IP: ${clientIP}. Solo se permite acceso local.` 
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