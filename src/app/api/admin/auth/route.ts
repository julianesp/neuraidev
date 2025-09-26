// src/app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminToken, getClientIP, isLocalIP } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);

    // Solo verificar IP en desarrollo, permitir acceso en producción
    if (process.env.NODE_ENV === 'development' && !isLocalIP(clientIP)) {
      return NextResponse.json(
        { message: "Acceso denegado desde esta ubicación en desarrollo" },
        { status: 403 }
      );
    }
    
    const { username, password } = await request.json();
    
    // Verificar credenciales
    if (!verifyAdminCredentials(username, password)) {
      // Simular delay para prevenir ataques de fuerza bruta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json(
        { message: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }
    
    // Crear token JWT
    const token = createAdminToken();
    
    // Crear respuesta con cookie segura
    const response = NextResponse.json({ 
      success: true, 
      message: "Autenticación exitosa" 
    });
    
    // Configurar cookie con el token
    response.cookies.set("neuraidev-admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 horas
      path: "/",
    });
    
    return response;
    
  } catch (error) {
    console.error("Error en autenticación:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Ruta para logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ 
    success: true, 
    message: "Sesión cerrada" 
  });
  
  // Eliminar cookie del token
  response.cookies.set("neuraidev-admin-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  
  return response;
}