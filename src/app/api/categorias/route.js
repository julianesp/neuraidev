// app/api/categorias/route.js
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// GET - Obtener todas las categorías
export async function GET() {
  try {
    const query = `
      SELECT name, display_name, description 
      FROM categorias 
      WHERE active = true 
      ORDER BY display_name
    `;

    const result = await pool.query(query);

    return NextResponse.json({ categorias: result.rows });
  } catch (error) {
    console.error("Error fetching categorias:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
