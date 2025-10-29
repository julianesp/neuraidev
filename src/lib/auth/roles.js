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

  console.log('🔍 [isAdmin] Verificando usuario:', {
    email: user.primaryEmailAddress?.emailAddress,
    adminEmails: ADMIN_EMAILS
  });

  // Verificar por email
  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress;

  const emailLower = email?.toLowerCase();
  const isAdminByEmail = emailLower && ADMIN_EMAILS.includes(emailLower);

  console.log('🔍 [isAdmin] Email comparación:', {
    userEmail: emailLower,
    isInArray: isAdminByEmail
  });

  if (isAdminByEmail) {
    console.log('✅ [isAdmin] Usuario ES admin por email');
    return true;
  }

  // Verificar por metadata público (se puede configurar en Clerk Dashboard)
  if (user.publicMetadata?.role === "admin") {
    console.log('✅ [isAdmin] Usuario ES admin por metadata');
    return true;
  }

  console.warn('⛔ [isAdmin] Usuario NO es admin');
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
