import { NextResponse } from "next/server";
import { ProductModel } from "../../../models/ProductModel.js";
import { initializeDatabase } from "../../../lib/db.js";

// Inicializar la base de datos al cargar el módulo
initializeDatabase().catch(console.error);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");

    let productos;
    if (categoria) {
      productos = await ProductModel.findByCategory(categoria);
    } else {
      productos = await ProductModel.findAll();
    }

    return NextResponse.json(productos);
  } catch (error) {
    console.error("Error en GET /api/productos:", error);
    return NextResponse.json(
      { error: "Error al cargar productos", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    const { nombre, precio, categoria } = body;
    if (!nombre || !precio || !categoria) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: nombre, precio, categoria" },
        { status: 400 }
      );
    }

    const nuevoProducto = await ProductModel.create(body);
    
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/productos:", error);
    return NextResponse.json(
      { error: "Error al crear producto", message: error.message },
      { status: 500 }
    );
  }
}
