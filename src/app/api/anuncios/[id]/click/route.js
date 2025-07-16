// app/api/anuncios/[id]/click/route.js
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

// POST - Registrar click en anuncio
export async function POST(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "ID de anuncio inválido" },
        { status: 400 },
      );
    }

    // Verificar que el anuncio existe y está activo
    const existsQuery =
      "SELECT id FROM anuncios WHERE id = $1 AND active = true";
    const existsResult = await pool.query(existsQuery, [id]);

    if (existsResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Anuncio no encontrado o inactivo" },
        { status: 404 },
      );
    }

    // Incrementar contador de clicks
    await pool.query("SELECT increment_anuncio_click($1)", [id]);

    return NextResponse.json({
      message: "Click registrado exitosamente",
    });
  } catch (error) {
    console.error("Error registering click:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
