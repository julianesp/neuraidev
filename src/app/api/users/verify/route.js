import { NextResponse } from "next/server";
import crypto from "crypto";

function verifyUserToken(token) {
  try {
    const secret = process.env.USER_SECRET || "neuraidev-user-secret-2024";
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, username, timestamp, hash] = decoded.split(":");
    
    // Verificar que el token no sea muy antiguo (30 días)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
    
    if (tokenAge > maxAge) {
      return { valid: false, error: "Token expirado" };
    }
    
    // Verificar el hash
    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(`${userId}:${username}:${timestamp}`)
      .digest("hex");
    
    if (hash === expectedHash) {
      return { valid: true, userId: parseInt(userId), username };
    } else {
      return { valid: false, error: "Token inválido" };
    }
  } catch (error) {
    return { valid: false, error: "Token malformado" };
  }
}

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token requerido" },
        { status: 401 }
      );
    }
    
    const verification = verifyUserToken(token);
    
    if (verification.valid) {
      return NextResponse.json({
        valid: true,
        user: {
          id: verification.userId,
          username: verification.username
        }
      });
    } else {
      return NextResponse.json(
        { valid: false, error: verification.error },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error verificando token:", error);
    return NextResponse.json(
      { valid: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}