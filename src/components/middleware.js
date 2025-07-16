// middleware.js - Middleware para CORS y rate limiting
import { NextResponse } from "next/server";

export function middleware(request) {
  // CORS headers
  const response = NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  // Rate limiting simple (en producción usar Redis o similar)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.ip || "unknown";
    // Aquí implementarías rate limiting más sofisticado
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
