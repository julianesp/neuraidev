import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Solo proteger rutas del dashboard
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Rutas de pago que deben ser completamente públicas
const isPaymentRoute = (pathname) => {
  return pathname.startsWith("/api/payments") || pathname.startsWith("/api/webhooks");
};

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // Bypass completo para rutas de pago - no pasar por Clerk
  if (isPaymentRoute(pathname)) {
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
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
