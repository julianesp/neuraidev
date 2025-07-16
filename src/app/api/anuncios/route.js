// app/api/anuncios/route.js
import { NextResponse } from "next/server";
import { Pool } from "pg";

console.log("DB_PASSWORD:", typeof process.env.DB_PASSWORD, process.env.DB_PASSWORD);
// Configuración de la base de datos
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

// GET - Obtener todos los anuncios
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const active = searchParams.get("active") !== "false"; // Por defecto true
    const limit = parseInt(searchParams.get("limit")) || null;
    const offset = parseInt(searchParams.get("offset")) || 0;
    const search = searchParams.get("search");

    let query = `
      SELECT 
        id, business_name, description, image_url, link_url, 
        category, active, featured, contact_phone, contact_email, 
        contact_address, views_count, clicks_count, created_at, updated_at
      FROM anuncios 
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    // Filtros
    if (active !== null) {
      paramCount++;
      query += ` AND active = $${paramCount}`;
      params.push(active);
    }

    if (category && category !== "all") {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (featured === "true") {
      paramCount++;
      query += ` AND featured = $${paramCount}`;
      params.push(true);
    }

    if (search) {
      paramCount++;
      query += ` AND (business_name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Ordenamiento
    query += ` ORDER BY featured DESC, created_at DESC`;

    // Paginación
    if (limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);
    }

    if (offset > 0) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);
    }

    const result = await pool.query(query, params);

    // Obtener total de registros para paginación
    let countQuery = `SELECT COUNT(*) as total FROM anuncios WHERE 1=1`;
    const countParams = [];
    let countParamCount = 0;

    if (active !== null) {
      countParamCount++;
      countQuery += ` AND active = $${countParamCount}`;
      countParams.push(active);
    }

    if (category && category !== "all") {
      countParamCount++;
      countQuery += ` AND category = $${countParamCount}`;
      countParams.push(category);
    }

    if (featured === "true") {
      countParamCount++;
      countQuery += ` AND featured = $${countParamCount}`;
      countParams.push(true);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (business_name ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      anuncios: result.rows,
      pagination: {
        total,
        limit: limit || total,
        offset,
        hasMore: limit ? offset + limit < total : false,
      },
    });
  } catch (error) {
    console.error("Error fetching anuncios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// POST - Crear nuevo anuncio
export async function POST(request) {
  try {
    const body = await request.json();

    // Validaciones
    if (!body.businessName || !body.description) {
      return NextResponse.json(
        { error: "Nombre del negocio y descripción son requeridos" },
        { status: 400 },
      );
    }

    const query = `
      INSERT INTO anuncios (
        business_name, description, image_url, link_url, category,
        active, featured, contact_phone, contact_email, contact_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
    ];

    const result = await pool.query(query, params);

    return NextResponse.json(
      {
        message: "Anuncio creado exitosamente",
        anuncio: result.rows[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating anuncio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
