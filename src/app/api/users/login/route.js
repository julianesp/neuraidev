import { NextResponse } from "next/server";
import { query } from "../../../../lib/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generateUserToken(userId, username) {
  const timestamp = Date.now();
  const data = `${userId}:${username}:${timestamp}`;
  const secret = process.env.USER_SECRET || "neuraidev-user-secret-2024";
  
  const hash = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");
  
  return Buffer.from(`${data}:${hash}`).toString("base64");
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const result = await query(
      'SELECT id, username, email, password_hash, full_name, active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verificar si el usuario está activo
    if (!user.active) {
      return NextResponse.json(
        { error: "Cuenta desactivada" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Generar token
    const token = generateUserToken(user.id, user.username);

    return NextResponse.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}