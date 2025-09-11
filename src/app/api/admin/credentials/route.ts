// src/app/api/admin/credentials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, updateAdminCredentials } from "../../../../lib/auth";

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const authCheck = requireAdminAuth(request);
    if (!authCheck.allowed) {
      return NextResponse.json(
        { message: authCheck.reason || "Acceso no autorizado" },
        { status: 403 }
      );
    }

    const { currentUsername, currentPassword, newUsername, newPassword } = await request.json();

    // Validar que se proporcionen todos los campos requeridos
    if (!currentUsername || !currentPassword || !newUsername || !newPassword) {
      return NextResponse.json(
        { message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar credenciales actuales antes de actualizar
    const { verifyAdminCredentials } = await import("../../../../lib/auth");
    if (!verifyAdminCredentials(currentUsername, currentPassword)) {
      return NextResponse.json(
        { message: "Las credenciales actuales son incorrectas" },
        { status: 401 }
      );
    }

    // Validar longitud mínima de la nueva contraseña
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Actualizar credenciales
    const success = updateAdminCredentials(newUsername, newPassword);
    
    if (!success) {
      return NextResponse.json(
        { message: "Error al actualizar las credenciales" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Credenciales actualizadas exitosamente. Deberás iniciar sesión nuevamente." 
    });

  } catch (error) {
    console.error("Error actualizando credenciales:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}