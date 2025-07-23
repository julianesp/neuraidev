import { NextResponse } from "next/server";
import { query } from "../../../../lib/db.js";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'SELECT * FROM subscription_plans WHERE id = $1 AND active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Plan no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("Error obteniendo plan:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}