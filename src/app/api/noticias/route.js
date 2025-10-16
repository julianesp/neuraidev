import { NextResponse } from "next/server";
import { getPool, initNoticiasTable } from "@/lib/db";

// GET - Obtener todas las noticias
export async function GET(request) {
  try {
    const pool = getPool();

    // Asegurar que la tabla existe
    await initNoticiasTable();

    const result = await pool.query(
      "SELECT * FROM noticias ORDER BY fecha DESC, created_at DESC"
    );

    return NextResponse.json({
      success: true,
      noticias: result.rows,
    });
  } catch (error) {
    console.error("Error obteniendo noticias:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener noticias" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva noticia
export async function POST(request) {
  try {
    const pool = getPool();
    const data = await request.json();

    const { titulo, descripcion, contenido, imagen, fecha, municipio, categoria, autor } = data;

    // Validar campos requeridos
    if (!titulo || !descripcion || !imagen || !fecha || !municipio || !categoria) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Asegurar que la tabla existe
    await initNoticiasTable();

    const result = await pool.query(
      `INSERT INTO noticias (titulo, descripcion, contenido, imagen, fecha, municipio, categoria, autor)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [titulo, descripcion, contenido || "", imagen, fecha, municipio, categoria, autor || ""]
    );

    return NextResponse.json({
      success: true,
      noticia: result.rows[0],
    });
  } catch (error) {
    console.error("Error creando noticia:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear noticia" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar noticia
export async function PUT(request) {
  try {
    const pool = getPool();
    const data = await request.json();

    const { id, titulo, descripcion, contenido, imagen, fecha, municipio, categoria, autor } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de noticia requerido" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE noticias
       SET titulo = $1, descripcion = $2, contenido = $3, imagen = $4,
           fecha = $5, municipio = $6, categoria = $7, autor = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [titulo, descripcion, contenido || "", imagen, fecha, municipio, categoria, autor || "", id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Noticia no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      noticia: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando noticia:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar noticia" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar noticia
export async function DELETE(request) {
  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de noticia requerido" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "DELETE FROM noticias WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Noticia no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Noticia eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando noticia:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar noticia" },
      { status: 500 }
    );
  }
}
