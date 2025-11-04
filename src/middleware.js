import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/accesorios(.*)",
  "/producto(.*)",
  "/servicios(.*)",
  "/tiendas(.*)",
  "/Blog(.*)",
  "/politicas(.*)",
  "/terminos-condiciones(.*)",
  "/sobre-nosotros(.*)",
  "/preguntas-frecuentes(.*)",
  "/politica-devoluciones(.*)",
  "/clientes(.*)",
  "/politica-privacidad(.*)",
  "/politica-cookies(.*)",
  "/blog(.*)",
  "/respuesta-pago(.*)",
  "/pago-epayco(.*)",
]);

// Rutas API públicas (solo GET)
const isPublicApiRoute = createRouteMatcher([
  "/api/productos",
  "/api/categorias(.*)",
]);

// Rutas API públicas para pagos (permiten POST)
const isPublicPaymentRoute = createRouteMatcher([
  "/api/payments/create",
  "/api/payments/confirmation",
]);

// Rutas que requieren autenticación (dashboard completo)
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Permitir rutas de pago (GET y POST)
  if (isPublicPaymentRoute(request)) {
    return; // Permitir acceso público a endpoints de pago
  }

  // Permitir solo GET en rutas API de productos
  if (pathname.startsWith('/api/productos') && method === 'GET') {
    return; // Permitir lectura pública de productos
  }

  // Permitir GET en otras rutas API públicas
  if (isPublicApiRoute(request) && method === 'GET') {
    return;
  }

  // Para PUT/DELETE en /api/productos/*, requiere autenticación pero permitir que pase
  // La verificación de auth se hace en el API route mismo
  if (pathname.startsWith('/api/productos/') && (method === 'PUT' || method === 'DELETE')) {
    // Dejar pasar - la autenticación se valida en el API route
    return;
  }

  // Proteger rutas no públicas (requieren autenticación)
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Proteger dashboard (solo requiere autenticación, no verificamos admin aquí)
  // La verificación de admin se hace en los Server Components individuales
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
