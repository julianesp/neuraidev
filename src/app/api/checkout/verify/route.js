import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getOrCreateUserSession } from '../../../../lib/auth';

// POST - Verificar disponibilidad y calcular totales
export async function POST(request) {
  try {
    const { metodoEnvio = 'DOMICILIO' } = await request.json();

    const session = await getOrCreateUserSession(request);

    // Obtener items del carrito
    const whereClause = session.usuarioId
      ? { usuarioId: session.usuarioId }
      : { sesionId: session.id };

    const carritoItems = await prisma.carritoItem.findMany({
      where: whereClause,
      include: {
        producto: true,
      },
    });

    if (carritoItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'El carrito está vacío',
      }, { status: 400 });
    }

    // Verificar disponibilidad y stock
    const problemas = [];
    const itemsValidos = [];

    for (const item of carritoItems) {
      if (!item.producto.disponible) {
        problemas.push({
          tipo: 'no_disponible',
          producto: item.producto.nombre,
          mensaje: `"${item.producto.nombre}" ya no está disponible`,
        });
        continue;
      }

      if (item.producto.stock < item.cantidad) {
        problemas.push({
          tipo: 'stock_insuficiente',
          producto: item.producto.nombre,
          stockDisponible: item.producto.stock,
          cantidadSolicitada: item.cantidad,
          mensaje: `Stock insuficiente para "${item.producto.nombre}". Solo hay ${item.producto.stock} unidades disponibles`,
        });
        continue;
      }

      itemsValidos.push(item);
    }

    // Calcular totales con items válidos
    const subtotal = itemsValidos.reduce((sum, item) => {
      const precio = parseFloat(item.producto.precio);
      return sum + (precio * item.cantidad);
    }, 0);

    // Calcular costo de envío
    let costoEnvio = 0;
    let mensajeEnvio = '';

    switch (metodoEnvio) {
      case 'DOMICILIO':
        costoEnvio = subtotal >= 100000 ? 0 : 15000;
        mensajeEnvio = costoEnvio === 0 ? 'Envío gratis por compra mayor a $100,000' : 'Envío a domicilio';
        break;
      case 'MOTOTAXI':
        costoEnvio = 8000;
        mensajeEnvio = 'Envío por mototaxi';
        break;
      case 'RECOGIDA_LOCAL':
        costoEnvio = 0;
        mensajeEnvio = 'Recogida en tienda';
        break;
      default:
        costoEnvio = 15000;
        mensajeEnvio = 'Envío estándar';
    }

    const total = subtotal + costoEnvio;

    return NextResponse.json({
      success: true,
      verificacion: {
        items: itemsValidos.length,
        problemas: problemas.length,
        detalleProblemas: problemas,
        totales: {
          subtotal,
          costoEnvio,
          total,
          mensajeEnvio,
        },
        puedeComprar: problemas.length === 0 && itemsValidos.length > 0,
      },
    });

  } catch (error) {
    console.error('Error verificando checkout:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 });
  }
}