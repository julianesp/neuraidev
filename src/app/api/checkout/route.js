import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getOrCreateUserSession } from '../../../lib/auth-guest';

// POST - Crear pedido
export async function POST(request) {
  try {
    const {
      direccionEnvio,
      metodoEnvio = 'DOMICILIO',
      metodoPago,
      notas,
      emailInvitado
    } = await request.json();

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

    // Verificar stock de todos los productos
    for (const item of carritoItems) {
      if (!item.producto.disponible) {
        return NextResponse.json({
          success: false,
          error: `El producto "${item.producto.nombre}" ya no está disponible`,
        }, { status: 400 });
      }

      if (item.producto.stock < item.cantidad) {
        return NextResponse.json({
          success: false,
          error: `Stock insuficiente para "${item.producto.nombre}". Solo hay ${item.producto.stock} unidades disponibles`,
        }, { status: 400 });
      }
    }

    // Calcular totales
    const subtotal = carritoItems.reduce((sum, item) => {
      const precio = parseFloat(item.producto.precio);
      return sum + (precio * item.cantidad);
    }, 0);

    // Calcular costo de envío
    let costoEnvio = 0;
    switch (metodoEnvio) {
      case 'DOMICILIO':
        costoEnvio = subtotal >= 100000 ? 0 : 15000; // Envío gratis por compras >$100k
        break;
      case 'MOTOTAXI':
        costoEnvio = 8000;
        break;
      case 'RECOGIDA_LOCAL':
        costoEnvio = 0;
        break;
      default:
        costoEnvio = 15000;
    }

    const total = subtotal + costoEnvio;

    // Generar número de pedido único
    const numeroPedido = `NR${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Crear el pedido en una transacción
    const pedido = await prisma.$transaction(async (tx) => {
      // Crear dirección de envío si es necesario
      let direccionEnvioId = null;
      if (direccionEnvio && metodoEnvio !== 'RECOGIDA_LOCAL') {
        const direccion = await tx.direccion.create({
          data: {
            usuarioId: session.usuarioId,
            nombre: direccionEnvio.nombre,
            telefono: direccionEnvio.telefono,
            departamento: direccionEnvio.departamento,
            ciudad: direccionEnvio.ciudad,
            direccion: direccionEnvio.direccion,
            codigoPostal: direccionEnvio.codigoPostal,
            referencia: direccionEnvio.referencia,
            esPrincipal: false,
          },
        });
        direccionEnvioId = direccion.id;
      }

      // Crear el pedido
      const nuevoPedido = await tx.pedido.create({
        data: {
          numero: numeroPedido,
          usuarioId: session.usuarioId,
          emailInvitado: !session.usuarioId ? emailInvitado : null,
          direccionEnvioId,
          subtotal,
          costoEnvio,
          total,
          estado: 'PENDIENTE',
          metodoPago,
          metodoEnvio,
          notas,
          items: {
            create: carritoItems.map(item => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnit: parseFloat(item.producto.precio),
              subtotal: parseFloat(item.producto.precio) * item.cantidad,
              variantes: item.variantes,
            })),
          },
        },
        include: {
          items: {
            include: {
              producto: true,
            },
          },
          direccionEnvio: true,
        },
      });

      // Actualizar stock de productos
      for (const item of carritoItems) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: {
            stock: {
              decrement: item.cantidad,
            },
          },
        });
      }

      // Limpiar carrito
      await tx.carritoItem.deleteMany({
        where: whereClause,
      });

      return nuevoPedido;
    });

    // Log del evento para analytics
    console.warn(`[ANALYTICS] Pedido creado: ${numeroPedido}, Total: $${total}, Items: ${carritoItems.length}`);

    return NextResponse.json({
      success: true,
      pedido: {
        numero: pedido.numero,
        total: pedido.total,
        estado: pedido.estado,
        items: pedido.items,
        metodoEnvio: pedido.metodoEnvio,
        costoEnvio: pedido.costoEnvio,
      },
      message: 'Pedido creado exitosamente',
    });

  } catch (error) {
    console.error('Error creando pedido:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 });
  }
}