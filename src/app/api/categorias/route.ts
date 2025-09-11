// src/app/api/categorias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categoriaCreateSchema } from "../productos/validators";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: [{ orden: "asc" }, { nombre: "asc" }]
    });
    return NextResponse.json(categorias);
  } catch (error: unknown) {
    console.error("Error fetching categorias:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = categoriaCreateSchema.parse(json);

    const created = await prisma.categoria.create({
      data
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating categoria:", error);
    if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
      return NextResponse.json({ 
        error: "Datos inválidos", 
        details: 'errors' in error ? error.errors : [] 
      }, { status: 400 });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json({ 
        error: "Ya existe una categoría con ese nombre o slug" 
      }, { status: 409 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}