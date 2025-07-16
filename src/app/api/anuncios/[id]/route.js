// app/api/anuncios/[id]/route.js
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

// GET - Obtener anuncio por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "ID de anuncio inválido" },
        { status: 400 },
      );
    }

    const query = `
      SELECT 
        id, business_name, description, image_url, link_url, 
        category, active, featured, contact_phone, contact_email, 
        contact_address, views_count, clicks_count, created_at, updated_at
      FROM anuncios 
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Anuncio no encontrado" },
        { status: 404 },
      );
    }

    // Incrementar contador de vistas
    await pool.query("SELECT increment_anuncio_view($1)", [id]);

    return NextResponse.json({ anuncio: result.rows[0] });
  } catch (error) {
    console.error("Error fetching anuncio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// PUT - Actualizar anuncio
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "ID de anuncio inválido" },
        { status: 400 },
      );
    }

    // Verificar que el anuncio existe
    const existsQuery = "SELECT id FROM anuncios WHERE id = $1";
    const existsResult = await pool.query(existsQuery, [id]);

    if (existsResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Anuncio no encontrado" },
        { status: 404 },
      );
    }

    const query = `
      UPDATE anuncios SET
        business_name = $1,
        description = $2,
        image_url = $3,
        link_url = $4,
        category = $5,
        active = $6,
        featured = $7,
        contact_phone = $8,
        contact_email = $9,
        contact_address = $10
      WHERE id = $11
      RETURNING *
    `;

    const params = [
      body.businessName,
      body.description,
      body.imageUrl || null,
      body.linkUrl || null,
      body.category || "general",
      body.active !== undefined ? body.active : true,
      body.featured || false,
      body.contactInfo?.phone || null,
      body.contactInfo?.email || null,
      body.contactInfo?.address || null,
      id,
    ];

    const result = await pool.query(query, params);

    return NextResponse.json({
      message: "Anuncio actualizado exitosamente",
      anuncio: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating anuncio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// DELETE - Eliminar anuncio
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "ID de anuncio inválido" },
        { status: 400 },
      );
    }

    // Verificar que el anuncio existe
    const existsQuery = "SELECT id FROM anuncios WHERE id = $1";
    const existsResult = await pool.query(existsQuery, [id]);

    if (existsResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Anuncio no encontrado" },
        { status: 404 },
      );
    }

    // Eliminar anuncio (CASCADE eliminará las estadísticas relacionadas)
    await pool.query("DELETE FROM anuncios WHERE id = $1", [id]);

    return NextResponse.json({
      message: "Anuncio eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting anuncio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
