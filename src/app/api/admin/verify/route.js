import { NextResponse } from "next/server";
import crypto from "crypto";

function verifyToken(token) {
  try {
    const secret = process.env.ADMIN_SECRET || "neuraidev-secret-key-2024";
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [username, timestamp, hash] = decoded.split(":");
    
    // Verificar que el token no sea muy antiguo (24 horas)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    if (tokenAge > maxAge) {
      return { valid: false, error: "Token expirado" };
    }
    
    // Verificar el hash
    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(`${username}:${timestamp}`)
      .digest("hex");
    
    if (hash === expectedHash) {
      return { valid: true, username };
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
    
    const verification = verifyToken(token);
    
    if (verification.valid) {
      return NextResponse.json({
        valid: true,
        user: {
          username: verification.username,
          role: "admin"
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