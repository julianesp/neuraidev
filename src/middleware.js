import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Solo proteger rutas del dashboard
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Rutas públicas que NO deben pasar por Clerk (APIs de pago)
const isPublicApiRoute = createRouteMatcher([
  "/api/payments/(.*)",
  "/api/webhooks/(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Las rutas de pago son completamente públicas - no tocar
  if (isPublicApiRoute(request)) {
    return NextResponse.next();
  }

  // Solo proteger dashboard, todo lo demás es público
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
