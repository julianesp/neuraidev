// src/app/api/tiendas/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tiendaUpdateSchema } from "../../productos/validators";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const tienda = await prisma.tienda.findUnique({ 
      where: { id },
      include: {
        productos: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            imagenes: {
              take: 1,
              orderBy: { orden: "asc" }
            }
          }
        },
        _count: {
          select: { productos: true, ventas: true }
        }
      }
    });
    
    if (!tienda) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }
    
    return NextResponse.json(tienda);
  } catch (error: unknown) {
    console.error("Error fetching tienda:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const json = await req.json();
    const data = tiendaUpdateSchema.parse(json);

    const updated = await prisma.tienda.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { productos: true, ventas: true }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating tienda:", error);
    if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
      return NextResponse.json({ 
        error: "Datos inválidos", 
        details: 'errors' in error ? error.errors : [] 
      }, { status: 400 });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2025") {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Verificar si la tienda tiene productos asociados
    const productCount = await prisma.producto.count({
      where: { tiendaId: id }
    });

    if (productCount > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar una tienda que tiene productos asociados" 
      }, { status: 409 });
    }

    await prisma.tienda.delete({ 
      where: { id } 
    });

    return NextResponse.json({ ok: true, message: "Tienda eliminada correctamente" });
  } catch (error: unknown) {
    console.error("Error deleting tienda:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2025") {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}