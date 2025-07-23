import { NextResponse } from "next/server";
import { ProductModel } from "../../../../models/ProductModel.js";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "ID de producto inválido" },
        { status: 400 }
      );
    }

    const producto = await ProductModel.findById(parseInt(id));

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error("Error en GET /api/productos/[id]:", error);
    return NextResponse.json(
      { error: "Error al cargar producto", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "ID de producto inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validar que el producto existe
    const productoExistente = await ProductModel.findById(parseInt(id));
    if (!productoExistente) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const productoActualizado = await ProductModel.update(parseInt(id), body);
    
    return NextResponse.json(productoActualizado);
  } catch (error) {
    console.error("Error en PUT /api/productos/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar producto", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "ID de producto inválido" },
        { status: 400 }
      );
    }

    const productoEliminado = await ProductModel.delete(parseInt(id));

    if (!productoEliminado) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Producto eliminado exitosamente", producto: productoEliminado },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en DELETE /api/productos/[id]:", error);
    return NextResponse.json(
      { error: "Error al eliminar producto", message: error.message },
      { status: 500 }
    );
  }
}
