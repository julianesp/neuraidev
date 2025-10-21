import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { checkIsAdmin } from "./src/lib/auth/server-roles";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/accesorios(.*)",
  "/producto(.*)",
  "/servicios(.*)",
  "/tiendas(.*)",
  "/Blog(.*)",
  "/api/productos(.*)",
  "/api/categorias(.*)",
  "/politicas(.*)",
  "/terminos-condiciones(.*)",
  "/sobre-nosotros(.*)",
  "/preguntas-frecuentes(.*)",
  "/politica-devoluciones(.*)",
  "/clientes(.*)",
  "/politica-privacidad(.*)",
  "/politica-cookies(.*)",
  "/blog(.*)",
]);

// Rutas que requieren rol de administrador
const isAdminRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Proteger rutas no públicas (requieren autenticación)
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Verificar rutas de administrador (requieren rol de admin)
  if (isAdminRoute(request)) {
    // Primero verificar que esté autenticado
    await auth.protect();

    // Luego verificar que sea admin
    const isAdmin = await checkIsAdmin();

    if (!isAdmin) {
      // Redirigir a página principal con mensaje de error
      const url = new URL("/", request.url);
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
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
