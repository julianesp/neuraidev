// src/app/api/admin/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getClientIP, isLocalIP, verifyAdminToken } from "../../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Verificar que la IP sea local
    if (!isLocalIP(clientIP)) {
      return NextResponse.json(
        { authorized: false, reason: "IP no autorizada" },
        { status: 403 }
      );
    }
    
    // Verificar token
    const token = request.cookies.get("neuraidev-admin-token")?.value;
    
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json(
        { authorized: false, reason: "Token inválido" },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      authorized: true,
      message: "Acceso autorizado"
    });
    
  } catch (error) {
    console.error("Error en verificación:", error);
    return NextResponse.json(
      { authorized: false, reason: "Error interno" },
      { status: 500 }
    );
  }
}