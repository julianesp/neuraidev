/**
 * Gestor de tokens de ePayco con cache y renovación automática
 *
 * Este módulo mantiene un cache del token Bearer de ePayco y lo renueva
 * automáticamente cuando está cerca de expirar.
 */

// Cache de token en memoria (para serverless, esto se reinicia con cada función)
// En producción avanzada, considera usar Redis o similar
let tokenCache = {
  token: null,
  obtainedAt: null,
  expiresIn: 3600, // 1 hora en segundos (valor por defecto)
};

// Configurar tiempo de vida del token (en segundos)
// Por defecto: 50 minutos para renovar antes de que expire
const TOKEN_LIFETIME_SECONDS = 50 * 60; // 50 minutos

/**
 * Verifica si el token en cache sigue siendo válido
 */
function isTokenValid() {
  if (!tokenCache.token || !tokenCache.obtainedAt) {
    return false;
  }

  const now = Date.now();
  const tokenAge = (now - tokenCache.obtainedAt) / 1000; // en segundos

  // Si el token tiene más de TOKEN_LIFETIME_SECONDS, considerarlo expirado
  return tokenAge < TOKEN_LIFETIME_SECONDS;
}

/**
 * Obtiene un nuevo token de autenticación de ePayco
 */
async function fetchNewToken(publicKey, privateKey) {
  const authString = Buffer.from(`${publicKey}:${privateKey}`).toString(
    "base64",
  );

  const response = await fetch("https://apify.epayco.co/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error de autenticación con ePayco: ${response.status} - ${errorText}`,
    );
  }

  const authData = await response.json();

  if (!authData.token) {
    throw new Error("No se recibió token de autenticación de ePayco");
  }

  return {
    token: authData.token,
    expiresIn: authData.expiresIn || 3600, // 1 hora por defecto
  };
}

/**
 * Obtiene un token válido (desde cache o renovándolo)
 *
 * @param {string} publicKey - Clave pública de ePayco
 * @param {string} privateKey - Clave privada de ePayco
 * @param {boolean} forceRefresh - Forzar renovación del token
 * @returns {Promise<string>} Token Bearer válido
 */
export async function getValidToken(publicKey, privateKey, forceRefresh = false) {
  // IMPORTANTE: Siempre renovar el token para evitar problemas con sesiones múltiples
  // ePayco invalida los tokens después de usarlos en transacciones
  console.warn("[TOKEN] 🔄 Obteniendo nuevo token de ePayco...");

  try {
    const { token, expiresIn } = await fetchNewToken(publicKey, privateKey);

    // Actualizar cache (aunque lo renovaremos en cada uso)
    tokenCache = {
      token,
      obtainedAt: Date.now(),
      expiresIn,
    };

    console.warn(
      `[TOKEN] ✅ Token obtenido exitosamente (válido por ${expiresIn}s)`,
    );

    return token;
  } catch (error) {
    console.error("[TOKEN] ❌ Error al obtener token:", error.message);
    throw error;
  }
}

/**
 * Invalida manualmente el token en cache
 * Útil para testing o cuando sabemos que el token no es válido
 */
export function invalidateToken() {
  console.warn("[TOKEN] 🗑️ Token invalidado manualmente");
  tokenCache = {
    token: null,
    obtainedAt: null,
    expiresIn: 3600,
  };
}

/**
 * Obtiene información sobre el estado del token en cache
 * Útil para debugging
 */
export function getTokenInfo() {
  if (!tokenCache.token) {
    return { cached: false, age: 0, valid: false };
  }

  const age = (Date.now() - tokenCache.obtainedAt) / 1000; // en segundos
  const valid = isTokenValid();

  return {
    cached: true,
    age: Math.round(age),
    expiresIn: tokenCache.expiresIn,
    valid,
    remainingSeconds: Math.round(TOKEN_LIFETIME_SECONDS - age),
  };
}
