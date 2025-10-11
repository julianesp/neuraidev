// src/app/api/productos/recientes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface Producto {
  id: number | string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioAnterior?: number;
  categoria: string;
  imagenPrincipal?: string;
  imagenes?: Array<{ url: string; alt?: string }>;
  videoUrl?: string;
  destacado?: boolean;
  disponible?: boolean;
  stock?: number;
  sku?: string;
  marca?: string;
  condicion?: string;
  estado?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  cantidad?: number;
  fechaIngreso?: string;
}

async function leerTodosLosProductos(): Promise<Producto[]> {
  const archivos = [
    "celulares.json",
    "computadoras.json",
    "librosusados.json",
    "librosnuevos.json",
    "generales.json",
    "damas.json",
    "bicicletas.json",
  ];

  let todosLosProductos: Producto[] = [];

  for (const archivo of archivos) {
    try {
      const filePath = path.join(process.cwd(), "public", archivo);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(fileContent);
      if (data.accesorios) {
        todosLosProductos = todosLosProductos.concat(data.accesorios);
      }
    } catch (err) {
      console.warn(`No se pudo leer ${archivo}:`, err);
    }
  }

  return todosLosProductos;
}

export async function GET(request: NextRequest) {
  try {
    const productos = await leerTodosLosProductos();

    // Normalizar y filtrar productos
    const productosNormalizados = productos
      .map((p) => ({
        ...p,
        stock: p.cantidad || p.stock || 0,
        disponible: p.disponible !== undefined ? p.disponible : (p.cantidad || 0) > 0,
        condicion: p.condicion || p.estado || "nuevo",
        createdAt: p.createdAt || p.fechaIngreso || new Date().toISOString(),
        imagenes: p.imagenes || (p.imagenPrincipal ? [{ url: p.imagenPrincipal }] : []),
      }))
      .filter((p) => p.disponible === true); // Solo disponibles

    // Ordenar por fecha de creación (más recientes primero)
    productosNormalizados.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Tomar los primeros 20
    const productosRecientes = productosNormalizados.slice(0, 20);

    return NextResponse.json({
      productos: productosRecientes,
      total: productosRecientes.length,
    });
  } catch (error: unknown) {
    console.error("Error al obtener productos recientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
