import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.ts';
import { getOrCreateUserSession } from '../../../../lib/auth-guest';

// PUT - Actualizar cantidad de un item del carrito
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { cantidad } = await request.json();

    if (!cantidad || cantidad < 1) {
      return NextResponse.json({
        success: false,
        error: 'Cantidad debe ser mayor a 0',
      }, { status: 400 });
    }

    const session = await getOrCreateUserSession(request);

    // Verificar que el item pertenece al usuario/sesión
    const whereClause = {
      id,
      ...(session.usuarioId
        ? { usuarioId: session.usuarioId }
        : { sesionId: session.id }
      ),
    };

    const carritoItem = await prisma.carritoItem.findFirst({
      where: whereClause,
      include: {
        producto: true,
      },
    });

    if (!carritoItem) {
      return NextResponse.json({
        success: false,
        error: 'Item no encontrado en el carrito',
      }, { status: 404 });
    }

    // Verificar stock disponible
    if (cantidad > carritoItem.producto.stock) {
      return NextResponse.json({
        success: false,
        error: `Stock insuficiente. Solo hay ${carritoItem.producto.stock} unidades disponibles`,
      }, { status: 400 });
    }

    // Actualizar cantidad
    const updatedItem = await prisma.carritoItem.update({
      where: { id },
      data: {
        cantidad,
        updatedAt: new Date(),
      },
      include: {
        producto: {
          include: {
            imagenes: {
              orderBy: { orden: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cantidad actualizada',
      carritoItem: updatedItem,
    });
  } catch (error) {
    console.error('Error actualizando item del carrito:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 });
  }
}

// DELETE - Eliminar item del carrito
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const session = await getOrCreateUserSession(request);

    // Verificar que el item pertenece al usuario/sesión
    const whereClause = {
      id,
      ...(session.usuarioId
        ? { usuarioId: session.usuarioId }
        : { sesionId: session.id }
      ),
    };

    const carritoItem = await prisma.carritoItem.findFirst({
      where: whereClause,
    });

    if (!carritoItem) {
      return NextResponse.json({
        success: false,
        error: 'Item no encontrado en el carrito',
      }, { status: 404 });
    }

    // Eliminar item
    await prisma.carritoItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado del carrito',
    });
  } catch (error) {
    console.error('Error eliminando item del carrito:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 });
  }
}