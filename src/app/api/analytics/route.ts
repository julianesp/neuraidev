// Analytics route - Desactivado (requiere base de datos)
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Analytics no disponible - La funcionalidad requiere base de datos" },
    { status: 501 }
  );
}
