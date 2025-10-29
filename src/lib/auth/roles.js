/**
 * Sistema de roles y permisos
 * Define quién tiene acceso al dashboard de administración
 */

// Lista de emails de administradores (convertidos a minúsculas)
// IMPORTANTE: Agrega tu email de Clerk aquí
export const ADMIN_EMAILS = [
  "julii1295@gmail.com",
  "admin@neurai.dev",
].map(email => email.toLowerCase());

/**
 * Verifica si un usuario es administrador
 * @param {Object} user - Usuario de Clerk
 * @returns {boolean}
 */
export function isAdmin(user) {
  if (!user) return false;

  // Verificar por email
  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress;

  const emailLower = email?.toLowerCase();

  if (emailLower && ADMIN_EMAILS.includes(emailLower)) {
    return true;
  }

  // Verificar por metadata público (se puede configurar en Clerk Dashboard)
  if (user.publicMetadata?.role === "admin") {
    return true;
  }

  return false;
}

/**
 * Verifica si un usuario tiene permiso para acceder al dashboard
 * @param {Object} user - Usuario de Clerk
 * @returns {boolean}
 */
export function canAccessDashboard(user) {
  return isAdmin(user);
}
