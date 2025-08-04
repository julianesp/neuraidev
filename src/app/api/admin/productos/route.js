import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ProductModel } from '../../../../models/ProductModel.js';
import { AdminModel } from '../../../../models/AdminModel.js';
import { requireAdminAuth } from '../../../../middleware/adminAuth.js';

// GET - Listar todos los productos con filtros opcionales
export async function GET(request) {
  try {
    // Leer cookie directamente de Next.js
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Validar sesión directamente
    const session = await AdminModel.validateSession(sessionToken);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parámetros de consulta
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const categoria = searchParams.get('categoria');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Por ahora retornar lista vacía mientras arreglamos ProductModel
    return NextResponse.json({
      success: true,
      data: {
        products: [],
        total: 0,
        page: page,
        limit: limit
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(request) {
  try {
    // Agregar cookies al objeto request
    const cookieStore = await cookies();
    request.cookies = cookieStore;
    
    // Verificar autenticación admin
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const productData = await request.json();

    // Validar campos requeridos
    const requiredFields = ['nombre', 'descripcion', 'precio', 'categoria'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json(
          { success: false, error: `Campo ${field} es requerido` },
          { status: 400 }
        );
      }
    }

    // Validar precio
    if (typeof productData.precio !== 'number' || productData.precio < 0) {
      return NextResponse.json(
        { success: false, error: 'El precio debe ser un número positivo' },
        { status: 400 }
      );
    }

    // Crear producto con auditoría
    const newProduct = await ProductModel.create(productData, authResult.admin.id);

    return NextResponse.json({
      success: true,
      data: { product: newProduct }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}