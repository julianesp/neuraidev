// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "./src/lib/auth";

// Función simple para verificar IPs locales
function isLocalIP(ip: string): boolean {
  const localRanges = [
    /^127\./,           // 127.x.x.x (localhost)
    /^192\.168\./,      // 192.168.x.x (red local)
    /^10\./,            // 10.x.x.x (red privada)
    /^::1$/,            // IPv6 localhost
  ];
  
  return localRanges.some(range => range.test(ip)) || 
         ip === "localhost" || 
         ip === "127.0.0.1" ||
         ip === "192.168.0.123";
}

// Obtener IP del cliente
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return (request as any).ip || "127.0.0.1";
}

// Verificar si tiene token de admin válido
function hasValidToken(request: NextRequest): boolean {
  const token = request.cookies.get("neuraidev-admin-token")?.value;
  if (!token) return false;
  
  try {
    return verifyAdminToken(token);
  } catch (error) {
    console.log("Error verificando token:", error);
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Solo aplicar middleware a rutas de admin
  if (pathname.startsWith("/admin")) {
    const clientIP = getClientIP(request);
    
    console.log(`Admin access attempt from IP: ${clientIP}`);
    
    // Si no es IP local, devolver 404
    if (!isLocalIP(clientIP)) {
      console.log(`Access denied for IP: ${clientIP}`);
      return new NextResponse(
        `<!DOCTYPE html>
         <html><head><title>404 - Page Not Found</title></head>
         <body style="font-family: system-ui; text-align: center; padding: 50px;">
           <h1>404 - Page Not Found</h1>
           <p>The requested page could not be found.</p>
         </body></html>`,
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }
    
    // Si es la página de login, permitir acceso
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    
    // Verificar token para otras rutas de admin
    if (!hasValidToken(request)) {
      console.log("No valid token, redirecting to login");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};