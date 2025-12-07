import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Solo proteger rutas del dashboard
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Rutas de pago que deben ser completamente públicas (bypass completo)
const isPaymentRoute = createRouteMatcher([
  "/api/payments(.*)",
  "/api/webhooks(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  // Bypass completo para rutas de pago - no pasar por Clerk
  if (isPaymentRoute(request)) {
    return NextResponse.next();
  }

  // Proteger rutas del dashboard
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
