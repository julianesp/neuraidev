import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";
import { isAdminServer } from "./server-roles";

/**
 * Autentica una petición de API aceptando DOS métodos:
 *   1. Cookie de sesión Clerk (peticiones del navegador / web).
 *   2. Token Bearer en el header Authorization (apps móviles).
 *
 * Devuelve { userId, user, isAdmin } o { userId: null, ... } si no autenticado.
 *
 * @param {Request} request
 * @returns {Promise<{userId: string|null, user: object|null, isAdmin: boolean}>}
 */
export async function authenticateRequest(request) {
  // --- Método 1: token Bearer (móvil) ---
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    // Evita verificar tokens vacíos/"null"/"undefined" (causaban "Invalid JWT form").
    if (token && token !== "null" && token !== "undefined") {
      try {
        const decoded = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
          // Permite verificación con JWKS de la instancia (resuelve "Unable to
          // find a signing key" en entornos serverless).
          jwtKey: process.env.CLERK_JWT_KEY,
        });
        if (decoded?.sub) {
          const userId = decoded.sub;
          // Cargar el usuario completo para verificar rol/email de admin.
          const client = await clerkClient();
          const user = await client.users.getUser(userId);
          return { userId, user, isAdmin: isAdminServer(user) };
        }
      } catch (err) {
        console.warn("[api-auth] Token Bearer inválido:", err?.message);
      }
    }
  }

  // --- Método 2: cookie de sesión (web) ---
  try {
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      return { userId, user, isAdmin: isAdminServer(user) };
    }
  } catch (err) {
    console.warn("[api-auth] Error en auth() por cookie:", err?.message);
  }

  return { userId: null, user: null, isAdmin: false };
}
