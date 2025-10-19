/**
 * Sistema de roles y permisos
 * Define quién tiene acceso al dashboard de administración
 */

// Lista de emails de administradores
// IMPORTANTE: Agrega tu email de Clerk aquí
export const ADMIN_EMAILS = [
  "julii1295@gmail.com", // Reemplaza con tu email de Clerk
  "admin@neurai.dev",
  "contacto@neurai.dev",
];

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
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
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
