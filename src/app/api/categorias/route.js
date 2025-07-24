import { NextResponse } from "next/server";
import { query } from "../../../lib/db.js";

export async function GET() {
  try {
    const result = await query(
      'SELECT name, display_name FROM categorias WHERE active = true ORDER BY display_name'
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error en GET /api/categorias:", error);
    return NextResponse.json(
      { error: "Error al cargar categorías", message: error.message },
      { status: 500 }
    );
  }
}