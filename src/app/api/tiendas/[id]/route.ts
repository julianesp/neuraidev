// Ruta desactivada (requiere base de datos)
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Funcionalidad no disponible - Requiere base de datos" },
    { status: 501 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Funcionalidad no disponible - Requiere base de datos" },
    { status: 501 }
  );
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    { error: "Funcionalidad no disponible - Requiere base de datos" },
    { status: 501 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: "Funcionalidad no disponible - Requiere base de datos" },
    { status: 501 }
  );
}
