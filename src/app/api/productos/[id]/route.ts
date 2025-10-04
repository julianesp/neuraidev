// src/app/api/productos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productoUpdateSchema } from "../validators";
import { requireAdminAuth } from "../../../../lib/auth";

// Configuración de runtime para Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const producto = await prisma.producto.findUnique({ 
      where: { id },
      include: {
        imagenes: {
          orderBy: { orden: "asc" }
        },
        tienda: true
      }
    });
    
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json(producto);
  } catch (error: unknown) {
    console.error("Error fetching producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Verificar autenticación de admin
    const authCheck = requireAdminAuth(req);
    if (!authCheck.allowed) {
      return NextResponse.json(
        { error: authCheck.reason || "No autorizado" },
        { status: 401 }
      );
    }

    const json = await req.json();
    const data = productoUpdateSchema.parse(json);

    const { imagenes, createdAt, updatedAt, ...productoData } = data;

    // Primero verificar si el producto existe
    const existingProduct = await prisma.producto.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Preparar la data de actualización
    const updateData: Record<string, unknown> = {
      ...productoData
    };

    // Si hay precio, convertir a Decimal
    if (data.precio !== undefined) {
      updateData.precio = data.precio;
    }
    if (data.precioAnterior !== undefined) {
      updateData.precioAnterior = data.precioAnterior;
    }

    // Agregar fechas personalizadas si están presentes
    if (createdAt) {
      updateData.createdAt = new Date(createdAt);
    }
    if (updatedAt) {
      updateData.updatedAt = new Date(updatedAt);
    }

    // Si se incluyen imágenes, actualizar también
    if (imagenes) {
      updateData.imagenes = {
        deleteMany: {},
        create: imagenes.map((img, index) => ({
          url: img.url,
          alt: img.alt || "",
          orden: img.orden || index
        }))
      };
    }

    const updated = await prisma.producto.update({
      where: { id },
      data: updateData,
      include: {
        imagenes: {
          orderBy: { orden: "asc" }
        },
        tienda: true
      }
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating producto:", error);
    if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
      return NextResponse.json({ 
        error: "Datos inválidos", 
        details: 'errors' in error ? error.errors : [] 
      }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Verificar autenticación de admin
    const authCheck = requireAdminAuth(req);
    if (!authCheck.allowed) {
      return NextResponse.json(
        { error: authCheck.reason || "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar si el producto existe
    const existingProduct = await prisma.producto.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Eliminar el producto (las imágenes se eliminan automáticamente por el cascade)
    await prisma.producto.delete({ 
      where: { id } 
    });

    return NextResponse.json({ ok: true, message: "Producto eliminado correctamente" });
  } catch (error: unknown) {
    console.error("Error deleting producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}