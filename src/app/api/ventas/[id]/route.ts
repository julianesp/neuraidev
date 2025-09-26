import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE - Eliminar una venta específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ventaId } = await params;

    // Verificar que la venta existe
    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: {
        items: true
      }
    });

    if (!venta) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    // Usar transacción para eliminar la venta y restaurar el stock
    await prisma.$transaction(async (tx) => {
      // Restaurar el stock de los productos
      for (const item of venta.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: {
            stock: {
              increment: item.cantidad
            }
          }
        });
      }

      // Eliminar los items de la venta (se eliminan automáticamente por CASCADE)
      // Eliminar la venta
      await tx.venta.delete({
        where: { id: ventaId }
      });
    });

    return NextResponse.json({
      message: "Venta eliminada exitosamente"
    });

  } catch (error: unknown) {
    console.error("Error eliminando venta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener una venta específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ventaId } = await params;

    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: {
        cliente: true,
        tienda: true,
        items: {
          include: {
            producto: true
          }
        }
      }
    });

    if (!venta) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ venta });

  } catch (error: unknown) {
    console.error("Error obteniendo venta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}