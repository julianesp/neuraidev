import { NextResponse } from 'next/server';
import { ProductModel } from '../../../../../models/ProductModel.js';
import { requireAdminAuth } from '../../../../../middleware/adminAuth.js';

// GET - Obtener producto por ID
export async function GET(request, { params }) {
  try {
    // Verificar autenticación admin
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    const product = await ProductModel.findById(parseInt(id));
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(request, { params }) {
  try {
    // Verificar autenticación admin
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    const productData = await request.json();

    // Validar si el producto existe
    const existingProduct = await ProductModel.findById(parseInt(id));
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Validar precio si se proporciona
    if (productData.precio !== undefined) {
      if (typeof productData.precio !== 'number' || productData.precio < 0) {
        return NextResponse.json(
          { success: false, error: 'El precio debe ser un número positivo' },
          { status: 400 }
        );
      }
    }

    // Actualizar producto con auditoría
    const updatedProduct = await ProductModel.update(
      parseInt(id), 
      productData, 
      authResult.admin.id
    );

    return NextResponse.json({
      success: true,
      data: { product: updatedProduct }
    });

  } catch (error) {
    console.error('Error actualizando producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(request, { params }) {
  try {
    // Verificar autenticación admin
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    // Verificar si el producto existe
    const existingProduct = await ProductModel.findById(parseInt(id));
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar producto con auditoría
    const deletedProduct = await ProductModel.delete(parseInt(id), authResult.admin.id);

    return NextResponse.json({
      success: true,
      data: { 
        message: 'Producto eliminado correctamente',
        product: deletedProduct 
      }
    });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}