import { NextResponse } from "next/server";
import crypto from "crypto";

// Credenciales del administrador (puedes cambiarlas)
const ADMIN_CREDENTIALS = {
  username: "neuraidev",
  password: "NeuraiDev@2024!" // Cambia esta contraseña por una segura
};

// Función para generar un token simple
function generateToken(username) {
  const timestamp = Date.now();
  const data = `${username}:${timestamp}`;
  const secret = process.env.ADMIN_SECRET || "neuraidev-secret-key-2024";
  
  const hash = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");
  
  return Buffer.from(`${data}:${hash}`).toString("base64");
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Verificar credenciales
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const token = generateToken(username);
      
      return NextResponse.json({
        success: true,
        token: token,
        user: {
          username: username,
          role: "admin"
        }
      });
    } else {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}