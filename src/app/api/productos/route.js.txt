// src/app/api/productos/route.js
import { readFileSync } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "accesories.json");
    const fileContents = readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    return NextResponse.json(
      { error: "Error cargando productos" },
      { status: 500 },
    );
  }
}
