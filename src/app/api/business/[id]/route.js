import { NextResponse } from "next/server";
import { query } from "../../../../lib/db.js";
import crypto from "crypto";

function verifyUserToken(token) {
  try {
    const secret = process.env.USER_SECRET || "neuraidev-user-secret-2024";
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, username, timestamp, hash] = decoded.split(":");
    
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    
    if (tokenAge > maxAge) {
      return { valid: false, error: "Token expirado" };
    }
    
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

export async function GET(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 401 }
      );
    }

    const verification = verifyUserToken(token);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error },
        { status: 401 }
      );
    }

    const { id } = params;

    // Obtener información del negocio
    const result = await query(
      `SELECT ba.*, c.display_name as category_name 
       FROM business_accounts ba
       LEFT JOIN categorias c ON ba.category_id = c.id
       WHERE ba.id = $1 AND ba.user_id = $2`,
      [id, verification.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("Error obteniendo negocio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}