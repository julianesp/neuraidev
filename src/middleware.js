import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Solo proteger rutas del dashboard
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Rutas públicas de API que NO deben pasar por Clerk
const isPublicApiRoute = (pathname) => {
  return pathname.startsWith("/api/payments") ||
         pathname.startsWith("/api/webhooks") ||
         pathname.startsWith("/api/test");
};

// Middleware principal que decide si usar Clerk o no
export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Para rutas públicas de API, NO usar Clerk - pasar directamente
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Para todas las demás rutas, usar Clerk
  return clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  })(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
