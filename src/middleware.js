import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Solo proteger rutas del dashboard
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Solo proteger dashboard, todo lo demás es público
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, y APIs públicas (pagos, webhooks)
    "/((?!_next|api/payments|api/webhooks|api/test|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API routes que SÍ deben pasar por Clerk (excluyendo payments, webhooks, test)
    "/api/((?!payments|webhooks|test).*)",
    "/(trpc)(.*)",
  ],
};
