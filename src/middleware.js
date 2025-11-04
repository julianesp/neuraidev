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
  "/api/payments(.*)",
  "/api/productos(.*)",
  "/api/categorias(.*)",
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

  // Proteger mutaciones en API de productos (requieren autenticación en el route handler)
  if (pathname.startsWith('/api/productos') && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
    // Permitir pasar - la autenticación se valida dentro del API route handler
    return;
  }

  // Proteger dashboard (requiere autenticación)
  if (isProtectedRoute(request)) {
    await auth.protect();
    return;
  }

  // Proteger rutas no públicas (requieren autenticación)
  if (!isPublicRoute(request)) {
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
