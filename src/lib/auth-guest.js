import { prisma } from './prisma';
import crypto from 'crypto';

// Generar token de sesión seguro
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Crear sesión para usuario invitado
export async function createGuestSession() {
  const sessionToken = generateSessionToken();
  const guestId = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

  const session = await prisma.sesion.create({
    data: {
      sessionToken,
      guestId,
      expires,
    },
  });

  return { sessionToken, guestId, expires };
}

// Crear sesión para usuario registrado
export async function createUserSession(usuarioId) {
  const sessionToken = generateSessionToken();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

  const session = await prisma.sesion.create({
    data: {
      sessionToken,
      usuarioId,
      expires,
    },
  });

  return { sessionToken, expires };
}

// Obtener sesión válida
export async function getValidSession(sessionToken) {
  if (!sessionToken) return null;

  const session = await prisma.sesion.findUnique({
    where: {
      sessionToken,
      expires: {
        gt: new Date(),
      },
    },
    include: {
      usuario: true,
    },
  });

  return session;
}

// Obtener o crear usuario/sesión desde request
export async function getOrCreateUserSession(request) {
  const cookieHeader = request.headers.get('cookie');
  const sessionToken = cookieHeader
    ?.split(';')
    ?.find(c => c.trim().startsWith('session='))
    ?.split('=')[1];

  // Verificar si ya existe una sesión válida
  if (sessionToken) {
    const session = await getValidSession(sessionToken);
    if (session) {
      return session;
    }
  }

  // Crear nueva sesión de invitado
  return await createGuestSession();
}

// Migrar carrito de invitado a usuario registrado
export async function migrateGuestCartToUser(guestSessionToken, usuarioId) {
  const guestSession = await getValidSession(guestSessionToken);
  if (!guestSession) return;

  // Obtener items del carrito de invitado
  const guestCartItems = await prisma.carritoItem.findMany({
    where: { sesionId: guestSession.id },
  });

  // Transferir items al usuario registrado
  for (const item of guestCartItems) {
    await prisma.carritoItem.upsert({
      where: {
        usuarioId: usuarioId,
        productoId: item.productoId,
      },
      update: {
        cantidad: { increment: item.cantidad },
        updatedAt: new Date(),
      },
      create: {
        usuarioId,
        productoId: item.productoId,
        cantidad: item.cantidad,
        variantes: item.variantes,
      },
    });
  }

  // Eliminar items del carrito de invitado
  await prisma.carritoItem.deleteMany({
    where: { sesionId: guestSession.id },
  });

  // Eliminar sesión de invitado
  await prisma.sesion.delete({
    where: { id: guestSession.id },
  });
}

// Limpiar sesiones expiradas (para ejecutar periódicamente)
export async function cleanupExpiredSessions() {
  await prisma.sesion.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });
}