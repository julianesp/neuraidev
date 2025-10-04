import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getOrCreateUserSession } from '../../../lib/auth-guest';

// GET - Obtener carrito del usuario/sesión
export async function GET(request) {
  try {
    const session = await getOrCreateUserSession(request);

    const whereClause = session.usuarioId
      ? { usuarioId: session.usuarioId }
      : { sesionId: session.id };

    const carritoItems = await prisma.carritoItem.findMany({
      where: whereClause,
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
      orderBy: { createdAt: 'desc' },
    });

    // Calcular totales
    const subtotal = carritoItems.reduce((sum, item) => {
      const precio = parseFloat(item.producto.precio);
      return sum + (precio * item.cantidad);
    }, 0);

    const response = NextResponse.json({
      success: true,
      carrito: {
        items: carritoItems,
        itemCount: carritoItems.reduce((sum, item) => sum + item.cantidad, 0),
        subtotal: subtotal.toFixed(2),
      },
    });

    // Establecer cookie de sesión si es nueva
    if (!request.headers.get('cookie')?.includes('session=')) {
      response.cookies.set('session', session.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 días
      });
    }

    return response;
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 });
  }
}

// POST - Agregar producto al carrito
export async function POST(request) {
  try {
    const { productoId, cantidad = 1, variantes } = await request.json();

    if (!productoId) {
      return NextResponse.json({
        success: false,
        error: 'ID de producto requerido',
      }, { status: 400 });
    }

    // Verificar que el producto existe y tiene stock
    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      return NextResponse.json({
        success: false,
        error: 'Producto no encontrado',
      }, { status: 404 });
    }

    if (!producto.disponible) {
      return NextResponse.json({
        success: false,
        error: 'Producto no disponible',
      }, { status: 400 });
    }

    if (producto.stock < cantidad) {
      return NextResponse.json({
        success: false,
        error: `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`,
      }, { status: 400 });
    }

    const session = await getOrCreateUserSession(request);

    // Buscar item existente en el carrito
    const whereClause = session.usuarioId
      ? { usuarioId: session.usuarioId, productoId }
      : { sesionId: session.id, productoId };

    const existingItem = await prisma.carritoItem.findFirst({
      where: whereClause,
    });

    let carritoItem;

    if (existingItem) {
      // Actualizar cantidad si ya existe
      carritoItem = await prisma.carritoItem.update({
        where: { id: existingItem.id },
        data: {
          cantidad: existingItem.cantidad + cantidad,
          variantes: variantes || existingItem.variantes,
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
    } else {
      // Crear nuevo item
      const createData = session.usuarioId
        ? { usuarioId: session.usuarioId, productoId, cantidad, variantes }
        : { sesionId: session.id, productoId, cantidad, variantes };

      carritoItem = await prisma.carritoItem.create({
        data: createData,
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
    }

    // Verificar stock después de la actualización
    if (carritoItem.cantidad > producto.stock) {
      await prisma.carritoItem.update({
        where: { id: carritoItem.id },
        data: { cantidad: producto.stock },
      });

      return NextResponse.json({
        success: false,
        error: `Cantidad ajustada a stock disponible (${producto.stock} unidades)`,
        carritoItem: { ...carritoItem, cantidad: producto.stock },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Producto agregado al carrito',
      carritoItem,
    });

    // Establecer cookie de sesión si es nueva
    if (!request.headers.get('cookie')?.includes('session=')) {
      response.cookies.set('session', session.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 });
  }
}