// src/app/api/tiendas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tiendaCreateSchema } from "../productos/validators";

export async function GET() {
  try {
    const tiendas = await prisma.tienda.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: { productos: true, ventas: true }
        }
      }
    });
    return NextResponse.json(tiendas);
  } catch (error: unknown) {
    console.error("Error fetching tiendas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = tiendaCreateSchema.parse(json);

    const created = await prisma.tienda.create({
      data,
      include: {
        _count: {
          select: { productos: true, ventas: true }
        }
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating tienda:", error);
    if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
      return NextResponse.json({ 
        error: "Datos inválidos", 
        details: 'errors' in error ? error.errors : [] 
      }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}