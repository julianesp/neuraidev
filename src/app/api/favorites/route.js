import { NextResponse } from "next/server";
import { query } from "../../../lib/db.js";
import crypto from "crypto";

function verifyUserToken(token) {
  try {
    const secret = process.env.USER_SECRET || "neuraidev-user-secret-2024";
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, username, timestamp, hash] = decoded.split(":");
    
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
    
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

// GET - Obtener favoritos del usuario
export async function GET(request) {
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

    // Obtener favoritos con información del producto
    const result = await query(`
      SELECT 
        f.id as favorite_id,
        f.created_at as favorited_at,
        p.*
      FROM user_favorites f
      JOIN productos p ON f.product_id = p.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `, [verification.userId]);

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Agregar producto a favoritos
export async function POST(request) {
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

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "ID del producto requerido" },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const productCheck = await query(
      'SELECT id FROM productos WHERE id = $1',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Agregar a favoritos (o ignorar si ya existe)
    const result = await query(
      'INSERT INTO user_favorites (user_id, product_id) VALUES ($1, $2) ON CONFLICT (user_id, product_id) DO NOTHING RETURNING *',
      [verification.userId, productId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "El producto ya está en favoritos" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Producto agregado a favoritos", favorite: result.rows[0] },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error agregando favorito:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Remover producto de favoritos
export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "ID del producto requerido" },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [verification.userId, productId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Producto no encontrado en favoritos" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Producto removido de favoritos" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error removiendo favorito:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}