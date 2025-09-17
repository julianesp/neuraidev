// src/app/api/productos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productoCreateSchema } from "./validators";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const categoria = url.searchParams.get("categoria");
    const destacado = url.searchParams.get("destacado");
    const disponible = url.searchParams.get("disponible");
    const tiendaId = url.searchParams.get("tiendaId");
    const search = url.searchParams.get("search");
    const condicion = url.searchParams.get("condicion");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (categoria) where.categoria = categoria;
    if (destacado !== null) where.destacado = destacado === "true";
    if (disponible !== null) where.disponible = disponible === "true";
    if (tiendaId) where.tiendaId = tiendaId;
    if (condicion) where.condicion = condicion;
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { descripcion: { contains: search, mode: "insensitive" } },
        { marca: { contains: search, mode: "insensitive" } },
        { tags: { has: search } }
      ];
    }

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: {
          imagenes: {
            orderBy: { orden: "asc" }
          },
          tienda: true
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit
      }),
      prisma.producto.count({ where })
    ]);

    return NextResponse.json({
      productos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    console.error("Error fetching productos:", error);

    // Información adicional para debugging en producción
    const errorInfo = {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? "SET" : "NOT_SET"
    };

    console.error("Detailed error info:", errorInfo);

    return NextResponse.json({
      error: "Error interno del servidor",
      debug: process.env.NODE_ENV === "development" ? errorInfo : undefined
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = productoCreateSchema.parse(json);

    const { imagenes, createdAt, updatedAt, ...productoData } = data;

    const createData = {
      ...productoData,
      precio: data.precio,
      precioAnterior: data.precioAnterior || null,
      imagenes: {
        create: imagenes.map((img, index) => ({
          url: img.url,
          alt: img.alt || "",
          orden: img.orden || index
        }))
      },
      ...(createdAt && { createdAt: new Date(createdAt) }),
      ...(updatedAt && { updatedAt: new Date(updatedAt) })
    };

    const created = await prisma.producto.create({
      data: createData,
      include: {
        imagenes: {
          orderBy: { orden: "asc" }
        },
        tienda: true
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating producto:", error);
    if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
      return NextResponse.json({
        error: "Datos inválidos",
        details: 'errors' in error ? error.errors : []
      }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}