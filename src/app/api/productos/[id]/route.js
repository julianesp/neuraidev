// src/app/api/productos/[id]/route.js
import { readFileSync } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const filePath = path.join(
      process.cwd(),
      "/public",
      "accesoriosDestacados.json",
    );
    const fileContents = readFileSync(filePath, "utf8");
    const productos = JSON.parse(fileContents);

    const producto = productos.find((p) => p.id === id);

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error(`Error al cargar producto ${params.id}:`, error);
    return NextResponse.json(
      { error: "Error cargando producto" },
      { status: 500 },
    );
  }
}
