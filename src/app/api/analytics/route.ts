import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener análisis de ventas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");
    const tiendaId = searchParams.get("tiendaId");

    // Definir rango de fechas
    const whereClause: {
      fechaVenta?: { gte?: Date; lte?: Date };
      tiendaId?: string;
    } = {};
    if (fechaDesde) whereClause.fechaVenta = { gte: new Date(fechaDesde) };
    if (fechaHasta) {
      if (whereClause.fechaVenta) {
        whereClause.fechaVenta.lte = new Date(fechaHasta);
      } else {
        whereClause.fechaVenta = { lte: new Date(fechaHasta) };
      }
    }
    if (tiendaId) whereClause.tiendaId = tiendaId;

    // 1. Productos más vendidos
    const productosMasVendidos = (await prisma.ventaItem.groupBy({
      by: ['productoId'],
      _sum: {
        cantidad: true,
        subtotal: true
      },
      where: {
        venta: whereClause
      }
    }))
      .sort((a, b) => (b._sum.cantidad || 0) - (a._sum.cantidad || 0))
      .slice(0, 20);

    // Obtener detalles de productos más vendidos
    const productosIds = productosMasVendidos.map(item => item.productoId);
    const productosDetalles = await prisma.producto.findMany({
      where: {
        id: { in: productosIds }
      },
      select: {
        id: true,
        nombre: true,
        precio: true,
        categoria: true,
        stock: true,
        marca: true,
        imagenPrincipal: true
      }
    });

    const productosMasVendidosConDetalles = productosMasVendidos.map(item => {
      const producto = productosDetalles.find(p => p.id === item.productoId);
      return {
        producto,
        cantidadVendida: item._sum.cantidad || 0,
        ingresoTotal: Number(item._sum.subtotal || 0),
        // Estimar ganancia (precio de venta menos 70% como costo estimado)
        gananciaEstimada: Number(item._sum.subtotal || 0) * 0.3
      };
    });

    // 2. Resumen de ventas por período
    const resumenVentas = await prisma.venta.aggregate({
      where: whereClause,
      _sum: {
        total: true,
        subtotal: true,
        descuentos: true
      },
      _count: {
        id: true
      }
    });

    // 3. Ventas por categoría
    const ventasPorCategoria = await prisma.ventaItem.groupBy({
      by: ['productoId'],
      _sum: {
        cantidad: true,
        subtotal: true
      },
      where: {
        venta: whereClause
      }
    });

    // Obtener productos con sus categorías
    const productosConCategorias = await prisma.producto.findMany({
      where: {
        id: { in: ventasPorCategoria.map(v => v.productoId) }
      },
      select: {
        id: true,
        categoria: true
      }
    });

    // Agrupar por categoría
    const categoriaStats: { [key: string]: { cantidad: number; ingresos: number; }; } = {};
    ventasPorCategoria.forEach(venta => {
      const producto = productosConCategorias.find(p => p.id === venta.productoId);
      const categoria = producto?.categoria || 'Sin categoría';

      if (!categoriaStats[categoria]) {
        categoriaStats[categoria] = { cantidad: 0, ingresos: 0 };
      }

      categoriaStats[categoria].cantidad += Number(venta._sum.cantidad || 0);
      categoriaStats[categoria].ingresos += Number(venta._sum.subtotal || 0);
    });

    const ventasPorCategoriaArray = Object.entries(categoriaStats).map(([categoria, stats]) => ({
      categoria,
      ...stats
    }));

    // 4. Productos con bajo stock (menos de 5 unidades)
    const productosBajoStock = await prisma.producto.findMany({
      where: {
        stock: {
          lte: 5
        },
        disponible: true
      },
      select: {
        id: true,
        nombre: true,
        stock: true,
        categoria: true,
        precio: true,
        imagenPrincipal: true
      },
      orderBy: {
        stock: 'asc'
      },
      take: 20
    });

    // 5. Tendencias de ventas diarias (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const ventasDiarias = await prisma.venta.groupBy({
      by: ['fechaVenta'],
      _sum: {
        total: true
      },
      _count: {
        id: true
      },
      where: {
        ...whereClause,
        fechaVenta: {
          gte: hace30Dias
        }
      },
      orderBy: {
        fechaVenta: 'desc'
      }
    });

    // Formatear fechas para las tendencias
    const tendenciasDiarias = ventasDiarias.map(venta => ({
      fecha: venta.fechaVenta.toISOString().split('T')[0], // Solo la fecha
      ventasCount: venta._count.id,
      ingresosTotales: venta._sum.total || 0
    }));

    // 6. Clientes más frecuentes
    const clientesFrecuentes = await prisma.venta.groupBy({
      by: ['clienteId'],
      _count: {
        id: true
      },
      _sum: {
        total: true
      },
      where: {
        ...whereClause,
        clienteId: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Obtener detalles de clientes
    const clientesIds = clientesFrecuentes
      .map(item => item.clienteId)
      .filter((id): id is string => id !== null);

    const clientesDetalles = await prisma.cliente.findMany({
      where: {
        id: { in: clientesIds }
      }
    });

    const clientesFrecuentesConDetalles = clientesFrecuentes.map(item => {
      const cliente = clientesDetalles.find(c => c.id === item.clienteId);
      return {
        cliente,
        comprasCount: item._count.id,
        totalGastado: item._sum.total || 0
      };
    });

    return NextResponse.json({
      productosMasVendidos: productosMasVendidosConDetalles,
      resumenVentas: {
        totalVentas: resumenVentas._count.id || 0,
        ingresosBrutos: Number(resumenVentas._sum.total || 0),
        subtotal: Number(resumenVentas._sum.subtotal || 0),
        descuentos: Number(resumenVentas._sum.descuentos || 0),
        gananciaEstimada: Number(resumenVentas._sum.total || 0) * 0.3 // Estimar 30% de margen
      },
      ventasPorCategoria: ventasPorCategoriaArray.sort((a, b) => b.ingresos - a.ingresos),
      productosBajoStock,
      tendenciasDiarias: tendenciasDiarias.slice(0, 30),
      clientesFrecuentes: clientesFrecuentesConDetalles,
      periodo: {
        desde: fechaDesde,
        hasta: fechaHasta
      }
    });

  } catch (error) {
    console.error("Error obteniendo analytics:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}