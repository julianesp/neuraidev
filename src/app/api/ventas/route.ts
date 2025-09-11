import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Forzar runtime de Node.js (necesario para Prisma)
export const runtime = 'nodejs';

const ventaItemSchema = z.object({
  productoId: z.string(),
  cantidad: z.number().min(1),
  precioUnit: z.number().min(0)
});

const ventaSchema = z.object({
  clienteId: z.string().optional(),
  cliente: z.object({
    nombre: z.string(),
    email: z.string().optional(),
    telefono: z.string().optional(),
    direccion: z.string().optional()
  }).optional(),
  items: z.array(ventaItemSchema),
  metodoPago: z.string(),
  notas: z.string().optional(),
  descuentos: z.number().default(0)
});

// GET - Obtener todas las ventas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const tiendaId = searchParams.get("tiendaId");
    const estado = searchParams.get("estado");
    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");

    const skip = (page - 1) * limit;

    const whereClause: {
      tiendaId?: string;
      estado?: string;
      fechaVenta?: { gte?: Date; lte?: Date };
    } = {};
    
    if (tiendaId) whereClause.tiendaId = tiendaId;
    if (estado) whereClause.estado = estado;
    
    if (fechaDesde || fechaHasta) {
      whereClause.fechaVenta = {};
      if (fechaDesde) whereClause.fechaVenta.gte = new Date(fechaDesde);
      if (fechaHasta) whereClause.fechaVenta.lte = new Date(fechaHasta);
    }

    const [ventas, total] = await Promise.all([
      prisma.venta.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          cliente: true,
          tienda: true,
          items: {
            include: {
              producto: true
            }
          }
        },
        orderBy: {
          fechaVenta: 'desc'
        }
      }),
      prisma.venta.count({ where: whereClause })
    ]);

    return NextResponse.json({
      ventas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: unknown) {
    console.error("Error obteniendo ventas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva venta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ventaSchema.parse(body);

    // Verificar que todos los productos existen y tienen stock suficiente
    const productos = await prisma.producto.findMany({
      where: {
        id: { in: validatedData.items.map(item => item.productoId) }
      }
    });

    if (productos.length !== validatedData.items.length) {
      return NextResponse.json(
        { error: "Algunos productos no existen" },
        { status: 400 }
      );
    }

    // Verificar stock
    for (const item of validatedData.items) {
      const producto = productos.find(p => p.id === item.productoId);
      if (!producto || producto.stock < item.cantidad) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${producto?.nombre || 'producto desconocido'}` },
          { status: 400 }
        );
      }
    }

    // Obtener la primera tienda activa
    const tienda = await prisma.tienda.findFirst({
      where: { activa: true }
    });

    if (!tienda) {
      return NextResponse.json(
        { error: "No hay tiendas activas" },
        { status: 400 }
      );
    }

    // Crear cliente si se proporciona información
    let cliente = null;
    if (validatedData.cliente) {
      cliente = await prisma.cliente.create({
        data: validatedData.cliente
      });
    } else if (validatedData.clienteId) {
      cliente = await prisma.cliente.findUnique({
        where: { id: validatedData.clienteId }
      });
    }

    // Calcular totales
    let subtotal = 0;
    const itemsData = validatedData.items.map(item => {
      const itemSubtotal = item.cantidad * item.precioUnit;
      subtotal += itemSubtotal;
      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnit: item.precioUnit,
        subtotal: itemSubtotal
      };
    });

    const descuentos = validatedData.descuentos || 0;
    const total = subtotal - descuentos;

    // Generar número de venta único
    const ultimaVenta = await prisma.venta.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    const numeroVenta = `V-${String((parseInt(ultimaVenta?.numero.split('-')[1] || '0') + 1)).padStart(6, '0')}`;

    // Crear la venta con transacción
    const venta = await prisma.$transaction(async (tx) => {
      // Crear la venta
      const nuevaVenta = await tx.venta.create({
        data: {
          numero: numeroVenta,
          clienteId: cliente?.id,
          tiendaId: tienda.id,
          subtotal,
          descuentos,
          total,
          metodoPago: validatedData.metodoPago,
          notas: validatedData.notas,
          items: {
            create: itemsData
          }
        },
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

      // Actualizar stock de productos
      for (const item of validatedData.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: {
            stock: {
              decrement: item.cantidad
            }
          }
        });
      }

      return nuevaVenta;
    });

    return NextResponse.json({
      venta,
      message: "Venta registrada exitosamente"
    });

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creando venta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}