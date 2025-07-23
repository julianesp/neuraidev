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
    const { username, email, password, fullName } = await request.json();

    // Validaciones
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email y password son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "El usuario o email ya existe" },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const result = await query(
      'INSERT INTO users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, full_name, created_at',
      [username, email, passwordHash, fullName || null]
    );

    const newUser = result.rows[0];

    // Generar token
    const token = generateUserToken(newUser.id, newUser.username);

    return NextResponse.json({
      success: true,
      token: token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.full_name,
        createdAt: newUser.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}