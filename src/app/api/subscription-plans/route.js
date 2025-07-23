import { NextResponse } from "next/server";
import { query } from "../../../lib/db.js";

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM subscription_plans WHERE active = true ORDER BY price ASC'
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error en GET /api/subscription-plans:", error);
    return NextResponse.json(
      { error: "Error al cargar planes", message: error.message },
      { status: 500 }
    );
  }
}