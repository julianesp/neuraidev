// app/api/productos/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Función para cargar productos desde archivo JSON local
async function loadProductsFromJSON() {
  try {
    // Ruta al archivo JSON (ajusta según la ubicación real de tu archivo)
    const filePath = path.join(process.cwd(), "data", "productos.json");

    // Leer el archivo de forma asíncrona
    const fileData = await fs.promises.readFile(filePath, "utf8");

    // Parsear el contenido JSON
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error al cargar el archivo JSON:", error);
    throw new Error("No se pudo cargar la información de productos");
  }
}

export async function GET(request) {
  try {
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Cargar datos desde el archivo JSON
    const allProducts = await loadProductsFromJSON();

    // Si se solicitó un ID específico, filtrar ese producto
    if (id) {
      const producto = allProducts.find((p) => p.id === id);
      if (producto) {
        return NextResponse.json(producto);
      }
      return NextResponse.json(
        { error: `Producto con ID ${id} no encontrado` },
        { status: 404 },
      );
    }

    // De lo contrario, devolver todos los productos
    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("Error en API de productos:", error);
    return NextResponse.json(
      { error: "Error al cargar productos", message: error.message },
      { status: 500 },
    );
  }
}
