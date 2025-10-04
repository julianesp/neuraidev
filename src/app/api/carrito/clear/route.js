import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getOrCreateUserSession } from '../../../../lib/auth-guest';

// DELETE - Limpiar todo el carrito
export async function DELETE(request) {
  try {
    const session = await getOrCreateUserSession(request);

    const whereClause = session.usuarioId
      ? { usuarioId: session.usuarioId }
      : { sesionId: session.id };

    const deletedCount = await prisma.carritoItem.deleteMany({
      where: whereClause,
    });

    return NextResponse.json({
      success: true,
      message: 'Carrito limpiado exitosamente',
      deletedItems: deletedCount.count,
    });
  } catch (error) {
    console.error('Error limpiando carrito:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 });
  }
}