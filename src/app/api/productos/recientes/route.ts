// src/app/api/productos/recientes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Calcular la fecha de hace 30 días
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    // Obtener productos creados en los últimos 30 días
    const productosRecientes = await prisma.producto.findMany({
      where: {
        createdAt: {
          gte: fechaLimite
        },
        disponible: true // Solo productos disponibles
      },
      include: {
        imagenes: {
          orderBy: {
            orden: 'asc'
          }
        },
        tienda: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Más recientes primero
      },
      take: 20 // Limitar a 20 productos
    });

    // Transformar los datos para el frontend
    const productosTransformados = productosRecientes.map(producto => ({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: parseFloat(producto.precio.toString()),
      precioAnterior: producto.precioAnterior ? parseFloat(producto.precioAnterior.toString()) : null,
      categoria: producto.categoria,
      imagenPrincipal: producto.imagenPrincipal,
      imagenes: producto.imagenes.map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        orden: img.orden
      })),
      videoUrl: producto.videoUrl,
      destacado: producto.destacado,
      disponible: producto.disponible,
      stock: producto.stock,
      sku: producto.sku,
      marca: producto.marca,
      condicion: producto.condicion,
      tags: producto.tags,
      createdAt: producto.createdAt.toISOString(),
      updatedAt: producto.updatedAt.toISOString(),
      tienda: producto.tienda
    }));

    return NextResponse.json({
      productos: productosTransformados,
      total: productosTransformados.length,
      fechaLimite: fechaLimite.toISOString()
    });

  } catch (error: unknown) {
    console.error("Error al obtener productos recientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}