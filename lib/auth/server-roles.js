import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Obtiene la lista de emails de administradores desde variables de entorno
 * @returns {string[]} Lista de emails de administradores
 */
function getAdminEmails() {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
  return adminEmailsEnv
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * Verifica si un usuario es administrador (SERVER-SIDE)
 * Esta función SOLO debe usarse en el servidor (middleware, API routes, server components)
 * @param {Object} user - Usuario de Clerk
 * @returns {boolean}
 */
export function isAdminServer(user) {
  if (!user) return false;

  const adminEmails = getAdminEmails();

  // Verificar por email
  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress;

  if (email && adminEmails.includes(email.toLowerCase())) {
    return true;
  }

  // Verificar por metadata público (se puede configurar en Clerk Dashboard)
  if (user.publicMetadata?.role === "admin") {
    return true;
  }

  return false;
}

/**
 * Obtiene el usuario actual y verifica si es admin
 * Para usar en Server Components y API Routes
 * @returns {Promise<{user: Object|null, isAdmin: boolean}>}
 */
export async function getCurrentUserWithRole() {
  try {
    const user = await currentUser();

    if (!user) {
      return { user: null, isAdmin: false };
    }

    const isAdmin = isAdminServer(user);

    return { user, isAdmin };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, isAdmin: false };
  }
}

/**
 * Verifica si el usuario actual es admin usando auth() de Clerk
 * Para usar en middleware
 * @returns {Promise<boolean>}
 */
export async function checkIsAdmin() {
  try {
    const user = await currentUser();
    return user ? isAdminServer(user) : false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Middleware helper para proteger rutas de administración
 * Retorna un objeto con información de autenticación y autorización
 * @returns {Promise<{isAuthenticated: boolean, isAdmin: boolean, user: Object|null}>}
 */
export async function getAuthInfo() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { isAuthenticated: false, isAdmin: false, user: null };
    }

    const user = await currentUser();
    const isAdmin = user ? isAdminServer(user) : false;

    return {
      isAuthenticated: true,
      isAdmin,
      user,
    };
  } catch (error) {
    console.error("Error getting auth info:", error);
    return { isAuthenticated: false, isAdmin: false, user: null };
  }
}
