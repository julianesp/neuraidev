// src/app/api/categorias/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categoriaUpdateSchema } from "../../productos/validators";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const categoria = await prisma.categoria.findUnique({ 
      where: { id } 
    });
    
    if (!categoria) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }
    
    return NextResponse.json(categoria);
  } catch (error: unknown) {
    console.error("Error fetching categoria:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const json = await req.json();
    const data = categoriaUpdateSchema.parse(json);

    const updated = await prisma.categoria.update({
      where: { id },
      data
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating categoria:", error);
    if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
      return NextResponse.json({ 
        error: "Datos inválidos", 
        details: 'errors' in error ? error.errors : [] 
      }, { status: 400 });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2025") {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json({ 
        error: "Ya existe una categoría con ese nombre o slug" 
      }, { status: 409 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.categoria.delete({ 
      where: { id } 
    });

    return NextResponse.json({ ok: true, message: "Categoría eliminada correctamente" });
  } catch (error: unknown) {
    console.error("Error deleting categoria:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2025") {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}